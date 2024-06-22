import { Module } from '@nestjs/common';
import { NftsService } from './nfts.service';
import { NftsController } from './nfts.controller';

@Module({
  providers: [NftsService],
  controllers: [NftsController]
})
export class NftsModule {}
