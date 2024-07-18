import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redis: Redis;
  private subscriber: Redis;
  private connectionPromise: Promise<void>;
  private readonly logger = new Logger(RedisService.name);

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    this.connectionPromise = this.connectWithRetry();
    await this.connectionPromise;
  }

  async onModuleDestroy() {
    await this.redis?.quit();
    await this.subscriber?.quit();
  }

  async waitForConnection() {
    await this.connectionPromise;
  }

  private async connectWithRetry(retries = 5, interval = 5000): Promise<void> {
    const redisConfig = {
      host: this.configService.get<string>('REDIS_HOST'),
      port: this.configService.get<number>('REDIS_PORT'),
      password: this.configService.get<string>('REDIS_PASSWORD'),
      retryStrategy: (times: number) => {
        if (times > retries) {
          return null; // Stop retrying
        }
        return interval;
      },
    };

    try {
      this.redis = new Redis(redisConfig);
      this.subscriber = new Redis(redisConfig);

      this.redis.on('error', (error) => {
        this.logger.error('Redis Client Error:', error);
      });

      this.subscriber.on('error', (error) => {
        this.logger.error('Redis Subscriber Error:', error);
      });

      await this.redis.ping();
      this.logger.log('Successfully connected to Redis');
    } catch (error) {
      this.logger.error('Failed to connect to Redis:', error);
      if (retries > 0) {
        this.logger.log(`Retrying in ${interval / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, interval));
        await this.connectWithRetry(retries - 1, interval);
      } else {
        throw new Error('Max retries reached. Unable to connect to Redis.');
      }
    }
  }

  async pushToQueue(queue: string, data: string): Promise<number> {
    return this.redis.rpush(queue, data);
  }

  async popFromQueue(queue: string): Promise<string | null> {
    return this.redis.lpop(queue);
  }

  async publish(channel: string, message: string): Promise<number> {
    return this.redis.publish(channel, message);
  }

  getSubscriber(): Redis {
    return this.subscriber;
  }
}
