import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientOptions, RedisClientType } from 'redis';
import { EnvVariables } from 'src/common/validators/env-validator';

@Injectable()
export class RedisService
  implements OnModuleInit, OnModuleDestroy, OnApplicationShutdown
{
  private readonly logger = new Logger(RedisService.name);
  private readonly client: RedisClientType;
  private isConnected = false;

  constructor(private readonly configService: ConfigService<EnvVariables>) {
    const redisOption = this.getRedisOptions();
    this.client = createClient(redisOption) as RedisClientType;
    this.setupEventHandlers(this.client, 'Redis');
  }

  async onModuleInit() {
    try {
      await this.client.connect();
      this.isConnected = true;
      this.logger.log('Redis connected successfully');
    } catch (error) {
      this.logger.error(
        'Failed to connect to Redis',
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  async onApplicationShutdown() {
    await this.disconnect();
  }

  private async disconnect(): Promise<void> {
    if (!this.isConnected) {
      this.logger.warn('Redis is not connected, skipping disconnect');
      return;
    }

    if (this.client.isOpen === false) {
      this.logger.warn('Redis client is already closed');
      this.isConnected = false;
      return;
    }

    try {
      await this.client.quit();
      this.isConnected = false;
      this.logger.log('Redis disconnected successfully');
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message.includes('closed') ||
          error.message.includes('The client is closed'))
      ) {
        this.logger.warn('Redis client was already closed');
        this.isConnected = false;
        return;
      }

      this.logger.error(
        'Failed to disconnect from Redis',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  getClient(): RedisClientType {
    if (!this.client) {
      throw new Error('Redis client not initialized');
    }
    return this.client;
  }

  private setupEventHandlers(
    client: RedisClientType,
    clientName: string,
  ): void {
    client.on('connect', () => {
      this.logger.log(`${clientName} connecting to Redis...`);
    });

    client.on('ready', () => {
      this.logger.log(`${clientName} connected and ready`);
    });

    client.on('error', (error: Error) => {
      this.logger.error(`${clientName} error:`, error.message);
    });

    client.on('end', () => {
      this.logger.log(`${clientName} connection ended`);
    });

    client.on('reconnecting', () => {
      this.logger.warn(`${clientName} reconnecting...`);
    });
  }

  private getReconnectionStrategy() {
    return (retries: number, cause: Error): number | Error => {
      if (retries > 10) {
        this.logger.error('Redis connection retries exceeded', cause.message);
        return new Error('Redis connection retries exceeded');
      }
      return Math.min(retries * 50, 1000);
    };
  }

  private getRedisOptions(): RedisClientOptions {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    const redisHost = this.configService.get<string>('REDIS_HOST');
    const redisPort = this.configService.get<number>('REDIS_PORT');
    const redisUsername = this.configService.get<string>('REDIS_USERNAME');
    const redisPassword = this.configService.get<string>('REDIS_PASSWORD');
    const redisDb = this.configService.get<number>('REDIS_DB', 0);
    const enableTls = this.configService.get<boolean>('REDIS_TLS', false);
    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';

    const baseOptions: RedisClientOptions = {
      socket: {
        reconnectStrategy: this.getReconnectionStrategy(),
      },
    };

    if (enableTls) {
      baseOptions.socket = {
        ...baseOptions.socket,
        tls: true,
        rejectUnauthorized: isProduction,
      };
    }

    if (redisUrl) {
      baseOptions.url = redisUrl;
    }

    if (redisHost && redisPort) {
      baseOptions.username = redisUsername;
      baseOptions.password = redisPassword;
      baseOptions.database = redisDb;
      baseOptions.socket = {
        ...baseOptions.socket,
        host: redisHost,
        port: redisPort,
      };
    }

    return baseOptions;
  }
}
