import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User, UserSchema } from '../schemas/user.schema';
import { EmailModule } from '../services';
import { VerifyService } from './verify.service';
import { JwtAuthModule } from './jwt/jwt.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    EmailModule,
    JwtAuthModule,
  ],
  providers: [AuthService, VerifyService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
