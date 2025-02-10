import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  // 🔥 Active la gestion des cookies
  app.use(cookieParser());

  // Active le versionnement globalement
  app.enableVersioning({
    type: VersioningType.URI, // Utilise "/v1" dans les URL
  });

  // 🌐 Active CORS pour autoriser les cookies si ton frontend est sur un autre domaine
  app.enableCors({
    origin: 'http://localhost:3000', // 🔥 Remplace par ton frontend en prod
    credentials: true, // ✅ Autorise l'envoi des cookies HTTPOnly
  });
  
  
  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 API disponible sur http://localhost:3000`);
}
bootstrap();
