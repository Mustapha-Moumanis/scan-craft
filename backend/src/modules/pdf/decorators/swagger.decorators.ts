// src/pdf/decorators/pdf-api.decorators.ts
import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger';

export class PdfApiDecorators {
  static uploadPdf() {
    return applyDecorators(
      ApiOperation({ summary: 'Upload a PDF file and extract QR codes' }),
      ApiConsumes('multipart/form-data'),
      ApiBody({
        schema: {
          type: 'object',
          properties: {
            file: {
              type: 'string',
              format: 'binary',
              description: 'PDF file containing QR codes to process',
            },
          },
        },
      }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'PDF processed successfully. Returns an array of results.',
      }),
      ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid file upload' }),
      ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Server error' }),
    );
  }
}
