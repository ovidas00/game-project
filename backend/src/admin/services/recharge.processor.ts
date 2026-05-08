import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { GameService } from './game.service';

@Processor('recharge-queue')
@Injectable()
export class RechargeProcessor extends WorkerHost {
  private readonly logger = new Logger(RechargeProcessor.name);

  constructor(private readonly gameService: GameService) {
    super();
  }

  async process(job: Job<any>): Promise<any> {
    const { slug, id, balance, remark } = job.data;

    this.logger.log(`Processing job ${job.id}`);

    const service = this.gameService['serviceMap'][slug];

    try {
      const result = await service.recharge(id, balance, remark);

      this.logger.log(`Job ${job.id} completed`);
      return result;
    } catch (err) {
      this.logger.error(`Job ${job.id} failed`, err.stack);
      throw err; // required for retry
    }
  }
}
