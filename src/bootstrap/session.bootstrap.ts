import passport from 'passport';
import { v4 as uuid } from 'uuid';
import { RedisStore } from 'connect-redis';
import { ConfigService } from '@nestjs/config';
import { INestApplication } from '@nestjs/common';
import session, { SessionOptions } from 'express-session';
import { EnvVariables } from 'src/common/validators/env-validator';
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
    genid: () => uuid(),
    store: new RedisStore({
      client: redisClient,
      prefix: 'auth:',
      ttl: sessionTTL,
    }),
    name: sessionName,
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    rolling: sessionRolling,
    proxy: isProduction,
    cookie: {
      path: '/',
      httpOnly: true,
      secure: isProduction,
      maxAge: sessionTTL * 1000,
      sameSite: isProduction ? 'strict' : 'lax',
    },
  };

  app.use(session(sessionOptions));
  app.use(passport.initialize());
  app.use(passport.session());
};
