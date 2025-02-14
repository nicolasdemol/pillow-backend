import { Controller, Get, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Public } from 'nest-keycloak-connect';

@Controller('auth')
export class AuthController {
  constructor(private readonly configService: ConfigService) {}

  /**
   * 🔐 Redirige vers la page de connexion de Keycloak
   */
  @Public()
  @Get('sso')
  async redirectToLogin(@Res() response) {
    const keycloakUrl = this.configService.get<string>('KEYCLOAK_URL');
    const realm = this.configService.get<string>('KEYCLOAK_REALM'); // auth
    const redirectUri = this.configService.get<string>('KEYCLOAK_CALLBACK_URL');

    const loginUrl = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/auth?client_id=app&response_type=code&scope=openid&redirect_uri=${redirectUri}`;

    return response.status(302).redirect(loginUrl);
  }
}
