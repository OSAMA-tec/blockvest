import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';

@Injectable()
export class VerifyService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async verifyOtp(email: string, otp: string): Promise<boolean> {
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
    return true;
  }
}
