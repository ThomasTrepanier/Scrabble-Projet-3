import { Component, OnDestroy, OnInit } from '@angular/core';
import { Timer } from '@app/classes/round/timer';
import { Observable, Subject, Subscription } from 'rxjs';
import RoundManagerService from '@app/services/round-manager-service/round-manager.service';
import { takeUntil } from 'rxjs/operators';
import { SECONDS_TO_MILLISECONDS } from '@app/constants/game-constants';
import { timer as timerCreationFunction } from 'rxjs/internal/observable/timer';
import { SoundService, LOW_TIME, SoundName } from '@app/services/sound-service/sound.service';

@Component({
    selector: 'app-game-timer',
    templateUrl: './game-timer.component.html',
    styleUrls: ['./game-timer.component.scss'],
})
export class GameTimerComponent implements OnInit, OnDestroy {
    timer: Timer;

    private timerSource: Observable<number>;
    private timerSubscription: Subscription;
    private componentDestroyed$: Subject<boolean>;

    constructor(private roundManager: RoundManagerService, private soundService: SoundService) {}

    ngOnInit(): void {
        this.timer = new Timer(0, 0);
        this.componentDestroyed$ = new Subject();

        if (this.roundManager.timer) {
            this.roundManager.timer.pipe(takeUntil(this.componentDestroyed$)).subscribe(([timer]) => {
                this.startTimer(timer);
            });
        }
        this.roundManager.subscribeToEndRoundEvent(this.componentDestroyed$, () => this.endRound());
    }

    ngOnDestroy() {
        this.componentDestroyed$.next(true);
        this.componentDestroyed$.complete();
    }

    isTimerRunning(): boolean {
        return this.timerSubscription !== undefined && !this.timerSubscription.closed;
    }

    private startTimer(timer: Timer): void {
        this.timer = timer;
        this.timerSource = this.createTimer(SECONDS_TO_MILLISECONDS);
        this.timerSubscription = this.timerSource.pipe(takeUntil(this.componentDestroyed$)).subscribe(() => {
            this.timer.decrement();
            if (this.roundManager.isActivePlayerLocalPlayer()) {
                if (this.timer?.getTime() === LOW_TIME) {
                    this.soundService.playSound(SoundName.LowTimeSound);
                }
            }
        });
    }

    private endRound(): void {
        this.timer = new Timer(0, 0);
        if (this.timerSubscription) {
            this.timerSubscription.unsubscribe();
        }
    }

    private createTimer(length: number): Observable<number> {
        return timerCreationFunction(0, length);
    }
}
