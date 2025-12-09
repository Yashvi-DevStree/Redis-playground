/* eslint-disable prettier/prettier */
import { Inject, Injectable } from "@nestjs/common";
import Redis from "ioredis";

@Injectable()
export class AnalyticsService{
    constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) { }
    
    private getDateKey(prefix: string) {
        const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        return `${prefix}:${date}`;
    }

    async recordLogin(user_id: number) {
        const key = this.getDateKey('logins');
        await this.redis.setbit(key, user_id, 1);
        return { message: `User ${user_id} logged in` };
    }

    async getDailyActiveUsers() {
        const key = this.getDateKey('logins');
        const count = await this.redis.bitcount(key);
        return { activeUsers: count };      
    }

    async recordVisit(user_id: number) { 
        const key = this.getDateKey('visits');
        await this.redis.pfadd(key, user_id.toString());
        const uniqueCount = await this.redis.pfcount(key);
        return { uniqueVisitors: uniqueCount };
        
    }
}