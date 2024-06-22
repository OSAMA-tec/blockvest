// src/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthResolver } from './auth.resolver';
import { User, UserSchema } from '../schemas/user.schema';
import { EmailModule } from '../services';
import { VerifyService } from './verify.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    EmailModule,
  ],
  providers: [AuthService, AuthResolver, VerifyService],
  controllers: [AuthController],
  exports: [AuthService, VerifyService],
})
export class AuthModule {}
