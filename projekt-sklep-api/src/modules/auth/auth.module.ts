import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  providers: [AuthService],
  imports: [PrismaModule],
  controllers: [AuthController],
})
export class AuthModule {}
