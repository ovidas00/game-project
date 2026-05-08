import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { GameService } from './game.service';

@Processor('reset-password-queue')
@Injectable()
export class ResetPasswordProcessor extends WorkerHost {
  private readonly logger = new Logger(ResetPasswordProcessor.name);

  constructor(private readonly gameService: GameService) {
    super();
  }

  async process(job: Job<any>): Promise<any> {
    const { slug, id, password, passwordConfirmation } = job.data;

    this.logger.log(`Processing reset password job ${job.id}`);

    const service = this.gameService['serviceMap'][slug];

    try {
      const result = await service.reset(id, password, passwordConfirmation);

      this.logger.log(`Reset password job ${job.id} completed`);

      return result;
    } catch (err) {
      this.logger.error(`Reset password job ${job.id} failed`, err.stack);
      throw err;
    }
  }
}
