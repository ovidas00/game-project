import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { GameService } from '../services/game.service';

@Controller('admin/games')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get()
  getAllGames() {
    return this.gameService.getAllGames();
  }

  @Get(':slug/players')
  getPlayerList(
    @Param('slug') slug: string,
    @Query()
    query: {
      limit?: number;
      page?: number;
      id?: string;
      account?: string;
      nickname?: string;
    },
  ) {
    return this.gameService.getPlayerList(slug, query);
  }

  @Post(':slug/player')
  addPlayer(
    @Param('slug') slug: string,
    @Body()
    body: {
      username?: string;
      nickname?: string;
      password?: string;
      money?: number;
    },
  ) {
    return this.gameService.addPlayer(
      slug,
      body.username,
      body.nickname,
      body.password,
      body.money,
    );
  }

  @Post(':slug/player/recharge')
  recharge(
    @Param('slug') slug: string,
    @Body()
    body: {
      id: string;
      balance: number;
      remark?: string;
    },
  ) {
    return this.gameService.recharge(slug, body.id, body.balance, body.remark);
  }

  @Post(':slug/player/withdraw')
  withdraw(
    @Param('slug') slug: string,
    @Body()
    body: {
      id: string;
      balance: number;
      remark?: string;
    },
  ) {
    return this.gameService.withdraw(slug, body.id, body.balance, body.remark);
  }

  @Post(':slug/player/reset-password')
  resetPassword(
    @Param('slug') slug: string,
    @Body()
    body: {
      id: string;
      password: string;
      password_confirmation: string;
    },
  ) {
    return this.gameService.resetPassword(
      slug,
      body.id,
      body.password,
      body.password_confirmation,
    );
  }

  @Post(':slug/login')
  login(@Param('slug') slug: string) {
    return this.gameService.login(slug);
  }
}
