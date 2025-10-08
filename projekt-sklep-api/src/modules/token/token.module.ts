import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { PrismaModule } from '../prisma/prisma.module';

import { TokenService } from './token.service';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: async (config: ConfigService) => ({
        secret: config.get('JWT_KEY'),
      }),
      inject: [ConfigService],
    }),
    PrismaModule,
  ],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
