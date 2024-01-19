import { Injectable } from '@angular/core';
import { GAME_ID_COOKIE, SOCKET_ID_COOKIE, TIME_TO_RECONNECT } from '@app/constants/game-constants';
import { NO_LOCAL_PLAYER } from '@app/constants/services-errors';
import { GamePlayController } from '@app/controllers/game-play-controller/game-play.controller';
import { CookieService } from '@app/services/cookie-service/cookie.service';
import GameService from '@app/services/game-service/game.service';
import { GameViewEventManagerService } from '@app/services/game-view-event-manager-service/game-view-event-manager.service';

@Injectable({
    providedIn: 'root',
})
export class ReconnectionService {
    constructor(
        private readonly gamePlayController: GamePlayController,
        private readonly gameService: GameService,
        private readonly cookieService: CookieService,
        private readonly gameViewEventManagerService: GameViewEventManagerService,
    ) {}

    reconnectGame(): void {
        const gameIdCookie: string = this.cookieService.getCookie(GAME_ID_COOKIE);
        const socketIdCookie: string = this.cookieService.getCookie(SOCKET_ID_COOKIE);

        if (this.isGameIdCookieAbsent(gameIdCookie)) {
            this.gameViewEventManagerService.emitGameViewEvent('noActiveGame');
            return;
        }
        this.cookieService.eraseCookie(GAME_ID_COOKIE);
        this.cookieService.eraseCookie(SOCKET_ID_COOKIE);

        this.gamePlayController.handleReconnection(gameIdCookie, socketIdCookie);
    }

    disconnectGame(): void {
        const gameId = this.gameService.getGameId();
        const localPlayerId = this.gameService.getLocalPlayerId();
        this.gameService.resetServiceData();

        if (!localPlayerId) throw new Error(NO_LOCAL_PLAYER);
        this.cookieService.setCookie(GAME_ID_COOKIE, gameId, TIME_TO_RECONNECT);
        this.cookieService.setCookie(SOCKET_ID_COOKIE, localPlayerId, TIME_TO_RECONNECT);
        this.gamePlayController.handleDisconnection(gameId);
    }

    private isGameIdCookieAbsent(gameIdCookie: string): boolean {
        return gameIdCookie === '' && gameIdCookie.length <= 0;
    }
}
