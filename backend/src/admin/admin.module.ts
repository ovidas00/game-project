import { Module } from '@nestjs/common';
import { GameController } from './controllers/game.controller';
import { GameService } from './services/game.service';
import { GameroomService } from 'src/game/gameroom.service';
import { MafiaService } from 'src/game/mafia.service';

@Module({
  controllers: [GameController],
  providers: [GameService, GameroomService, MafiaService],
})
export class AdminModule {}
