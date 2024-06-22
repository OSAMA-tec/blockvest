import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument, User } from '../schemas/user.schema';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { EmailService } from '../services';

export interface UserWithoutPassword extends Omit<User, 'password'> {
  id: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private emailService: EmailService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserWithoutPassword> {
    try {
      // Check if user already exists
      const existingUser = await this.userModel
        .findOne({ email: createUserDto.email })
        .exec();
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      // Validate password strength
      if (!this.isPasswordStrong(createUserDto.password)) {
        throw new BadRequestException('Password is not strong enough');
      }

      // Hash password
      const hashedPassword = await this.hashPassword(
        createUserDto.password,
        10,
      );

      // Generate OTP
      const otp = this.generateOTP();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes
      console.log('otp: ', otp);
      // Create new user
      const createdUser = new this.userModel({
        ...createUserDto,
        password: hashedPassword,
        otp,
        otpExpires,
      });
      console.log('createdUser: ', createdUser);
      // Save user to database
      const savedUser = await createdUser.save();

      // Send OTP email
      await this.sendOTPEmail(savedUser.email, otp);

      const { password, ...result } = savedUser.toObject();
      return { ...result, id: savedUser._id.toString() } as UserWithoutPassword;
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      // Log the error (you might want to use a logger service here)
      console.error('Error creating user:', error);
      throw new InternalServerErrorException(
        'Something went wrong while creating the user',
      );
    }
  }

  private async hashPassword(
    password: string,
    saltRounds: number,
  ): Promise<string> {
    try {
      return await bcrypt.hash(password, saltRounds);
    } catch (error) {
      throw new InternalServerErrorException(
        'Something went wrong while hashing the password',
      );
    }
  }

  private isPasswordStrong(password: string): boolean {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasNonalphas = /\W/.test(password);
    return (
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers &&
      hasNonalphas
    );
  }

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async sendOTPEmail(email: string, otp: string): Promise<void> {
    const subject = 'Your OTP for Account Verification';
    const text = `Your OTP is: ${otp}. It will expire in 10 minutes.`;
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Verification OTP</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f8f8; border-radius: 5px;">
        <tr>
            <td style="padding: 20px;">
                <h1 style="color: #4a4a4a; text-align: center; margin-bottom: 20px;">Account Verification</h1>
                <div style="background-color: #ffffff; border-radius: 5px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <p style="font-size: 16px; margin-bottom: 20px;">Thank you for registering. To complete your account verification, please use the following One-Time Password (OTP):</p>
                    <div style="background-color: #e8f0fe; border-radius: 5px; padding: 15px; text-align: center; margin-bottom: 20px;">
                        <span style="font-size: 24px; font-weight: bold; color: #4285f4;">${otp}</span>
                    </div>
                    <p style="font-size: 14px; color: #666; margin-bottom: 20px;">This OTP will expire in 10 minutes for security reasons. If you didn't request this verification, please ignore this email.</p>
                    <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px; text-align: center; font-size: 12px; color: #888;">
                        <p>This is an automated message, please do not reply to this email.</p>
                        <p>&copy; 2024 BlockVest. All rights reserved.</p>
                    </div>
                </div>
            </td>
        </tr>
    </table>
</body>
</html>
`;
    await this.emailService.queueEmail(email, subject, text, html);
  }
}
