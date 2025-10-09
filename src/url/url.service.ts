/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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

        // 1️⃣ Count total visits
        await this.redis.incr(`url_visits:${shortCode}`);

        // 2️⃣ Track unique visitors
        await this.redis.sadd(`url_unique_visitors:${shortCode}`, ip);

        // 3️⃣ Track active users
        await this.redis.sadd('Active_users', ip);
        await this.redis.expire(`Active_users`, 86400); // 24 hours

        // 4️⃣ Publish event for subscribers (real-time updates)
        await this.pubSub.publish('url_visits', { shortCode, ip, timestamp: Date.now() });

        // 5️⃣ Add stream for event logging
        await this.redis.xadd(
            'url_visits_stream',
            '*',
            'shortCode', shortCode,
            'ip', ip,
            'timestamp', Date.now().toString()
        )

        // 6️⃣ Add to queue for background task processing
        await this.redis.lpush('visit_queue', JSON.stringify({ shortCode, ip, time: new Date().toISOString() }))
        
        // 7️⃣ Add to HyperLogLog for approxiamate unique visitors count
        await this.redis.pfadd(`hll_unique_visitors:${shortCode}`, ip)
    }

    // ✅ Process background tasks (simulate async worker)
    async processVisitQueue() {
        const data = await this.redis.rpop('visit_queue');
        if (data) { 
            const event = JSON.parse(data);
            console.log('Processing visit event:', event);
        }    
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

    // ✅ Get Stream Events
    async getRecentEvents(limit = 10) {
        const events = await this.redis.xrevrange('url_visits_stream', '+', '-', 'COUNT', limit);
        return events.map(([id, fields]) => ({id, data: fields}))
    }
}
