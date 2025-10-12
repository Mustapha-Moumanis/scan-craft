import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class QrResult extends Document {
  @Prop()
  fileName: string;

  @Prop()
  pageNumber: number;

  @Prop()
  qrValue: string;

  @Prop({ enum: ['VALID', 'INVALID', 'UNREADABLE', 'DUPLICATE'] })
  status: string;

  @Prop()
  imageBase64: string;
}

export const QrResultSchema = SchemaFactory.createForClass(QrResult);
