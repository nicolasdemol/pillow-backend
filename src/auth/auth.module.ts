import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ProfileController } from '../user/profile.controller';
import { PassportModule } from '@nestjs/passport';
import { jwtConstants } from './constants';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule], // Charge ConfigModule pour accéder aux variables d'env
      inject: [ConfigService], // Injecte ConfigService pour récupérer les variables
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // Récupère JWT_SECRET
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1h'),
        }, // Durée de validité par défaut : 1h
      }),
    }),
  ],
  controllers: [AuthController, ProfileController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
