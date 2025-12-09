/* eslint-disable prettier/prettier */
import { Inject, Injectable } from "@nestjs/common";
import Redis from "ioredis";

@Injectable()
export class RateLimitService{
    constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) { }
    
    async checkRateLimit(user_id: number, limit = 5, duration = 60) {
        const key = `rate:${user_id}`;
        const current = await this.redis.incr(key);
        if (current === 1) await this.redis.expire(key, duration);
        return current <= limit;
    }
}