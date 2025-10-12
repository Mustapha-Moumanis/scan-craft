// src/storage/storage.module.ts
import { BadRequestException, Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { StorageService } from './storage.service';

@Module({
  imports: [
    MulterModule.register({
      storage: memoryStorage(), // Store files in memory as Buffer
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(pdf)$/)) {
          return callback(new BadRequestException('Only PDF files are allowed!'), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
      },
    }),
  ],
  providers: [StorageService],
  exports: [MulterModule, StorageService],
})
export class StorageModule {}
