/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { SeederService } from './seeder/seeder.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalInterceptors(new ResponseInterceptor())
  const seeder = app.get(SeederService);
  await seeder.seed();

  await app.listen(process.env.PORT ?? 3000);
  console.log('🚀 Server running at http://localhost:3000/api');
}
bootstrap();
