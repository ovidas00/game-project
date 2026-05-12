import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { GameService } from './game.service';
import { randomBytes } from 'crypto';

@Processor('create-account-queue')
@Injectable()
export class CreatePlayerProcessor extends WorkerHost {
  private readonly logger = new Logger(CreatePlayerProcessor.name);

  constructor(private readonly gameService: GameService) {
    super();
  }

  async process(job: Job<any>): Promise<any> {
    const { slug, username, nickname, password, money } = job.data;

    this.logger.log(`Processing player creation job ${job.id}`);

    const service = this.gameService['serviceMap'][slug];

    // fallback logic here (important for consistency)
    const finalUsername =
      username || randomBytes(6).toString('hex').slice(0, 10);

    const finalNickname = nickname || finalUsername;
    const finalPassword = password || randomBytes(6).toString('hex');

    try {
      let result: any;
      if (slug === 'orionstars') {
        result = await service.registerUser(finalUsername, finalPassword);
      } else {
        result = await service.addPlayer(
          finalUsername,
          finalNickname,
          finalPassword,
          money,
        );
      }

      console.log(result);

      this.logger.log(`Player created: ${finalUsername}`);

      return {
        username: finalUsername,
        password: finalPassword,
        apiResponse: result,
      };
    } catch (err) {
      this.logger.error(`Player creation failed`, err.stack);
      throw err;
    }
  }
}
