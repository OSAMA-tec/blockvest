import { Controller, Body, Post, Get, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { UsersService } from './users.service';
import { CreateUserDto } from '../auth/dto/create-user.dto';
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Post('updateProfile')
  async updateProfile(@Req() req, @Body() updateData: Partial<CreateUserDto>) {
    const userId = req.user.userId;
    return this.usersService.update(userId, updateData);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req) {
    const userId = req.user.userId;
    return this.usersService.getProfile(userId);
  }
}
