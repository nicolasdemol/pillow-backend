import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';
import * as session from 'express-session';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  // 🔹 Middleware pour les cookies
  app.use(cookieParser());

  // 🔹 Middleware pour les sessions
  app.use(
    session({
      secret: 'supersecretkey', // Changer en production
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: false, // `true` en production avec HTTPS
        maxAge: 24 * 60 * 60 * 1000, // 1 jour
      },
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 API disponible sur http://localhost:3000`);
}
bootstrap();
