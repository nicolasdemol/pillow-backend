import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 📌 Rend disponible les variables d'environnement partout
      envFilePath: '.env', // 📌 Charge le fichier .env
    }),
    AuthModule,
  ],
})
export class AppModule {}
