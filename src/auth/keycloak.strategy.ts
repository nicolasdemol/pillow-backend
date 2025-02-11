import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-openidconnect';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class KeycloakStrategy extends PassportStrategy(Strategy, 'keycloak') {
  constructor(private readonly configService: ConfigService) {
    super({
      issuer: `${configService.get<string>('KEYCLOAK_URL')}/realms/${configService.get<string>('KEYCLOAK_REALM')}`,
      authorizationURL: `${configService.get<string>('KEYCLOAK_URL')}/realms/${configService.get<string>('KEYCLOAK_REALM')}/protocol/openid-connect/auth`,
      tokenURL: `${configService.get<string>('KEYCLOAK_URL')}/realms/${configService.get<string>('KEYCLOAK_REALM')}/protocol/openid-connect/token`,
      userInfoURL: `${configService.get<string>('KEYCLOAK_URL')}/realms/${configService.get<string>('KEYCLOAK_REALM')}/protocol/openid-connect/userinfo`,
      clientID: configService.get<string>('KEYCLOAK_CLIENT_ID'),
      clientSecret: configService.get<string>('KEYCLOAK_CLIENT_SECRET'),
      callbackURL: configService.get<string>('KEYCLOAK_CALLBACK_URL'),
      scope: 'openid profile email',
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    return { accessToken, profile };
  }
}
