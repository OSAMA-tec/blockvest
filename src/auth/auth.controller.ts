import { Controller, Body, Post } from '@nestjs/common';
import { CreateUserDto, VerifyOtpDto } from '../auth/dto/create-user.dto';
import { AuthService } from './auth.service';
import { VerifyService } from './verify.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly verifyService: VerifyService,
  ) {}
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }
  @Post('verify-otp')
  async verifyotp(@Body() verifyOtpdto: VerifyOtpDto) {
    const { email, otp } = verifyOtpdto;
    return this.verifyService.verifyOtp(email, otp);
  }
}
