import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QrResult, QrResultSchema } from './entities/qr-result.entity';
import { ProcessedFile, ProcessedFileSchema } from './entities/processed-file.entity';
import { PdfController } from './pdf.controller';
import { PdfService } from './pdf.service';
import { StorageModule } from '../storage/storage.module';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Module({
  imports: [
    StorageModule,
    MongooseModule.forFeature([
      { name: QrResult.name, schema: QrResultSchema },
      { name: ProcessedFile.name, schema: ProcessedFileSchema },
    ]),
  ],
  controllers: [PdfController],
  providers: [PdfService, EventEmitter2],
  exports: [],
})
export class PdfModule {}
