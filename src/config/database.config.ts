import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const TypeOrmConfigAsync = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (
    configService: ConfigService,
  ): Promise<TypeOrmModuleOptions> => ({
    type: configService.get<string>('POSTGRES_API_TYPE') as any,
    host: configService.get<string>('POSTGRES_API_HOST'),
    port: configService.get<number>('POSTGRES_API_PORT'),
    username: configService.get<string>('POSTGRES_API_USER'),
    password: configService.get<string>('POSTGRES_API_PASSWORD'),
    database: configService.get<string>('POSTGRES_API_DB'),
    entities: [__dirname + '/../**/*.entity.{ts,js}'],
    synchronize: configService.get<boolean>('POSTGRES_API_SYNCHRONIZE'),
    logging: configService.get<boolean>('POSTGRES_API_LOGGING'),
  }),
};
