import { InjectQueue } from '@nestjs/bullmq';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GameroomService } from 'src/game/gameroom.service';
import { MafiaService } from 'src/game/mafia.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Queue } from 'bullmq';

@Injectable()
export class GameService {
  private serviceMap: Record<string, any>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly gameroomService: GameroomService,
    private readonly mafiaService: MafiaService,
    @InjectQueue('recharge-queue') private readonly rechargeQueue: Queue,
    @InjectQueue('withdraw-queue') private readonly withdrawQueue: Queue,
    @InjectQueue('create-account-queue')
    private readonly createAccountQueue: Queue,
  ) {
    this.serviceMap = {
      gameroom: this.gameroomService,
      mafia: this.mafiaService,
    };
  }

  async getAllGames() {
    const games = await this.prisma.game.findMany();

    return games.map((game) => ({
      ...game,
      image: game.image
        ? `${this.configService.get<string>('BACKEND_URL')}${game.image}`
        : null,
    }));
  }

  async getPlayerList(
    slug: string,
    query: {
      limit?: number;
      page?: number;
      id?: string;
      account?: string;
      nickname?: string;
    },
  ) {
    const service = this.serviceMap[slug];

    if (!service) {
      throw new BadRequestException(`Unknown game slug: ${slug}`);
    }

    const { limit = 10, page = 1, id, account, nickname } = query;

    return await service.getPlayerList(limit, page, {
      id,
      account,
      nickname,
    });
  }

  async addPlayer(
    slug: string,
    username?: string,
    nickname?: string,
    password?: string,
    money: number = 0,
  ) {
    const service = this.serviceMap[slug];

    if (!service) {
      throw new BadRequestException(`Unknown game slug: ${slug}`);
    }

    const job = await this.createAccountQueue.add('create-player-job', {
      slug,
      username,
      nickname,
      password,
      money,
    });

    return {
      message: 'Player creation queued',
      jobId: job.id,
    };
  }

  async recharge(slug: string, id: string, balance: number, remark?: string) {
    const service = this.serviceMap[slug];

    if (!service) {
      throw new BadRequestException(`Unknown game slug: ${slug}`);
    }

    // Add to queue
    const job = await this.rechargeQueue.add('recharge-job', {
      slug,
      id,
      balance,
      remark,
    });

    // instant response
    return {
      message: 'Recharge request queued',
      jobId: job.id,
    };
  }

  async withdraw(slug: string, id: string, balance: number, remark?: string) {
    const service = this.serviceMap[slug];

    if (!service) {
      throw new BadRequestException(`Unknown game slug: ${slug}`);
    }

    const job = await this.withdrawQueue.add('withdraw-job', {
      slug,
      id,
      balance,
      remark,
    });

    return {
      message: 'Withdraw request queued',
      jobId: job.id,
    };
  }

  async login(slug: string) {
    const service = this.serviceMap[slug];

    if (!service) {
      throw new BadRequestException(`Unknown game slug: ${slug}`);
    }

    return await service.login();
  }
}
