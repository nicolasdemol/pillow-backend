import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(private readonly configService: ConfigService) {}

  @Post('login')
  async login(@Body() loginDto: { username: string; password: string }) {
    const keycloakUrl = this.configService.get<string>('KEYCLOAK_URL');
    const realm = this.configService.get<string>('KEYCLOAK_REALM');
    const clientId = this.configService.get<string>('KEYCLOAK_CLIENT_ID');
    const clientSecret = this.configService.get<string>(
      'KEYCLOAK_CLIENT_SECRET',
    );

    try {
      const response = await axios.post(
        `${keycloakUrl}/realms/${realm}/protocol/openid-connect/token`,
        new URLSearchParams({
          grant_type: 'password',
          client_id: clientId,
          client_secret: clientSecret,
          username: loginDto.username,
          password: loginDto.password,
        }),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        },
      );

      return response.data; // Retourne directement le token
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  @Get('validate')
  async validateToken(@Headers('authorization') authHeader: string) {
    if (!authHeader) throw new UnauthorizedException('No token provided');

    const token = authHeader.replace('Bearer ', '');
    const keycloakUrl = this.configService.get<string>('KEYCLOAK_URL');
    const realm = this.configService.get<string>('KEYCLOAK_REALM');

    try {
      const response = await axios.get(
        `${keycloakUrl}/realms/${realm}/protocol/openid-connect/userinfo`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      return response.data;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  @Post('logout')
  async logout(@Headers('authorization') authHeader: string) {
    if (!authHeader) throw new UnauthorizedException('No token provided');

    const token = authHeader.replace('Bearer ', '');
    const keycloakUrl = this.configService.get<string>('KEYCLOAK_URL');
    const realm = this.configService.get<string>('KEYCLOAK_REALM');
    const clientId = this.configService.get<string>('KEYCLOAK_CLIENT_ID');
    const clientSecret = this.configService.get<string>(
      'KEYCLOAK_CLIENT_SECRET',
    );

    try {
      await axios.post(
        `${keycloakUrl}/realms/${realm}/protocol/openid-connect/logout`,
        new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: token, // 🔥 Utilisation du refresh_token pour invalider la session
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );

      return { message: 'Déconnecté avec succès' };
    } catch (error) {
      throw new UnauthorizedException('Impossible de se déconnecter');
    }
  }
}
