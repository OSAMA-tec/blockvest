// src/services/email/email.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './email.service';
import { RedisService } from '../queue/redis.service';

@Module({
  imports: [ConfigModule],
  providers: [EmailService, RedisService],
  exports: [EmailService],
})
export class EmailModule {}
