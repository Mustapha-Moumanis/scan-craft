// src/storage/storage.service.ts
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class StorageService {
  deleteFile(filePath: string) {
    // if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
}
