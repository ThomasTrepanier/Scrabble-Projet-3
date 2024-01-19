import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ActionType } from '@app/classes/actions/action-data';
import { StartGameData } from '@app/classes/communication/game-config';
import { RoundData } from '@app/classes/communication/round-data';
import { Player } from '@app/classes/player';
import { Round } from '@app/classes/round/round';
import { Timer } from '@app/classes/round/timer';
import { DEFAULT_PLAYER, MINIMUM_TIMER_TIME, SECONDS_TO_MILLISECONDS } from '@app/constants/game-constants';
import { INVALID_ROUND_DATA_PLAYER, NO_CURRENT_ROUND } from '@app/constants/services-errors';
import { ActionService } from '@app/services/action-service/action.service';
import { GameViewEventManagerService } from '@app/services/game-view-event-manager-service/game-view-event-manager.service';
import { IResetServiceData } from '@app/utils/i-reset-service-data/i-reset-service-data';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export default class RoundManagerService implements IResetServiceData, OnDestroy {
    currentRound: Round;
    timer: Observable<[timer: Timer, activePlayer: Player]>;
    activePlayer: BehaviorSubject<Player | undefined>;

    private gameId: string;
    private localPlayerId: string;
    private completedRounds: Round[];
    private maxRoundTime: number;
    private endRoundEvent$: Subject<void>;
    private timerSource: BehaviorSubject<[timer: Timer, activePlayer: Player]>;
    private timeout: ReturnType<typeof setTimeout>;
    private serviceDestroyed$: Subject<boolean>;

    constructor(
        private router: Router,
        private readonly actionService: ActionService,
        private readonly gameViewEventManagerService: GameViewEventManagerService,
    ) {
        this.serviceDestroyed$ = new Subject();
        this.activePlayer = new BehaviorSubject<Player | undefined>(undefined);
        this.initializeEvents();
        this.gameViewEventManagerService.subscribeToGameViewEvent('resetServices', this.serviceDestroyed$, () => this.resetServiceData());
    }

    ngOnDestroy(): void {
        this.serviceDestroyed$.next(true);
        this.serviceDestroyed$.complete();
    }

    subscribeToEndRoundEvent(destroy$: Observable<boolean>, next: () => void): Subscription {
        return this.endRoundEvent$.pipe(takeUntil(destroy$)).subscribe(next);
    }

    initialize(localPlayerId: string, startGameData: StartGameData): void {
        this.gameId = startGameData.gameId;
        this.localPlayerId = localPlayerId;
        this.maxRoundTime = startGameData.maxRoundTime;
        this.currentRound = this.convertRoundDataToRound(startGameData.round);
    }

    initializeEvents(): void {
        this.completedRounds = [];
        this.timerSource = new BehaviorSubject<[timer: Timer, activePlayer: Player]>([new Timer(0, 0), DEFAULT_PLAYER]);
        this.timer = this.timerSource.asObservable();
        this.endRoundEvent$ = new Subject();
    }

    convertRoundDataToRound(roundData: RoundData): Round {
        if (roundData.playerData.id && roundData.playerData.publicUser && roundData.playerData.tiles) {
            return {
                player: new Player(roundData.playerData.id, roundData.playerData.publicUser, roundData.playerData.tiles),
                startTime: roundData.startTime,
                limitTime: roundData.limitTime,
                completedTime: roundData.completedTime,
            };
        }
        throw Error(INVALID_ROUND_DATA_PLAYER);
    }

    resetServiceData(): void {
        this.gameId = '';
        this.localPlayerId = '';
        this.resetRoundData();
        this.resetTimerData();
        this.endRoundEvent$ = new Subject();
    }

    resetTimerData(): void {
        clearTimeout(this.timeout);
        this.timerSource.complete();
        this.endRoundEvent$.next();
    }

    updateRound(round: Round): void {
        this.currentRound.completedTime = round.startTime;
        this.completedRounds.push(this.currentRound);
        this.currentRound = round;
        this.endRoundEvent$.next();
        this.activePlayer.next(this.currentRound.player);
        this.startRound();
    }

    continueRound(round: Round): void {
        this.currentRound = round;
        this.endRoundEvent$.next();
        this.startRound(this.timeLeft(round.limitTime));
    }

    getActivePlayer(): Player {
        if (!this.currentRound) {
            throw new Error(NO_CURRENT_ROUND);
        }
        return this.currentRound.player;
    }

    startRound(roundTime?: number): void {
        clearTimeout(this.timeout);
        roundTime = roundTime ? roundTime : this.maxRoundTime;
        this.timeout = setTimeout(() => this.roundTimeout(), roundTime * SECONDS_TO_MILLISECONDS);
        this.startTimer(roundTime);
    }

    isActivePlayerLocalPlayer(): boolean {
        return this.getActivePlayer().id === this.localPlayerId;
    }

    private resetRoundData(): void {
        this.currentRound = null as unknown as Round;
        this.completedRounds = [];
        this.maxRoundTime = 0;
        this.activePlayer.next(undefined);
    }

    private timeLeft(limitTime: Date): number {
        return Math.max((new Date(limitTime).getTime() - new Date(Date.now()).getTime()) / SECONDS_TO_MILLISECONDS, MINIMUM_TIMER_TIME);
    }

    private startTimer(time: number): void {
        this.timerSource.next([Timer.convertTime(time), this.getActivePlayer()]);
    }

    private roundTimeout(): void {
        if (this.router.url === '/game' && this.isActivePlayerLocalPlayer()) {
            this.activePlayer.next(undefined);
            this.endRoundEvent$.next();
            this.actionService.sendAction(this.gameId, this.actionService.createActionData(ActionType.PASS, {}));
        }
    }
}
