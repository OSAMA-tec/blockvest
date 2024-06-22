import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import { JwtService } from '../auth/jwt/jwt.service';

@Injectable()
export class VerifyService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async verifyOtp(email: string, otp: string): Promise<{ token: string }> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new BadRequestException('User not Found');
    }
    if (user.otp !== otp) {
      throw new BadRequestException('Invalid Otp');
    }
    if (user.otpExpires < new Date()) {
      throw new BadRequestException('Otp Time Expire');
    }

    await this.userModel.updateOne(
      { _id: user._id },
      { $set: { isVerified: true }, $unset: { otp: 1, otpExpires: 1 } },
    );

    const payload = { email: user.email, _id: user._id, role: user.role };
    const token = await this.jwtService.generateToken(payload);

    return { token };
  }
}
