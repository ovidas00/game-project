import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'node:path';
import { PrismaModule } from './prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';
import { AdminModule } from './admin/admin.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot(),
    ServeStaticModule.forRoot({ rootPath: join(process.cwd(), 'public') }),
    PrismaModule,
    RedisModule,
    HttpModule.register({ global: true }),
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
