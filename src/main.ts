import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from '@nestjs/common';
import { EnvVariables } from './common/validators/env-validator';
import { ConfigService } from '@nestjs/config';
import { RedisService } from './infrastructure/redis/redis.service';
import { setupApplication } from './bootstrap/app.bootstrap';
import { enhanceSecurity } from './bootstrap/security.bootstrap';
import { configureSession } from './bootstrap/session.bootstrap';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = new Logger(bootstrap.name);

  // Base services
  const configService = app.get<ConfigService<EnvVariables>>(ConfigService);
  const redisService = app.get<RedisService>(RedisService);

  // Bootstrap application
  setupApplication(app, configService);
  enhanceSecurity(app, configService);
  configureSession(app, configService, redisService);

  // Start server
  await app.listen(configService.get<number>('PORT')!);
  logger.log(`Server is running on port ${configService.get<number>('PORT')!}`);
}

void bootstrap();
