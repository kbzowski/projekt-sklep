import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { TokenGuard } from '../auth/token.guard';
import { UserID } from '../auth/user.decorator';

import { CreateUserDto } from './dto/create-user.dto';
import { UserDto } from './dto/user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    return plainToInstance(UserDto, user);
  }

  @Get('/me')
  @UseGuards(TokenGuard)
  async me(@UserID() userId: number) {
    const user = await this.userService.findOne(userId);
    return plainToInstance(UserDto, user);
  }
}
