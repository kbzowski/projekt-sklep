import {
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

import { PrismaClient } from '../../generated/prisma/client';
 
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnApplicationShutdown {
  constructor() {
    const adapter = new PrismaBetterSqlite3({
      url: 'file:./dev.db',
    });
    super({
      adapter,
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async onApplicationShutdown(signal?: string) {
    await this.$disconnect();
  }
}
