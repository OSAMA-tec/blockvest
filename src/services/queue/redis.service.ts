import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService {
  private readonly redis: Redis;
  private readonly subscriber: Redis;

  constructor(private configService: ConfigService) {
    const redisConfig = {
      host: this.configService.get<string>('REDIS_HOST'),
      port: this.configService.get<number>('REDIS_PORT'),
      password: this.configService.get<string>('REDIS_PASSWORD'),
    };

    this.redis = new Redis(redisConfig);
    this.subscriber = new Redis(redisConfig);

    // Add error listeners
    this.redis.on('error', (error) => {
      console.error('Redis Client Error:', error);
    });

    this.subscriber.on('error', (error) => {
      console.error('Redis Subscriber Error:', error);
    });
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
