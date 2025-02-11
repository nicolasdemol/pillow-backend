import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KeycloakConnectModule } from 'nest-keycloak-connect';
import { KeycloakConfigService } from './keycloak.config';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    ConfigModule.forRoot(),
    KeycloakConnectModule.registerAsync({
      useClass: KeycloakConfigService,
      imports: [ConfigModule],
    }),
  ],
  controllers: [AuthController],
  providers: [KeycloakConfigService],
  exports: [KeycloakConfigService],
})
export class AuthModule {}
