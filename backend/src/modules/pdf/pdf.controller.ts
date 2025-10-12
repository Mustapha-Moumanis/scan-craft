import {
  Controller,
  HttpStatus,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
  Sse,
  Get,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PdfApiDecorators } from './decorators/swagger.decorators';
import { PdfService } from './pdf.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Observable } from 'rxjs';
import { MessageEvent } from '@nestjs/common';

@Controller('pdf')
export class PdfController {
  constructor(
    private readonly pdfService: PdfService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post('upload')
  @PdfApiDecorators.uploadPdf()
  @UseInterceptors(FileInterceptor('file'))
  async uploadPdf(@Res() res: any, @UploadedFile() file: any) {
    try {
      // Generate unique filename for tracking
      const baseName = file.originalname.replace(/\.[^/.]+$/, '');
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const fileName = `${baseName}-${uniqueSuffix}.pdf`;

      // Respond immediately
      res.status(HttpStatus.OK).json({
        message: 'PDF upload received',
        fileName,
      });

      // Process asynchronously using the buffer
      setImmediate(() => {
        this.pdfService.processPdf(file.buffer, fileName);
      });
    } catch (error) {
      console.log(error);
      res.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'An error occurred while processing the PDF',
      });
    }
  }

  // Server-Sent Events endpoint to stream progress updates to the client
  @Get('progress')
  getProgress(@Query('fileName') fileName: string, @Res() res: any) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (!fileName) {
      res.status(400).end('fileName query parameter is required');
      return;
    }

    const sendProgress = (data: any) => {
      if (data.fileName === fileName) {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      }
    };

    // Check initial progress
    const initialProgress = this.pdfService.getProgress(fileName);

    if (initialProgress.status === 'unknown') {
      // Set up a timeout to check if progress appears within a certain time
      const checkInterval = setInterval(() => {
        const currentProgress = this.pdfService.getProgress(fileName);
        if (currentProgress.status !== 'unknown') {
          clearInterval(checkInterval);
          sendProgress({ fileName, ...currentProgress });
        }
      }, 1000); // Check every second

      // Timeout after 30 seconds if no progress is found
      setTimeout(() => {
        clearInterval(checkInterval);
        const finalProgress = this.pdfService.getProgress(fileName);
        if (finalProgress.status === 'unknown') {
          res.write(
            `data: ${JSON.stringify({
              fileName,
              progress: 0,
              status: 'timeout',
              message: 'No progress detected. The file may not be processing.',
            })}\n\n`,
          );
          res.end();
        }
      }, 8000);
    } else {
      // Send initial progress if found
      sendProgress({ fileName, ...initialProgress });
    }

    // Listen for progress events
    this.pdfService['eventEmitter'].on('qr.progress', sendProgress);

    // Clean up on client disconnect
    res.on('close', () => {
      this.pdfService['eventEmitter'].off('qr.progress', sendProgress);
      res.end();
    });
  }

  @Get('results')
  async getResults(@Query('fileName') fileName: string) {
    if (!fileName) {
      throw new BadRequestException('fileName query parameter is required');
    }
    return await this.pdfService.getResultsByFileName(fileName);
  }

  @Get('history')
  async getHistoryFiles(@Res() res: any) {
	try {
		const result =  await this.pdfService.getHistory();
		res.status(HttpStatus.OK).json(result);
	} catch (err) {
		res.status(err.status|| HttpStatus.BAD_REQUEST).json({
			message: 'Unexpected Error',
			error: err.message
		})
	}
  }
}
