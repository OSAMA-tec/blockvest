import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from '../auth/entities/user.entity';
import { RegisterUserInput } from '../auth/dto/register-user.dto';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => String)
  hello() {
    return 'Hello World!';
  }

  @Mutation(() => User)
  async registerUser(@Args('input') registerUserInput: RegisterUserInput) {
    return this.usersService.create(registerUserInput);
  }
}
