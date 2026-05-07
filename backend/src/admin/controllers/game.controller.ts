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
}
