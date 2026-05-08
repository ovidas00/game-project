import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { GameService } from './game.service';

@Processor('withdraw-queue')
@Injectable()
export class WithdrawProcessor extends WorkerHost {
  private readonly logger = new Logger(WithdrawProcessor.name);

  constructor(private readonly gameService: GameService) {
    super();
  }

  async process(job: Job<any>): Promise<any> {
    const { slug, id, balance, remark } = job.data;

    this.logger.log(`Processing withdraw job ${job.id}`);

    const service = this.gameService['serviceMap'][slug];

    try {
      const result = await service.withdraw(id, balance, remark);

      this.logger.log(`Withdraw job ${job.id} completed`);

      return result;
    } catch (err) {
      this.logger.error(`Withdraw job ${job.id} failed`, err.stack);
      throw err;
    }
  }
}
