// 📂 src/user/user.controller.ts
import { Controller, Get, Put, Param, Body, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Récupère les informations d'un utilisateur par ID.
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getUserById(@Param('id') id: number) {
    return this.userService.findById(id);
  }

  /**
   * Met à jour le profil d'un utilisateur.
   */
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateUser(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUser(id, updateUserDto);
  }

  /**
   * Liste tous les utilisateurs.
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAllUsers() {
    return this.userService.findAll();
  }
}
