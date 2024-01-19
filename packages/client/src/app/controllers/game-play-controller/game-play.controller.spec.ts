/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActionData, ActionType } from '@app/classes/actions/action-data';
import { GameUpdateData } from '@app/classes/communication';
import { Message } from '@app/classes/communication/message';
import { SocketTestHelper } from '@app/classes/socket-test-helper/socket-test-helper.spec';
import { HTTP_ABORT_ERROR } from '@app/constants/controllers-errors';
import { SYSTEM_ID } from '@app/constants/game-constants';
import SocketService from '@app/services/socket-service/socket.service';
import { TilePlacement } from '@common/models/tile-placement';
import { Observable, of, Subscription } from 'rxjs';
import { Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { GamePlayController } from './game-play.controller';

const DEFAULT_GAME_ID = 'grogarsID';

describe('GamePlayController', () => {
    let controller: GamePlayController;
    let httpMock: HttpTestingController;
    let socketServiceMock: SocketService;
    let socketHelper: SocketTestHelper;

    beforeEach(async () => {
        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketService(jasmine.createSpyObj('AlertService', ['alert', 'error', 'warn', 'success', 'info']));
        socketServiceMock['socket'] = socketHelper as unknown as Socket;
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule],
            providers: [{ provide: SocketService, useValue: socketServiceMock }],
        });
        controller = TestBed.inject(GamePlayController);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should create', () => {
        expect(controller).toBeTruthy();
    });

    describe('Configure Socket', () => {
        it('On gameUpdate, should push new gameUpdate', () => {
            const spy = spyOn(controller['gameUpdate$'], 'next').and.callFake(() => {
                return;
            });
            const gameUpdateData: GameUpdateData = {
                isGameOver: true,
            };
            socketHelper.peerSideEmit('gameUpdate', gameUpdateData);
            expect(spy).toHaveBeenCalled();
        });

        it('On newMessage, should push new message', () => {
            const spy = spyOn(controller['newMessage$'], 'next').and.callFake(() => {
                return;
            });
            const newMessage: Message = {
                content: 'Allo',
                senderId: SYSTEM_ID,
                gameId: DEFAULT_GAME_ID,
            };
            socketHelper.peerSideEmit('newMessage', newMessage);
            expect(spy).toHaveBeenCalled();
        });

        it('on TilePlacement should push new tile placement', () => {
            const spy = spyOn(controller['tilePlacement$'], 'next').and.callFake(() => {
                return;
            });

            const tilePlacement: TilePlacement = {
                tile: { letter: 'A', value: 1 },
                position: { row: 0, column: 0 },
            };

            socketHelper.peerSideEmit('tilePlacement', tilePlacement);
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('HTTP', () => {
        it('sendAction should post action to endpoint', () => {
            const typedInput = '';
            const httpPostSpy = spyOn(controller['http'], 'post').and.returnValue(of(true) as any);
            const actionData: ActionData = {
                type: ActionType.PASS,
                input: typedInput,
                payload: {},
            };
            const endpoint = `${environment.serverUrl}/games/${DEFAULT_GAME_ID}/players/action`;

            controller.sendAction(DEFAULT_GAME_ID, actionData);
            expect(httpPostSpy).toHaveBeenCalledWith(endpoint, { type: actionData.type, payload: actionData.payload, input: typedInput });
        });

        it('sendAction should post message to endpoint', () => {
            const httpPostSpy = spyOn(controller['http'], 'post').and.returnValue(of(true) as any);
            const newMessage: Message = {
                content: 'Allo',
                senderId: SYSTEM_ID,
                gameId: DEFAULT_GAME_ID,
            };
            const endpoint = `${environment.serverUrl}/games/${DEFAULT_GAME_ID}/players/message`;

            controller.sendMessage(DEFAULT_GAME_ID, newMessage);
            expect(httpPostSpy).toHaveBeenCalledWith(endpoint, newMessage);
        });

        it('sendError should post error to endpoint', () => {
            const httpPostSpy = spyOn(controller['http'], 'post').and.returnValue(of(true) as any);
            const newMessage: Message = {
                content: 'error',
                senderId: SYSTEM_ID,
                gameId: DEFAULT_GAME_ID,
            };
            const endpoint = `${environment.serverUrl}/games/${DEFAULT_GAME_ID}/players/error`;

            controller.sendError(DEFAULT_GAME_ID, newMessage);
            expect(httpPostSpy).toHaveBeenCalledWith(endpoint, newMessage);
        });
    });

    it('HandleReconnection should post newPlayerId to reconnect endpoint', () => {
        const httpPostSpy = spyOn(controller['http'], 'post').and.returnValue(of(true) as any);
        const newPlayerId = 'NEW_ID';
        const endpoint = `${environment.serverUrl}/games/${DEFAULT_GAME_ID}/players/reconnect`;

        controller.handleReconnection(DEFAULT_GAME_ID, newPlayerId);
        expect(httpPostSpy).toHaveBeenCalledWith(endpoint, { newPlayerId });
    });

    it('HandleDisconnect should send DELETE to disconnect endpoint', () => {
        const observable = new Observable();
        const httpDeleteSpy = spyOn(controller['http'], 'delete').and.returnValue(observable);
        spyOn(observable, 'subscribe').and.callFake(() => {
            return new Subscription();
        });

        controller.handleDisconnection(DEFAULT_GAME_ID);
        expect(httpDeleteSpy).toHaveBeenCalled();
    });

    it('HandleDisconnect should handle error if necessary', () => {
        const observable = new Observable();
        spyOn(controller['http'], 'delete').and.returnValue(observable);
        const observableSpy = spyOn(observable, 'subscribe').and.callFake(() => {
            return new Subscription();
        });

        controller.handleDisconnection(DEFAULT_GAME_ID);
        expect(observableSpy).toHaveBeenCalledWith(controller['handleDisconnectResponse'], controller['handleDisconnectError']);
    });

    it('handleDisconnectResponse should exist', () => {
        expect(controller['handleDisconnectResponse']()).toBeUndefined();
    });

    it('handleDisconnectError should throw error if status is NOT HTTP_ABORT_ERROR', () => {
        const error: { message: string; status: number } = {
            message: 'ABORT',
            status: 1,
        };
        expect(() => controller['handleDisconnectError'](error)).toThrowError(error.message);
    });

    it('handleDisconnectError should NOT throw error if status is HTTP_ABORT_ERROR', () => {
        const error: { message: string; status: number } = {
            message: 'ABORT',
            status: HTTP_ABORT_ERROR,
        };
        expect(() => controller['handleDisconnectError'](error)).not.toThrowError(error.message);
    });

    it('observeGameUpdate should return gameUpdate$ as observable', () => {
        const result: Observable<GameUpdateData> = controller.observeGameUpdate();
        expect(result).toEqual(controller['gameUpdate$'].asObservable());
    });

    it('obvserveNewMessage should return newMessage$ as observable', () => {
        const result: Observable<Message | null> = controller.observeNewMessage();
        expect(result).toEqual(controller['newMessage$'].asObservable());
    });

    it('observeActionDone should return actionDone$ as observable', () => {
        const result: Observable<void> = controller.observeActionDone();
        expect(result).toEqual(controller['actionDone$'].asObservable());
    });

    it('observetilePlacement should return tilePlacement$ as observable', () => {
        const result: Observable<TilePlacement[]> = controller.observeTilePlacement();
        expect(result).toEqual(controller['tilePlacement$'].asObservable());
    });
});
