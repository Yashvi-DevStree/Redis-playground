/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UrlModule } from './url/url.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [UrlModule, RedisModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
