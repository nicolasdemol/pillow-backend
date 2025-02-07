import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  // Active le versionnement globalement
  app.enableVersioning({
    type: VersioningType.URI, // Utilise "/v1" dans les URL
  });
  
  
  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 API disponible sur http://localhost:3000`);
}
bootstrap();
