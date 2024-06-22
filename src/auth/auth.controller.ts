import { Controller, Body, Post } from '@nestjs/common';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { AuthService } from './auth.service';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }
}
