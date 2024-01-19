/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable dot-notation */
import { TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { Player } from '@app/classes/player';
import { PlayerContainer } from '@app/classes/player/player-container';
import { GameDispatcherController } from '@app/controllers/game-dispatcher-controller/game-dispatcher.controller';
import { UNKOWN_USER } from '@common/models/user';
import { ReconnectionService } from './reconnection.service';
import SpyObj = jasmine.SpyObj;
import { HttpClientTestingModule } from '@angular/common/http/testing';

const USER1 = { username: 'user1', email: 'email1', avatar: 'avatar1' };
describe('ReconnectionService', () => {
    let service: ReconnectionService;
    let gameDispatcherSpy: SpyObj<GameDispatcherController>;

    beforeEach(() => {
        gameDispatcherSpy = jasmine.createSpyObj('GameDispatcherController', ['configureSocket', 'subscribeToInitializeGame']);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule, MatSnackBarModule, MatDialogModule],
            providers: [{ provide: GameDispatcherController, useValue: gameDispatcherSpy }],
        });
        service = TestBed.inject(ReconnectionService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('reconnectGame', () => {
        it('reconnect if there is a cookie', () => {
            const getCookieSpy = spyOn(service['cookieService'], 'getCookie').and.returnValue('cookie');
            const eraseCookieSpy = spyOn(service['cookieService'], 'eraseCookie');
            const handleReconnectionSpy = spyOn(service['gamePlayController'], 'handleReconnection');

            service.reconnectGame();
            expect(getCookieSpy).toHaveBeenCalled();
            expect(eraseCookieSpy).toHaveBeenCalled();
            expect(handleReconnectionSpy).toHaveBeenCalled();
        });

        it('not reconnect if there is no cookie and emit', () => {
            const getCookieSpy = spyOn(service['cookieService'], 'getCookie').and.returnValue('');
            const handleReconnectionSpy = spyOn(service['gamePlayController'], 'handleReconnection');

            const emitSpy = spyOn(service['gameViewEventManagerService'], 'emitGameViewEvent');
            service.reconnectGame();

            expect(getCookieSpy).toHaveBeenCalled();
            expect(emitSpy).toHaveBeenCalledWith('noActiveGame');
            expect(handleReconnectionSpy).not.toHaveBeenCalled();
        });
    });

    describe('disconnectGame', () => {
        let localPlayerSpy: jasmine.Spy;
        let cookieGameSpy: jasmine.Spy;
        let gameControllerSpy: jasmine.Spy;
        beforeEach(() => {
            service['gameService']['playerContainer'] = new PlayerContainer('p1', false);
            service['gameService']['playerContainer']!['players'].set(1, new Player('p1', UNKOWN_USER, []));
            service['gameService']['playerContainer']!['players'].set(2, new Player('p2', USER1, []));
            localPlayerSpy = spyOn(service['gameService'], 'getLocalPlayerId').and.callThrough();

            cookieGameSpy = spyOn(service['cookieService'], 'setCookie').and.callFake(() => {
                return;
            });
            gameControllerSpy = spyOn(service['gamePlayController'], 'handleDisconnection').and.callFake(() => {
                return;
            });
        });

        it('should call getLocalPlayerId();', () => {
            service.disconnectGame();
            expect(localPlayerSpy).toHaveBeenCalled();
        });

        it('should empty gameId, playerId1, playerId2 and localPlayerId', () => {
            service.disconnectGame();
            expect(service['gameService']['gameId']).toEqual('');
            expect(service['gameService']['playerContainer']).toBeUndefined();
        });

        it('!localPlayerId) throw new Error(NO_LOCAL_PLAYER);', () => {
            localPlayerSpy.and.callFake(() => {
                return undefined;
            });
            expect(() => service.disconnectGame()).toThrow();
        });

        it('should call cookieService.setCookie(GAME_ID_COOKIE, gameId, TIME_TO_RECONNECT);', () => {
            service.disconnectGame();
            expect(cookieGameSpy).toHaveBeenCalledTimes(2);
        });

        it('should call gameController.handleDisconnection);', () => {
            service.disconnectGame();
            expect(gameControllerSpy).toHaveBeenCalled();
        });
    });

    it('isGameIdCookieAbsent should return true if the string is empty', () => {
        const gameIdCookie = '';
        expect(service['isGameIdCookieAbsent'](gameIdCookie)).toBeTrue();
    });
});
