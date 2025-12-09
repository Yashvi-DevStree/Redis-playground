/* eslint-disable prettier/prettier */
import { Controller, Get, Param, Post } from "@nestjs/common";
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }
    
    @Post('login/:user_id')
    async recordLogin( @Param('user_id') user_id: number) { 
        return this.analyticsService.recordLogin(user_id);
    }

    @Get('active-users')
    async getDailyActiveUsers() {
        return this.analyticsService.getDailyActiveUsers();
    }

    @Post('visit/:user_id')
    async recordVisit(@Param('user_id') user_id: number) {
        return this.analyticsService.recordVisit(user_id);  
    }
}