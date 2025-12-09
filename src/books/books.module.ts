/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { BookService } from './books.service';
import { BooksController } from './books.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Books } from './books.entity';
import { User } from 'src/user/user.entity';
import { AnalyticsModule } from 'src/common/analytics/analytics.module';
import { RateLimitModule } from 'src/common/rate-limit/rate-limit.module';

@Module({
  imports: [TypeOrmModule.forFeature([Books, User]),
    AnalyticsModule,   // ✅ make AnalyticsService available
    RateLimitModule,],
  controllers: [BooksController],
  providers: [BookService],
})
export class BooksModule {}
