import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Embedded QR code subdocument
@Schema({ _id: false })
export class QrCode {
  @Prop({ required: true })
  pageNumber: number;

  @Prop()
  qrValue: string;

  @Prop({ enum: ['VALID', 'INVALID', 'UNREADABLE', 'DUPLICATE'], required: true })
  status: string;

  @Prop()
  imageBase64: string;
}

export const QrCodeSchema = SchemaFactory.createForClass(QrCode);

// Main document - one per file
@Schema({ timestamps: true })
export class ProcessedFile extends Document {
  @Prop({ required: true, unique: true, index: true })
  fileName: string;

  @Prop({ type: [QrCodeSchema], default: [] })
  qrCodes: QrCode[];

  @Prop({ default: 0 })
  validCount: number;

  @Prop({ default: 0 })
  invalidCount: number;

  @Prop({ default: 0 })
  unreadableCount: number;

  @Prop({ default: 0 })
  duplicateCount: number;

  @Prop({ default: 0 })
  totalCount: number;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const ProcessedFileSchema = SchemaFactory.createForClass(ProcessedFile);

// Create index for faster queries
ProcessedFileSchema.index({ createdAt: -1 });

