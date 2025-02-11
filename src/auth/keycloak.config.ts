import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import {
  KeycloakConnectOptions,
  KeycloakConnectOptionsFactory,
  PolicyEnforcementMode,
  TokenValidation,
} from 'nest-keycloak-connect';

@Injectable()
export class KeycloakConfigService implements KeycloakConnectOptionsFactory {
  constructor(private configService: ConfigService) {}
  createKeycloakConnectOptions(): KeycloakConnectOptions {
    return {
      authServerUrl: this.configService.get<string>('KEYCLOAK_URL'),
      realm: this.configService.get<string>('KEYCLOAK_REALM'),
      clientId: this.configService.get<string>('KEYCLOAK_CLIENT_ID'),
      secret: this.configService.get<string>('KEYCLOAK_CLIENT_SECRET'),
      policyEnforcement: PolicyEnforcementMode.PERMISSIVE,
      tokenValidation: TokenValidation.ONLINE,
    };
  }
}
