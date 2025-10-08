/* eslint-disable prettier/prettier */
import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { nanoid } from 'nanoid';
import { PubsubService } from 'src/redis/pubsub.service';

@Injectable()
export class UrlService {
    constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis, private readonly pubSub: PubsubService) { }
    
    async shortenUrl(originalUrl: string, ip: string) {
        const rateKey = `rate_limit:${ip}`;
        const requests = await this.redis.incr(rateKey);
        if (requests === 1) await this.redis.expire(rateKey, 60); // 1 minute window
        if (requests > 10) throw new Error('Rate limit exceeded. Try again later.');
        
        const shortCode = nanoid(8);
        await this.redis.set(`shorturl:${shortCode}`, originalUrl, 'EX', 86400); // 24 hours
        return `${shortCode}`;
    }

    async getOriginalUrl(shortCode: string) {
        return this.redis.get(`shorturl:${shortCode}`);
    }

    async recordVisit(shortCode: string, ip: string) { 
        await this.redis.incr(`url_visits:${shortCode}`);
        await this.redis.sadd(`url_unique_visitors:${shortCode}`, ip);
        await this.redis.sadd('Active_users', ip);
        await this.redis.expire(`Active_users`, 86400); // 24 hours

        await this.pubSub.publish('url_visits', { shortCode, ip, timestamp: Date.now() });
    }

    async getAnalytics(shortCode: string) { 
        const clicks = await this.redis.get(`url_visits:${shortCode}`);
        const uniqueVisitors = await this.redis.scard(`url_unique_visitors:${shortCode}`);

        return {
            clicks: clicks? parseInt(clicks) : 0,
            uniqueVisitors: uniqueVisitors || 0,
        }
    }

    async sendTestMessage(message: { shortCode: string, ip: string, timestamp: number }) {
        await this.pubSub.publish('url_visits', message);
    }

    async getActiveUsers() { 
        return this.redis.scard('Active_users');
    }
}
