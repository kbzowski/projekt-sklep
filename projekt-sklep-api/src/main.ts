import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';

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
    origin: 'http://localhost:5173',    // Adres UI
    credentials: true,                  // Pozwala na uwierzytelnienie przez cookie
  });

  await app.listen(9000);
}
bootstrap();
