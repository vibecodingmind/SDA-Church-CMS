import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(config: ConfigService) {
    const connectionString = config.get<string>('DATABASE_URL') || '';
    const adapter = connectionString.startsWith('mysql://')
      ? createMySQLAdapter(connectionString)
      : createPgAdapter(connectionString);
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

function createPgAdapter(connectionString: string) {
  const { PrismaPg } = require('@prisma/adapter-pg');
  const { Pool } = require('pg');
  return new PrismaPg(new Pool({ connectionString }));
}

function createMySQLAdapter(connectionString: string) {
  const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
  const mariadb = require('mariadb');
  const url = new URL(connectionString);
  const pool = mariadb.createPool({
    host: url.hostname,
    port: parseInt(url.port || '3306', 10),
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
  });
  return new PrismaMariaDb(pool);
}
