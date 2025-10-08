import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('/api/');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // conversion of types
      whitelist: true, // Remove properties not present in DTO
      forbidNonWhitelisted: true,
    }),
  );
  app.use(cookieParser());

  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  await app.listen(9000);
}
bootstrap();
