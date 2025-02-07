import { Controller, Post, Body, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { SignupDto } from './dto/signup.dto';

@Controller({ path: 'auth', version: '1' }) // Définit v1
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() signupDto: SignupDto) {
    this.logger.log('Tentative d’inscription', { email: signupDto.email });
    return this.authService.signup(signupDto);
  }

  @Post('login')
  async login(@Body() authDto: AuthDto) {
    this.logger.log('Tentative de connexion', { email: authDto.email });
    return this.authService.login(authDto);
  }
}
