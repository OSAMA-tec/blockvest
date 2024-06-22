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

export interface UserWithoutPassword extends Omit<User, 'password'> {
  id: string;
}

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

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

      // Create new user
      const createdUser = new this.userModel({
        ...createUserDto,
        password: hashedPassword,
      });

      // Save user to database
      const savedUser = await createdUser.save();

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
}
