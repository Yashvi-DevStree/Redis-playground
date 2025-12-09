/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Books } from './books.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { AnalyticsService } from 'src/common/analytics/analytics.service';
import { RateLimitService } from 'src/common/rate-limit/rate-limit.service';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class BookService {
  private readonly CACHE_KEY_ALL = 'books:all';

  constructor(
    @InjectRepository(Books) private repo: Repository<Books>,
    private analytics: AnalyticsService,
    private rateLimiter: RateLimitService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private configService: ConfigService, // Inject ConfigService
  ) { }

  async findAll(user: any) {
    // ✅ Get TTL directly from env
    const cacheTTL = Number(this.configService.get<number>('CACHE_TTL')) || 300;

    // 1️⃣ Rate-limit check
    const allowed = await this.rateLimiter.checkRateLimit(user.user_id);
    if (!allowed) throw new BadRequestException('Rate limit exceeded');

    // 2️⃣ Record analytics
    await this.analytics.recordVisit(user.user_id);

    // 3️⃣ Determine cache key based on role
    const roleName = user.role.name;
    const cacheKey = roleName === 'admin' ? this.CACHE_KEY_ALL : `books:user:${user.user_id}`;

    // 4️⃣ Try cache
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    // 5️⃣ Fetch books from DB
    let books;
    if (roleName === 'admin') {
      books = await this.repo.find();
    } else if (roleName === 'author') {
      books = await this.repo.find({ where: { user: { user_id: user.user_id } } });
    } else {
      books = await this.repo.find();
    }

    // 6️⃣ Set cache with TTL
    await this.redis.set(cacheKey, JSON.stringify(books), 'EX', cacheTTL);

    return books;
  }

  async create(dto: CreateBookDto, user: any) {

    const book = this.repo.create({ ...dto, user: { user_id: user.user_id } });
    const saved = await this.repo.save(book);

    // Invalidate caches
    await this.redis.del(this.CACHE_KEY_ALL);
    await this.redis.del(`books:user:${user.user_id}`);

    return { message: 'Book created', data: saved };
  }

  async delete(bookId: number, user: any) {

    const book = await this.repo.findOne({ where: { book_id: bookId } });
    if (!book) throw new NotFoundException('Book not found');

    if (user.role.name === 'author' && book.user.user_id !== user.user_id) {
      throw new ForbiddenException('Authors can delete only their own books');
    }

    await this.repo.remove(book);

    // Invalidate caches
    await this.redis.del(this.CACHE_KEY_ALL);
    await this.redis.del(`books:user:${book.user.user_id}`);

    return { message: 'Book deleted' };
  }
}
