import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GameroomService } from 'src/game/gameroom.service';
import { MafiaService } from 'src/game/mafia.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GameService {
  private serviceMap: Record<string, any>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly gameroomService: GameroomService,
    private readonly mafiaService: MafiaService,
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

    return await service.addPlayer(username, nickname, password, money);
  }

  async recharge(slug: string, id: string, balance: number, remark?: string) {
    const service = this.serviceMap[slug];

    if (!service) {
      throw new BadRequestException(`Unknown game slug: ${slug}`);
    }

    return await service.recharge(id, balance, remark);
  }

  async withdraw(slug: string, id: string, balance: number, remark?: string) {
    const service = this.serviceMap[slug];

    if (!service) {
      throw new BadRequestException(`Unknown game slug: ${slug}`);
    }

    return await service.withdraw(id, balance, remark);
  }
}
