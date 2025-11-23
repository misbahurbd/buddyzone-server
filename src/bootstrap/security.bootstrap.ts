import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvVariables } from 'src/common/validators/env-validator';
import helmet from 'helmet';

export const enhanceSecurity = (
  app: INestApplication,
  configService: ConfigService<EnvVariables>,
) => {
  const isProduction = configService.get<string>('NODE_ENV') === 'production';

  // Enable Helmet Middleware
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'same-origin' },
      noSniff: true,
      frameguard: { action: 'deny' },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    }),
  );

  // Cors configuration
  const allowedHeaders = new Set(['Content-Type', 'Authorization']);
  const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];
  const allowedOrigins = isProduction
    ? configService.get<string>('FRONTEND_ORIGIN')?.split(',')
    : true;
  const exposedHeaders = new Set(['Content-Range']);

  app.enableCors({
    origin: allowedOrigins,
    methods: allowedMethods,
    credentials: true,
    allowedHeaders,
    exposedHeaders,
  });
};
