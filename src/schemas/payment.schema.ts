import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.schema';

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: true })
export class Payment {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true,
    enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer'],
  })
  paymentMethod: string;

  @Prop({ required: true })
  currency: string;

  @Prop({ required: true })
  status: string;

  @Prop()
  transactionId: string;

  @Prop()
  paymentIntentId: string;

  @Prop()
  paymentDate: Date;

  @Prop()
  description: string;

  @Prop({ type: Object })
  metadata: Record<string, any>;

  @Prop()
  errorMessage: string;

  @Prop()
  refundedAmount: number;

  @Prop()
  refundDate: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
