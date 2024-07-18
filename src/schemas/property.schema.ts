import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PropertyDocument = Property & Document;

@Schema({ timestamps: true })
export class Property {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  status: string;

  @Prop({ required: true })
  price: number;

  @Prop()
  area: number;

  @Prop()
  bedrooms: number;

  @Prop()
  bathrooms: number;

  @Prop()
  garage: number;

  @Prop({ type: [String] })
  amenities: string[];

  @Prop({
    type: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
    },
  })
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };

  @Prop({ type: [Number], index: '2dsphere' })
  location: [number, number];

  @Prop({ type: [String] })
  images: string[];

  @Prop({ type: Types.ObjectId, ref: 'User' })
  owner: Types.ObjectId;

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop({ default: true })
  isActive: boolean;
}

export const PropertySchema = SchemaFactory.createForClass(Property);
