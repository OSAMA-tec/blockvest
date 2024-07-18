import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NFTDocument = NFT & Document;

@Schema({ timestamps: true })
export class NFT {
  @Prop({ required: true, unique: true })
  tokenId: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  image: string;

  @Prop()
  externalUrl: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId;

  @Prop({ required: true })
  contractAddress: string;

  @Prop()
  tokenStandard: string;

  @Prop()
  blockchain: string;

  @Prop({ type: Object })
  metadata: Record<string, any>;

  @Prop()
  rarity: number;

  @Prop({ type: [String] })
  traits: string[];

  @Prop()
  creatorRoyaltyPercentage: number;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  creator: Types.ObjectId;

  @Prop()
  mintDate: Date;

  @Prop()
  lastSalePrice: number;

  @Prop()
  lastSaleDate: Date;

  @Prop({ default: false })
  isListed: boolean;

  @Prop()
  listingPrice: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Transaction' }] })
  transactionHistory: Types.ObjectId[];
}

export const NFTSchema = SchemaFactory.createForClass(NFT);
