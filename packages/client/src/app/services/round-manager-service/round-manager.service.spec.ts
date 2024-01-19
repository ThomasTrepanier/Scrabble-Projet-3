/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-classes-per-file */
/* eslint-disable dot-notation */
import { Component } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ActionData, ActionType } from '@app/classes/actions/action-data';
import { PlayerData } from '@app/classes/communication';
import { StartGameData } from '@app/classes/communication/game-config';
import { RoundData } from '@app/classes/communication/round-data';
import { Player } from '@app/classes/player';
import { Round } from '@app/classes/round/round';
import { Timer } from '@app/classes/round/timer';
import { Tile } from '@app/classes/tile';
import { DEFAULT_PLAYER } from '@app/constants/game-constants';
import { ROUTE_GAME, ROUTE_HOME } from '@app/constants/routes-constants';
import { INVALID_ROUND_DATA_PLAYER, NO_CURRENT_ROUND } from '@app/constants/services-errors';
import { ActionService } from '@app/services/action-service/action.service';
import { GameViewEventManagerService } from '@app/services/game-view-event-manager-service/game-view-event-manager.service';
import RoundManagerService from '@app/services/round-manager-service/round-manager.service';
import { Observable, Subject, Subscription } from 'rxjs';
import SpyObj = jasmine.SpyObj;
import { HttpClientTestingModule } from '@angular/common/http/testing';

class RoundManagerServiceWrapper {
    roundManagerService: RoundManagerService;
    pCurrentRound: Round;

    constructor(roundManagerService: RoundManagerService) {
        this.roundManagerService = roundManagerService;
        this.currentRound = roundManagerService.currentRound;
    }

    get currentRound(): Round {
        return this.pCurrentRound;
    }

    set currentRound(round: Round) {
        this.pCurrentRound = round;
    }
}

@Component({
    template: '',
})
class TestComponent {}

const DEFAULT_MAX_ROUND_TIME = 60;
const ONE_MINUTE_TIMER = new Timer(1, 0);
const DEFAULT_PLAYER_NAME = 'name';
const DEFAULT_PLAYER_ID = 'id';
const DEFAULT_PLAYER_SCORE = 420;
const DEFAULT_PLAYER_TILES: Tile[] = [];

const TIME_INTERVAL = 1000;
const PAST_DATE = new Date(Date.now() - TIME_INTERVAL);
const CURRENT_DATE = new Date(Date.now());
const FUTURE_DATE = new Date(Date.now() + TIME_INTERVAL);
const USER1 = { username: 'user1', email: 'email1', avatar: 'avatar1' };
const DEFAULT_PLAYER_DATA: PlayerData = { publicUser: USER1, id: 'id', score: 1, tiles: [{ letter: 'A', value: 1 }] };

describe('RoundManagerService', () => {
    let service: RoundManagerService;
    let actionServiceSpy: SpyObj<ActionService>;
    let gameViewEventSpy: SpyObj<GameViewEventManagerService>;

    const currentRound: Round = {
        player: DEFAULT_PLAYER,
        startTime: new Date(PAST_DATE),
        limitTime: new Date(CURRENT_DATE),
        completedTime: null,
    };

    beforeEach(() => {
        actionServiceSpy = jasmine.createSpyObj('ActionService', ['createActionData', 'sendAction']);

        const resetSubject = new Subject();
        gameViewEventSpy = jasmine.createSpyObj('GameViewEventManagerService', ['subscribeToGameViewEvent', 'emitGameViewEvent']);
        gameViewEventSpy.subscribeToGameViewEvent.and.callFake((eventType: string, destroy$: Observable<boolean>, next: any) => {
            if (eventType !== 'resetServices') return new Subscription();
            return resetSubject.subscribe(next);
        });
        gameViewEventSpy.emitGameViewEvent.and.callFake((eventType: string, payload?: any) => {
            if (eventType !== 'resetServices') return;
            resetSubject.next(payload);
        });
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                RouterTestingModule.withRoutes([
                    { path: 'game', component: TestComponent },
                    { path: 'home', component: TestComponent },
                ]),
            ],
            providers: [
                { provide: ActionService, useValue: actionServiceSpy },
                { provide: GameViewEventManagerService, useValue: gameViewEventSpy },
            ],
        });
        service = TestBed.inject(RoundManagerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('on resetServices event, should call resetServiceData', () => {
        const resetDataSpy = spyOn(service, 'resetServiceData').and.callFake(() => {
            return;
        });
        gameViewEventSpy.emitGameViewEvent('resetServices');
        expect(resetDataSpy).toHaveBeenCalled();
    });

    it('ngOnDestroy should call serviceDestroyed$.complete', () => {
        const completeSpy = spyOn(service['serviceDestroyed$'], 'complete').and.callFake(() => {
            return;
        });
        service.ngOnDestroy();
        expect(completeSpy).toHaveBeenCalled();
    });

    it('initialize should define attributes with provided information', () => {
        const roundData: RoundData = {
            playerData: DEFAULT_PLAYER_DATA,
            startTime: CURRENT_DATE,
            limitTime: FUTURE_DATE,
            completedTime: null,
        };
        const round: Round = {
            player: new Player(DEFAULT_PLAYER_DATA.id, USER1, DEFAULT_PLAYER_DATA.tiles!),
            startTime: roundData.startTime,
            limitTime: roundData.limitTime,
            completedTime: roundData.completedTime,
        };
        spyOn(service, 'convertRoundDataToRound').and.returnValue(round);

        const gameId = 'gameId';
        const player2Data = DEFAULT_PLAYER_DATA;
        player2Data.id = 'notLocal';
        const player3Data = DEFAULT_PLAYER_DATA;
        player3Data.id = 'notLocal2';
        const player4Data = DEFAULT_PLAYER_DATA;
        player4Data.id = 'notLocal3';
        const startGameData: StartGameData = {
            player1: DEFAULT_PLAYER_DATA,
            player2: player2Data,
            player3: player3Data,
            player4: player4Data,
            maxRoundTime: DEFAULT_MAX_ROUND_TIME,
            gameId,
            board: [],
            tileReserve: [],
            round: roundData,
        };
        service.initialize(DEFAULT_PLAYER_DATA.id, startGameData);

        expect(service['gameId']).toEqual(startGameData.gameId);
        expect(service['localPlayerId']).toEqual(DEFAULT_PLAYER_DATA.id);
        expect(service['maxRoundTime']).toEqual(startGameData.maxRoundTime);
        expect(service.currentRound).toEqual(round);
    });

    it('initializeEvents should define attributes', () => {
        service.initializeEvents();
        expect(service['completedRounds']).toBeTruthy();
        expect(service['timerSource']).toBeTruthy();
        expect(service.timer).toBeTruthy();
        expect(service['endRoundEvent$']).toBeTruthy();
    });

    describe('convertRoundDataToRound', () => {
        it('should throw error if roundData.playerData.name is undefined', () => {
            const roundData = {
                playerData: {
                    id: DEFAULT_PLAYER_ID,
                    score: DEFAULT_PLAYER_SCORE,
                    tiles: DEFAULT_PLAYER_TILES,
                },
                startTime: CURRENT_DATE,
                limitTime: CURRENT_DATE,
                completedTime: null,
            };
            expect(() => service.convertRoundDataToRound(roundData)).toThrowError(INVALID_ROUND_DATA_PLAYER);
        });

        it('should throw error if roundData.playerData.tiles is undefined', () => {
            const roundData = {
                playerData: {
                    name: DEFAULT_PLAYER_NAME,
                    id: DEFAULT_PLAYER_ID,
                    score: DEFAULT_PLAYER_SCORE,
                },
                startTime: CURRENT_DATE,
                limitTime: CURRENT_DATE,
                completedTime: null,
            };
            expect(() => service.convertRoundDataToRound(roundData)).toThrowError(INVALID_ROUND_DATA_PLAYER);
        });

        it('should throw error if roundData.playerData.id is undefined', () => {
            const roundData = {
                playerData: {
                    name: DEFAULT_PLAYER_NAME,
                    id: DEFAULT_PLAYER_ID,
                    score: DEFAULT_PLAYER_SCORE,
                    tiles: DEFAULT_PLAYER_TILES,
                },
                startTime: CURRENT_DATE,
                limitTime: CURRENT_DATE,
                completedTime: null,
            };
            expect(() => service.convertRoundDataToRound(roundData)).toThrow();
        });

        it('should not throw error if roundData correct', () => {
            const roundData = {
                playerData: {
                    publicUser: USER1,
                    id: DEFAULT_PLAYER_ID,
                    score: DEFAULT_PLAYER_SCORE,
                    tiles: DEFAULT_PLAYER_TILES,
                },
                startTime: CURRENT_DATE,
                limitTime: CURRENT_DATE,
                completedTime: null,
            };
            expect(() => service.convertRoundDataToRound(roundData)).not.toThrow();
        });
    });

    describe('ResetServiceData', () => {
        let timeSourceSpy: unknown;

        beforeEach(() => {
            timeSourceSpy = spyOn(service['timerSource'], 'complete').and.callFake(() => {
                return;
            });
            service.resetServiceData();
        });

        it('resetServiceData should reset the gameId', () => {
            expect(service['gameId']).toEqual('');
        });

        it('resetServiceData should reset the localPlayerId', () => {
            expect(service['localPlayerId']).toEqual('');
        });

        it('resetServiceData should reset the completed rounds', () => {
            expect(service['completedRounds']).toEqual([]);
        });

        it('resetServiceData should reset the max round time', () => {
            expect(service['maxRoundTime']).toEqual(0);
        });

        it('resetServiceData should complete timerSource', () => {
            expect(timeSourceSpy).toHaveBeenCalled();
        });
    });

    it('resetRoundData should reset round data attributes', () => {
        service['resetRoundData']();
        expect(service.currentRound).toBeFalsy();
        expect(service['completedRounds']).toEqual([]);
        expect(service['maxRoundTime']).toEqual(0);
    });

    describe('resetTimerData', () => {
        let clearTimeoutSpy: jasmine.Spy;
        let completeSpy: jasmine.Spy;
        let endRoundSpy: jasmine.Spy;

        beforeEach(() => {
            clearTimeoutSpy = spyOn(window, 'clearTimeout').and.callFake(() => {
                return;
            });
            completeSpy = spyOn(service['timerSource'], 'complete').and.callFake(() => {
                return;
            });
            endRoundSpy = spyOn(service['endRoundEvent$'], 'next').and.callFake(() => {
                return;
            });
            service.resetTimerData();
        });
        it('should call clearTimeout', () => {
            expect(clearTimeoutSpy).toHaveBeenCalled();
        });
        it('should call timerSource.complete', () => {
            expect(completeSpy).toHaveBeenCalled();
        });
        it('should call endRound event', () => {
            expect(endRoundSpy).toHaveBeenCalled();
        });
    });

    describe('UpdateRound', () => {
        let startRoundSpy: unknown;

        const updatedRound: Round = {
            player: DEFAULT_PLAYER,
            startTime: new Date(CURRENT_DATE),
            limitTime: new Date(FUTURE_DATE),
            completedTime: null,
        };

        beforeEach(() => {
            startRoundSpy = spyOn(service, 'startRound').and.callFake(() => {
                return;
            });
            currentRound.completedTime = null;
            service.currentRound = currentRound;
            service.updateRound(updatedRound);
        });

        it('startRound should set the old current round completed time to new round start time', () => {
            const numberOfRounds = service['completedRounds'].length;
            expect(service['completedRounds'][numberOfRounds - 1].completedTime).toEqual(updatedRound.startTime);
        });

        it('startRound should append old current round to the completed rounds array', () => {
            const numberOfRounds = service['completedRounds'].length;
            const lastRoundInArray = service['completedRounds'][numberOfRounds - 1];
            currentRound.completedTime = updatedRound.startTime;

            expect(lastRoundInArray).toEqual(currentRound);
        });

        it('startRound should set the new current round to the updatedRound', () => {
            expect(service.currentRound).toEqual(updatedRound);
        });

        it('startRound should call startRound', () => {
            expect(startRoundSpy).toHaveBeenCalled();
        });
    });

    describe('continueRound', () => {
        let startRoundSpy: unknown;
        let timeLeftSpy: unknown;

        const updatedRound: Round = {
            player: DEFAULT_PLAYER,
            startTime: new Date(CURRENT_DATE),
            limitTime: new Date(FUTURE_DATE),
            completedTime: null,
        };

        beforeEach(() => {
            startRoundSpy = spyOn(service, 'startRound').and.callFake(() => {
                return;
            });

            timeLeftSpy = spyOn<any>(service, 'timeLeft').and.callThrough();
            currentRound.completedTime = null;
            service.currentRound = currentRound;
        });

        it('continueRound should overwrite old current round ', () => {
            const numberOfRoundsBefore = service['completedRounds'].length;
            const roundBefore = service.currentRound;
            service.continueRound(updatedRound);
            const numberOfRoundsAfter = service['completedRounds'].length;
            expect(numberOfRoundsBefore).toEqual(numberOfRoundsAfter);
            expect(roundBefore).not.toEqual(service.currentRound);
        });

        it('continueRound should call timeLeft with new current round to the updatedRound', () => {
            service.continueRound(updatedRound);

            expect(timeLeftSpy).toHaveBeenCalled();
        });

        it('continueRound should next endRoundEvent', () => {
            const spy = spyOn(service['endRoundEvent$'], 'next').and.callFake(() => {
                return;
            });
            service.continueRound(updatedRound);
            expect(spy).toHaveBeenCalled();
        });

        it('continueRound should call startRound', () => {
            service.continueRound(updatedRound);
            expect(startRoundSpy).toHaveBeenCalled();
        });
    });

    describe('convertRoundDataToRound', () => {
        let roundData: RoundData;

        beforeEach(() => {
            roundData = {
                playerData: { ...DEFAULT_PLAYER_DATA },
                startTime: new Date(CURRENT_DATE),
                limitTime: new Date(FUTURE_DATE),
                completedTime: null,
            };
        });

        it('should not throw an error if roundData has all the information', () => {
            const result = () => service.convertRoundDataToRound(roundData);
            expect(result).not.toThrowError();
        });

        it('should throw an error if roundData is missing information', () => {
            let result = () => service.convertRoundDataToRound(roundData);
            roundData.playerData.id = DEFAULT_PLAYER_DATA.id;

            roundData.playerData.publicUser = undefined;
            result = () => service.convertRoundDataToRound(roundData);
            expect(result).toThrowError(INVALID_ROUND_DATA_PLAYER);
            roundData.playerData.publicUser = DEFAULT_PLAYER_DATA.publicUser;

            roundData.playerData.tiles = undefined;
            result = () => service.convertRoundDataToRound(roundData);
            expect(result).toThrowError(INVALID_ROUND_DATA_PLAYER);
        });
    });

    describe('getActivePlayer', () => {
        it('getActivePlayer should return the player of the current round', () => {
            service.currentRound = currentRound;
            expect(service.getActivePlayer()).toEqual(currentRound.player);
        });

        it('getActivePlayer should throw error if there is no current round', () => {
            const wrapper = new RoundManagerServiceWrapper(service);
            spyOnProperty(wrapper, 'currentRound', 'get').and.returnValue(null);
            service.currentRound = wrapper.currentRound;

            expect(() => service.getActivePlayer()).toThrowError(NO_CURRENT_ROUND);
        });
    });

    describe('isActivePlayerLocalPlayer', () => {
        it('isActivePlayerLocalPlayer should return true if localPlayerId matches activePlayer id', () => {
            service['localPlayerId'] = DEFAULT_PLAYER.id;
            service.currentRound = currentRound;
            expect(service['isActivePlayerLocalPlayer']()).toBeTrue();
        });

        it('isActivePlayerLocalPlayer should throw error if there is no current round', () => {
            service['localPlayerId'] = 'unknown';
            service.currentRound = currentRound;
            expect(service['isActivePlayerLocalPlayer']()).toBeFalse();
        });
    });

    describe('getActivePlayer', () => {
        it('getActivePlayer should return the player of the current round', () => {
            service.currentRound = currentRound;
            expect(service.getActivePlayer()).toEqual(currentRound.player);
        });

        it('getActivePlayer should throw error if there is no current round', () => {
            const wrapper = new RoundManagerServiceWrapper(service);
            spyOnProperty(wrapper, 'currentRound', 'get').and.returnValue(null);
            service.currentRound = wrapper.currentRound;

            expect(() => service.getActivePlayer()).toThrowError(NO_CURRENT_ROUND);
        });
    });

    describe('isActivePlayerLocalPlayer', () => {
        it('isActivePlayerLocalPlayer should return true if localPlayerId matches activePlayer id', () => {
            service['localPlayerId'] = DEFAULT_PLAYER.id;
            service.currentRound = currentRound;
            expect(service['isActivePlayerLocalPlayer']()).toBeTrue();
        });

        it('isActivePlayerLocalPlayer should throw error if there is no current round', () => {
            service['localPlayerId'] = 'unknown';
            service.currentRound = currentRound;
            expect(service['isActivePlayerLocalPlayer']()).toBeFalse();
        });
    });

    describe('StartRound', () => {
        const randomTimerValue = 69;
        let startTimerSpy: unknown;

        beforeEach(() => {
            startTimerSpy = spyOn<any>(service, 'startTimer').and.callFake(() => {
                return;
            });
        });

        it('startRound should set new timeout', () => {
            service.startRound();
            expect(service['timeout']).toBeTruthy();
        });

        it('startRound should call startTimer with passed timer value', () => {
            service.startRound(randomTimerValue);
            expect(startTimerSpy).toHaveBeenCalledWith(randomTimerValue);
        });

        it('startRound should call startTimer with maxRoundTime if no value is provided', () => {
            service.startRound();
            expect(startTimerSpy).toHaveBeenCalledWith(service['maxRoundTime']);
        });
    });

    it('startTimer should send new timer with right values', () => {
        const timerSourceSpy = spyOn(service['timerSource'], 'next').and.callFake(() => {
            return;
        });
        service['maxRoundTime'] = DEFAULT_MAX_ROUND_TIME;
        const newTimer = ONE_MINUTE_TIMER;

        service.currentRound = currentRound;
        const activePlayer = currentRound.player;

        service['startTimer'](DEFAULT_MAX_ROUND_TIME);
        expect(timerSourceSpy).toHaveBeenCalledOnceWith([newTimer, activePlayer]);
    });

    describe('RoundTimeout', () => {
        let endRoundEventSpy: unknown;
        const fakeData = { fake: 'data' };

        beforeEach(() => {
            endRoundEventSpy = spyOn(service['endRoundEvent$'], 'next').and.callFake(() => {
                return;
            });
            spyOn(service, 'getActivePlayer').and.returnValue(DEFAULT_PLAYER);

            actionServiceSpy.createActionData.and.returnValue(fakeData as unknown as ActionData);
            actionServiceSpy.sendAction.and.callFake(() => {
                return;
            });
        });

        it('RoundTimeout should not timeout if user is not on /game', fakeAsync(() => {
            const router: Router = TestBed.inject(Router);
            router.navigateByUrl(ROUTE_HOME);
            tick();

            service['roundTimeout']();
            expect(endRoundEventSpy).not.toHaveBeenCalled();
        }));

        it('RoundTimeout should not send pass event if the local player is not the active player', () => {
            spyOn<any>(service, 'isActivePlayerLocalPlayer').and.returnValue(false);
            service['roundTimeout']();
            expect(actionServiceSpy.sendAction).not.toHaveBeenCalled();
        });

        it('RoundTimeout should emit endRoundEvent', fakeAsync(() => {
            const router: Router = TestBed.inject(Router);
            router.navigateByUrl(ROUTE_GAME);
            tick();
            spyOn<any>(service, 'isActivePlayerLocalPlayer').and.returnValue(true);

            service['roundTimeout']();
            expect(endRoundEventSpy).toHaveBeenCalled();
        }));

        it('RoundTimeout should send pass action when local player is active player', fakeAsync(() => {
            const router: Router = TestBed.inject(Router);
            router.navigateByUrl(ROUTE_GAME);
            tick();
            spyOn<any>(service, 'isActivePlayerLocalPlayer').and.returnValue(true);

            service['roundTimeout']();
            expect(actionServiceSpy.createActionData).toHaveBeenCalledWith(ActionType.PASS, {});
            expect(actionServiceSpy.sendAction).toHaveBeenCalledOnceWith(service['gameId'], fakeData as unknown as ActionData);
        }));
    });
});
