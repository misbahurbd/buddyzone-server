import express from 'express';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { EnvVariables } from 'src/common/validators/env-validator';

export const setupApplication = (
  app: INestApplication,
  configService: ConfigService<EnvVariables>,
) => {
  const isProduction = configService.get<string>('NODE_ENV') === 'production';

  // Ensure providers receive shutdown signals for graceful cleanup
  app.enableShutdownHooks(['SIGINT', 'SIGTERM']);

  // Core middlewares
  app.use(cookieParser());
  app.use(compression());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Enable global class validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      disableErrorMessages: isProduction,
    }),
  );

  // Eanble versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'api/v',
  });
};
