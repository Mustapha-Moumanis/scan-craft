import {
  Injectable,
  BadRequestException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Model } from 'mongoose';
import { QrResult } from './entities/qr-result.entity';
import { extractImages, getDocumentProxy } from 'unpdf';
import sharp from 'sharp';
import jsQR from 'jsqr';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);
  private readonly processingFiles = new Map<
    string,
    { progress: number; status: string; message: string }
  >();

  constructor(
    @InjectModel(QrResult.name) private readonly qrModel: Model<QrResult>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /** Main PDF processing entrypoint - processes PDF from memory buffer */
  async processPdf(pdfBuffer: Buffer, fileName: string) {
    // Initialize progress tracking for this file
    this.processingFiles.set(fileName, {
      progress: 0,
      status: 'processing',
      message: 'Starting processing',
    });

    try {
      const pdf = await getDocumentProxy(new Uint8Array(pdfBuffer));
      const totalPages = pdf.numPages;

      this.logger.log(
        `📄 Processing PDF "${fileName}" with ${totalPages} pages (in-memory)`,
      );

      const seenQrs = new Set<string>();
      const allResults: QrResult[] = [];

      for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
        const pageResults = await this.processPage(
          pdf,
          fileName,
          pageNumber,
          totalPages,
          seenQrs,
        );
        allResults.push(...pageResults);

        // Update progress after each page
        const progress = Math.round((pageNumber / totalPages) * 100);
        this.updateProgress(
          fileName,
          progress,
          'processing',
          `Processed page ${pageNumber}/${totalPages}`,
        );
      }

      // Cleanup memory
      seenQrs.clear();

      // Mark as complete
      this.updateProgress(
        fileName,
        100,
        'done',
        `Finished processing. Found ${allResults.length} QR codes`,
      );

      this.logger.log(
        `🎉 Finished processing PDF "${fileName}". Found ${allResults.length} QR code images`,
      );

      // Clean up progress tracking after a delay
      setTimeout(() => {
        this.processingFiles.delete(fileName);
      }, 5000);

      return allResults;
    } catch (error) {
      this.logger.error('❌ PDF processing failed:', error);
      this.updateProgress(fileName, 0, 'error', 'Processing failed');
      throw new BadRequestException('Failed to process PDF');
    }
  }

  async getHistory() {
    return await this.qrModel.aggregate([
      {
        $group: {
          _id: '$fileName',
          fileName: { $first: '$fileName' },
          qrCount: { $sum: 1 },
          processedAt: { $max: '$createdAt' },
          validCount: {
            $sum: { $cond: [{ $eq: ['$status', 'VALID'] }, 1, 0] }
          },
          invalidCount: {
            $sum: { $cond: [{ $eq: ['$status', 'INVALID'] }, 1, 0] }
          },
          unreadableCount: {
            $sum: { $cond: [{ $eq: ['$status', 'UNREADABLE'] }, 1, 0] }
          },
          duplicateCount: {
            $sum: { $cond: [{ $eq: ['$status', 'DUPLICATE'] }, 1, 0] }
          }
        }
      },
      {
        $sort: { processedAt: -1 } // Sort by most recent first
      },
      {
        $project: {
          _id: 0,
          fileName: 1,
          qrCount: 1,
          processedAt: 1,
          validCount: 1,
          invalidCount: 1,
          unreadableCount: 1,
          duplicateCount: 1
        }
      }
    ]).exec();
  }

  /** Get progress for a specific file */
  getProgress(fileName: string) {
    return (
      this.processingFiles.get(fileName) || {
        progress: 0,
        status: 'unknown',
        message: 'File not found',
      }
    );
  }

  /** Get all progress events for SSE */
  getAllProgress() {
    return Array.from(this.processingFiles.entries()).map(
      ([fileName, data]) => ({
        fileName,
        ...data,
      }),
    );
  }

  async getResultsByFileName(fileName: string): Promise<QrResult[]> {
    console.log('Fetching results for file:', fileName);
    const res = await this.qrModel.find({ fileName }).exec();
    // Return empty array instead of throwing error when no results found
    return res || [];
  }

  /** Update progress and emit SSE event */
  private updateProgress(
    fileName: string,
    progress: number,
    status: string,
    message: string,
  ) {
    this.processingFiles.set(fileName, { progress, status, message });

    // Emit SSE event
    this.eventEmitter.emit('qr.progress', {
      fileName,
      progress,
      status,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  /** Process a single page: extract images, decode QRs, save results */
  private async processPage(
    pdf: any,
    fileName: string,
    pageNumber: number,
    totalPages: number,
    seenQrs: Set<string>,
  ) {
    const images = await extractImages(pdf, pageNumber);
    this.logger.log(`🖼️ Page ${pageNumber}: found ${images.length} image(s)`);

    const pageResults: QrResult[] = [];
	

    for (let i = 0; i < images.length; i++) {
      const imgData = images[i];
      const processResult = await this.processImage(
        imgData,
        fileName,
        pageNumber,
        seenQrs,
      );

      // Check if processResult is not null and isQrCode is true
      if (processResult && processResult.isQrCode) {
        pageResults.push(processResult.result);

        // Emit an event for each QR code image result
        this.eventEmitter.emit('qr.result.created', {
          fileName,
          pageNumber,
          qrValue: processResult.result.qrValue,
          status: processResult.result.status,
          imageBase64: processResult.result.imageBase64,
        });
      } else {
        this.logger.log(
          `⏩ Skipped non-QR image on page ${pageNumber}, image ${i + 1}`,
        );
      }
    }

    return pageResults;
  }

  /** Convert image → detect if it's QR → decode QR → save result */
//   private async processImage(
//     imgData: any,
//     fileName: string,
//     pageNumber: number,
//     seenQrs: Set<string>,
//   ): Promise<{ result: QrResult | null; isQrCode: boolean } | null> {
//     try {
//       // Convert image to PNG buffer
//       const pngBuffer = await this.convertToPng(imgData);

//       // First, detect if this image is likely a QR code
//       const isQrCode = await this.detectQrCode(pngBuffer);

//       // If it's not a QR code image, skip it
//       if (!isQrCode) {
//         return null;
//       }

//       const imageBase64 = this.toBase64(pngBuffer);

//       // Try to decode the QR code
//       const qrValue = await this.decodeQr(pngBuffer);

//       // Determine QR status - check both fileName and qrValue
//       const status = qrValue
//         ? await this.determineStatus(qrValue, seenQrs, fileName)
//         : 'UNREADABLE';

//       // Save result in DB - only for actual QR code images
//       const qrResult = new this.qrModel({
//         fileName,
//         pageNumber,
//         qrValue,
//         status,
//         imageBase64,
//       });

//       await qrResult.save();
//       return { result: qrResult, isQrCode: true };
//     } catch (error) {
//       this.logger.error(`Error processing image on page ${pageNumber}:`, error);
//       return null;
//     }
//   }

  /** Convert image → detect if it's QR → decode QR → save result */
  private async processImage(
	imgData: any,
	fileName: string,
	pageNumber: number,
	seenQrs: Set<string>,
  ): Promise<{ result: QrResult; isQrCode: boolean }> {
	try {
	  // Convert image to PNG buffer
	  const pngBuffer = await this.convertToPng(imgData);
	  const imageBase64 = this.toBase64(pngBuffer);
  
	  // Detect QR-like structure
	  const isQrCode = await this.detectQrCode(pngBuffer);
  
	  let qrValue: string | null = null;
	  let status = 'INVALID';
  
	  if (isQrCode) {
		qrValue = await this.decodeQr(pngBuffer);
		status = qrValue
		  ? await this.determineStatus(qrValue, seenQrs, fileName)
		  : 'UNREADABLE';
	  }
  
	  // Always save result, even if invalid
	  const qrResult = new this.qrModel({
		fileName,
		pageNumber,
		qrValue,
		status,
		imageBase64,
	  });
  
	  await qrResult.save();
  
	  return { result: qrResult, isQrCode };
	} catch (error) {
	  this.logger.error(`Error processing image on page ${pageNumber}:`, error);
  
	  // Save an INVALID entry if processing fails
	  const qrResult = new this.qrModel({
		fileName,
		pageNumber,
		qrValue: null,
		status: 'INVALID',
		imageBase64: null,
	  });
	  await qrResult.save();
  
	  return { result: qrResult, isQrCode: false };
	}
  }
  
  /** Detect if an image is likely a QR code based on characteristics */
  private async detectQrCode(pngBuffer: Buffer): Promise<boolean> {
    try {
      const { data, info } = await sharp(pngBuffer)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

      // QR codes have specific characteristics:
      // 1. Square aspect ratio (or close to it)
      const aspectRatio = info.width / info.height;
      const isSquare = aspectRatio >= 0.9 && aspectRatio <= 1.1;

      // 2. QR codes typically have three position markers (finder patterns)
      // 3. They have high contrast and specific patterns

      // Simple detection: square aspect ratio and try to decode
      // If it's square and jsQR can attempt to read it (even if it fails), it's likely a QR
      if (isSquare) {
        const qrCode = jsQR(new Uint8ClampedArray(data.buffer), info.width, info.height);
        // Even if decoding fails, if jsQR attempted to process it (found some patterns),
        // consider it a QR code
        return (
          qrCode !== null || this.hasQrPatterns(new Uint8ClampedArray(data.buffer), info.width, info.height)
        );
      }

      return false;
    } catch (error) {
      this.logger.warn('Failed to detect QR code pattern');
      return false;
    }
  }

  /** Basic QR pattern detection (finder patterns) */
  private hasQrPatterns(
    data: Uint8ClampedArray,
    width: number,
    height: number,
  ): boolean {
    // Simplified check for QR code finder patterns
    // Real implementation would be more sophisticated
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);

    // Check a few points for high contrast (typical of QR codes)
    let contrastPoints = 0;
    const samplePoints = [
      [centerX - 10, centerY - 10],
      [centerX, centerY],
      [centerX + 10, centerY + 10],
    ];

    for (const [x, y] of samplePoints) {
      if (x >= 0 && x < width && y >= 0 && y < height) {
        const idx = (y * width + x) * 4;
        const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
        if (brightness < 50 || brightness > 200) {
          // Very dark or very light
          contrastPoints++;
        }
      }
    }

    return contrastPoints >= 2; // If at least 2 points have high contrast
  }

  /** Convert raw image to PNG buffer */
  private async convertToPng(imgData: any): Promise<Buffer> {
    return sharp(imgData.data, {
      raw: {
        width: imgData.width,
        height: imgData.height,
        channels: imgData.channels,
      },
    })
      .png()
      .toBuffer();
  }

  /** Decode QR from PNG buffer */
  private async decodeQr(pngBuffer: Buffer): Promise<string | null> {
    try {
      const { data, info } = await sharp(pngBuffer)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

      const qrCode = jsQR(data, info.width, info.height);
      return qrCode?.data
        ? qrCode.data.trim().toLowerCase().replace(/\s+/g, '')
        : null;
    } catch (error) {
      this.logger.warn('Failed to decode QR code');
      return null;
    }
  }

  /** Decide the status (VALID / DUPLICATE) */
  private determineStatus(
    qrValue: string,
    seenQrs: Set<string>,
    fileName: string,
  ): Promise<string> {
    // Create a unique key combining fileName and qrValue
    const uniqueKey = `${fileName}:${qrValue}`;

    // Check in-memory duplicates for this processing session
    if (seenQrs.has(uniqueKey)) return Promise.resolve('DUPLICATE');

    seenQrs.add(uniqueKey);
    return Promise.resolve('VALID');
  }

  /** Convert PNG buffer to base64 with MIME prefix */
  private toBase64(buffer: Buffer): string {
    return `data:image/png;base64,${buffer.toString('base64')}`;
  }
}
