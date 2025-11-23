import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import session, { SessionOptions } from 'express-session';
import { EnvVariables } from 'src/common/validators/env-validator';
import { RedisStore } from 'connect-redis';
import { RedisService } from 'src/infrastructure/redis/redis.service';

export const configureSession = (
  app: INestApplication,
  configService: ConfigService<EnvVariables>,
  redisService: RedisService,
) => {
  const isProduction = configService.get<string>('NODE_ENV') === 'production';
  const redisClient = redisService.getClient();

  // Session configuration
  const sessionName = configService.getOrThrow<string>('SESSION_NAME');
  const sessionSecret = configService.getOrThrow<string>('SESSION_SECRET');
  const sessionTTL = configService.getOrThrow<number>('SESSION_TTL');
  const sessionRolling = configService.getOrThrow<boolean>('SESSION_ROLLING');

  const sessionOptions: SessionOptions = {
    name: sessionName,
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: new RedisStore({ client: redisClient }),
    cookie: {
      maxAge: sessionTTL * 1000,
      secure: isProduction,
      sameSite: 'lax',
      httpOnly: true,
      path: '/',
    },
    rolling: sessionRolling,
  };

  app.use(session(sessionOptions));
};
