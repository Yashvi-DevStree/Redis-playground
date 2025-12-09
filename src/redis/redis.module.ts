/* eslint-disable prettier/prettier */
import { Module, Global } from '@nestjs/common';
import Redis from 'ioredis';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        const host = process.env.REDIS_HOST;
        const port = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379;
        const client = new Redis({
          host: host,
          port: port,
        });

        client.on('connect', () => console.log('✅ Redis connected'));
        client.on('error', (err) => console.error('❌ Redis error:', err));

        return client;
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule { }
