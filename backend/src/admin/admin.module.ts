import { Module } from '@nestjs/common';
import { GameController } from './controllers/game.controller';
import { GameService } from './services/game.service';
import { GameroomService } from 'src/game/gameroom.service';
import { MafiaService } from 'src/game/mafia.service';
import { RechargeProcessor } from './services/recharge.processor';
import { WithdrawProcessor } from './services/withdraw.processor';
import { CreatePlayerProcessor } from './services/create-player.processor';
import { ResetPasswordProcessor } from './services/reset-password.processor';
import { MrallinoneService } from 'src/game/mrallinone.service';
import { CashfrenzyService } from 'src/game/cashfrenzy.service';
import { CashmachineService } from 'src/game/cashmachine.service';

@Module({
  controllers: [GameController],
  providers: [
    GameService,
    GameroomService,
    MafiaService,
    MrallinoneService,
    CashfrenzyService,
    CashmachineService,
    CreatePlayerProcessor,
    RechargeProcessor,
    WithdrawProcessor,
    ResetPasswordProcessor,
  ],
})
export class AdminModule {}
