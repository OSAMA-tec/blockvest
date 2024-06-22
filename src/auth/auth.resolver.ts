import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { User } from '../auth/entities/user.entity';
import { RegisterUserInput } from '../auth/dto/register-user.dto';

@Resolver(() => User)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Query(() => String)
  hello() {
    return 'Hello World!';
  }

  @Mutation(() => User)
  async registerUser(@Args('input') registerUserInput: RegisterUserInput) {
    return this.authService.create(registerUserInput);
  }
}
