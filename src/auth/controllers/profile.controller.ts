import { Controller, Get, UseGuards, Req, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('profile')
export class ProfileController {
  private readonly logger = new Logger(ProfileController.name);

  @UseGuards(JwtAuthGuard)
  @Get()
  getProfile(@Req() req: any) {
    this.logger.log(
      `Requête reçue pour le profil de l'utilisateur: ${JSON.stringify(req.user)}`,
    );
    const user = req.user;
    return { message: 'Accès autorisé au profil utilisateur', user };
  }
}
