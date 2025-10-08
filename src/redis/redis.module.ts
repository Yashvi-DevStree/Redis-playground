/* eslint-disable prettier/prettier */

import { Module, Global } from '@nestjs/common';
import Redis from 'ioredis';

@Global()
@Module({
    providers: [
        {
            provide: 'REDIS_CLIENT',
            useFactory: () => {
                const client = new Redis({
                    host: '127.0.0.1',
                    port: 6379,
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
