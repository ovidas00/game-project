import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          url:
            configService.get<string>('REDIS_URL') || 'redis://localhost:6379',
        },
      }),
    }),

    BullModule.registerQueue({
      name: 'recharge-queue',
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: 50,
      },
    }),

    BullModule.registerQueue({
      name: 'withdraw-queue',
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: 50,
      },
    }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
