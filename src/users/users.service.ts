import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { CreateUserDto } from '../auth/dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async update(userId: string,
    updateData: Partial<CreateUserDto>,
  ): Promise<User> {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Remove fields that shouldn't be updated directly
    const protectedFields = [
      'password',
      'role',
      'isVerified',
      'otp',
      'otpExpires',
    ];
    protectedFields.forEach((field) => delete updateData[field]);

    // Update only the fields that are provided in the updateData
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined) {
        user[key] = updateData[key];
      }
    });

    user.updatedAt = new Date();

    await user.save();
    return user;
  }

  async getProfile(userId: string): Promise<User> {
    const user = await this.userModel.findById(userId).select('-password -otp -otpExpires');

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }
}
