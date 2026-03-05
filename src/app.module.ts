import { Module } from '@nestjs/common';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { AuditModule } from './modules/audit/audit.module';
import { MembersModule } from './modules/members/members.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { AppConfigService } from './config/config.service';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'admin/dist'),
      serveRoot: '/',
      exclude: ['/api*'],
    }),
    ConfigModule,
    PrismaModule,
    CommonModule,
    ThrottlerModule.forRootAsync({
      useFactory: (config: AppConfigService) => ({
        throttlers: [
          {
            ttl: config.rateLimitTtl * 1000,
            limit: config.rateLimitMax,
          },
        ],
      }),
      inject: [AppConfigService],
    }),
    AuthModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    OrganizationModule,
    AuditModule,
    MembersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
