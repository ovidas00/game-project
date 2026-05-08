import { Module } from '@nestjs/common';
import { GameController } from './controllers/game.controller';
import { GameService } from './services/game.service';
import { GameroomService } from 'src/game/gameroom.service';
import { MafiaService } from 'src/game/mafia.service';
import { RechargeProcessor } from './services/recharge.processor';
import { WithdrawProcessor } from './services/withdraw.processor';

@Module({
  controllers: [GameController],
  providers: [
    GameService,
    GameroomService,
    MafiaService,
    RechargeProcessor,
    WithdrawProcessor,
  ],
})
export class AdminModule {}
