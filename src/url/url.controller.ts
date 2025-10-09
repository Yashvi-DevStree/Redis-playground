/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Body, Controller, Get, HttpException, Param, Post, Req, Res } from '@nestjs/common';
import { UrlService } from './url.service';
import { ShortenDto } from './dto/url.dto';
import type { Request, Response } from 'express';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('url')
export class UrlController {
    constructor(private readonly urlService: UrlService) { }

    // 1️⃣ Shorten URL
    @Post('shorten')
    async shortenUrl(@Body() dto: ShortenDto, @Req() req: Request) {
        try {
            const shortCode = await this.urlService.shortenUrl(dto.originalUrl, req.ip || '');
            return { success: true, shortUrl: `http://localhost:3000/url/${shortCode}` };
        } catch (error) {
            throw new HttpException(error.message, 400);
        }
    }

    @Post('send-test-message')
    async sendMessage(@Body() body: SendMessageDto, @Req() req: Request) {
        const message = {
            shortCode: body.shortCode,
            ip: body.ip || req.ip || '127.0.0.1',
            type: body.type || 'custom',
            message: body.message || 'No message',
            timestamp: Date.now(),
        };

        await this.urlService.sendTestMessage(message);

        return { success: true, message: 'Message sent', data: message };
    }

    // 2️⃣ Get Analytics (should be before redirect)
    @Get('analytics/:shortCode')
    async analytics(@Param('shortCode') shortCode: string) {
        const data = await this.urlService.getAnalytics(shortCode);
        return { success: true, data };
    }

    // 3️⃣ Get Active Users
    @Get('active-users')
    async getActiveUsers() {
        const count = await this.urlService.getActiveUsers();
        return { success: true, activeUsers: count };
    }

    // 4️⃣ Redirect to Original URL (keep last)
    @Get(':shortCode')
    async redirect(@Param('shortCode') shortCode: string, @Req() req: Request, @Res() res: Response) {
        const originalUrl = await this.urlService.getOriginalUrl(shortCode);
        if (!originalUrl) return res.status(404).send('URL not found');
        await this.urlService.recordVisit(shortCode, req.ip || '');
        return res.redirect(originalUrl);
    }

    @Get('recent-events')
    async getRecentEvents() {
        const events = await this.urlService.getRecentEvents()
        return { success: true, data: events}
    }

    @Get('process-queue')
    async processQueue() {
        await this.urlService.processVisitQueue()
        return { success: true, message: 'Queue processed.'}
    }
}