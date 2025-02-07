import { Controller, Get, Put, Param, Body, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/role.decorator';
import { Role } from '../auth/enums/role.enum';

@Controller({ path: 'users', version: '1' })
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Récupère les informations de l'utilisateur authentifié
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req) {
    return this.userService.findById(req.user.id);
  }

  /**
   * Récupère les informations d'un utilisateur par ID (Admin uniquement)
   */
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @Get(':id')
  async getUserById(@Param('id') id: number) {
    return this.userService.findById(id);
  }

  /**
   * Met à jour les informations de l'utilisateur authentifié
   */
  @UseGuards(JwtAuthGuard)
  @Put('me')
  async updateMe(@Body() updateUserDto: UpdateUserDto, @Request() req) {
    return this.userService.updateUser(req.user.id, updateUserDto);
  }

  /**
   * Met à jour un utilisateur spécifique (Admin uniquement)
   */
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @Put(':id')
  async updateUser(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUser(id, updateUserDto);
  }

  /**
   * Liste tous les utilisateurs (Admin uniquement)
   */
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @Get()
  async findAllUsers() {
    return this.userService.findAll();
  }
}
