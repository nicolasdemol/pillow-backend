import { Controller, Post, Body, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() authDto: AuthDto) {
    return this.authService.signup(authDto);
  }

  @Post('login')
  async login(@Body() authDto: AuthDto) {
    return this.authService.login(authDto);
  }
}
