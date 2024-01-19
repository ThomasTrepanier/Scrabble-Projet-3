import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardService, GameService, SocketService as AppSocketService } from '@app/services';
import { InitializedGameService } from './services/game-service';
import { SocketService } from '@app/stories/services/socket-service';
import { GamePlayController as AppGamePlayController } from '@app/controllers/game-play-controller/game-play.controller';
import { GamePlayController } from './controllers/game-play-controller';
import { RouterTestingModule } from '@angular/router/testing';
import { PlayerLeavesService as AppPlayerLeavesService } from '@app/services/player-leave-service/player-leave.service';
import { PlayerLeavesService } from './services/player-leaves-service';
import { MatCardModule } from '@angular/material/card';

@NgModule({
    imports: [CommonModule, RouterTestingModule, MatCardModule],
    providers: [
        { provide: GameService, useClass: InitializedGameService },
        { provide: AppGamePlayController, useClass: GamePlayController },
        { provide: AppSocketService, useClass: SocketService },
        { provide: AppPlayerLeavesService, useClass: PlayerLeavesService },
        BoardService,
    ],
})
export class InitializedGameStoriesModule {}
