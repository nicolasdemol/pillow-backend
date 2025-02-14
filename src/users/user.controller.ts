import { Controller, Get, Put, Param, Query, Body, Req } from '@nestjs/common';
import { UserService } from './user.service';
import {
  AuthenticatedUser,
  Public,
  Resource,
  Roles,
  Scopes,
} from 'nest-keycloak-connect';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@Resource('user')
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @Get('me')
  @Scopes('view')
  async getMyProfile(@AuthenticatedUser() user: any) {
    return this.usersService.findById(user.sub);
  }

  @Get(':id')
  @Public()
  async getUserProfile(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Put('me')
  @Scopes('edit')
  async updateMyProfile(
    @AuthenticatedUser() user: any,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(user.sub, updateUserDto);
  }

  @Get('search')
  @Roles({ roles: ['admin'] })
  async searchUsers(@Query('query') query: string) {
    return this.usersService.searchUsers(query);
  }
}
