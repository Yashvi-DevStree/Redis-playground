import { Module } from '@nestjs/common';
import { UrlService } from './url.service';
import { UrlController } from './url.controller';
import { PubsubService } from 'src/redis/pubsub.service';

@Module({
  providers: [UrlService, PubsubService],
  controllers: [UrlController],
})
export class UrlModule {}
