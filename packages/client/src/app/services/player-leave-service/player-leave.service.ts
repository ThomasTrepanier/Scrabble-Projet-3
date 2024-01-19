import { Injectable, OnDestroy } from '@angular/core';
import { PlayerLeavesController } from '@app/controllers/player-leave-controller/player-leave.controller';
import { GameService } from '@app/services/';
import GameDispatcherService from '@app/services/game-dispatcher-service/game-dispatcher.service';
import { GameViewEventManagerService } from '@app/services/game-view-event-manager-service/game-view-event-manager.service';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class PlayerLeavesService implements OnDestroy {
    private serviceDestroyed$: Subject<boolean> = new Subject();

    constructor(
        private readonly playerLeavesController: PlayerLeavesController,
        private readonly gameDispatcherService: GameDispatcherService,
        private readonly gameService: GameService,
        private readonly gameViewEventManager: GameViewEventManagerService,
    ) {
        this.playerLeavesController.subscribeToResetGameEvent(this.serviceDestroyed$, () => {
            this.gameViewEventManager.emitGameViewEvent('resetServices');
        });
    }

    ngOnDestroy(): void {
        this.serviceDestroyed$.next(true);
        this.serviceDestroyed$.complete();
    }

    handleLocalPlayerLeavesGame(): void {
        this.playerLeavesController.handleLeaveGame(this.gameService.getGameId());
        this.gameService.resetGameId();
        this.gameViewEventManager.emitGameViewEvent('newMessage', null);
    }

    handleLeaveGroup(): void {
        const gameId = this.gameDispatcherService.getCurrentGroupId();
        if (gameId) this.playerLeavesController.handleLeaveGame(gameId);
        this.gameDispatcherService.resetServiceData();
    }
}
