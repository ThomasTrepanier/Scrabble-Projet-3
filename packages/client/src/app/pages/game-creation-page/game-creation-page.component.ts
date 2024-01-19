import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';
import { NAME_VALIDATION } from '@app/constants/name-validation';
import { GameDispatcherService } from '@app/services';
import { gameSettings } from '@app/utils/settings';
import { GameVisibility } from '@common/models/game-visibility';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-game-creation-page',
    templateUrl: './game-creation-page.component.html',
    styleUrls: ['./game-creation-page.component.scss'],
})
export class GameCreationPageComponent implements OnDestroy {
    virtualPlayerLevels: typeof VirtualPlayerLevel;
    gameVisibilities: typeof GameVisibility;
    gameParameters: FormGroup;

    isCreatingGame: boolean;
    password: string = '';
    isPasswordValid: boolean = false;

    private pageDestroyed$: Subject<boolean>;

    constructor(private gameDispatcherService: GameDispatcherService) {
        this.virtualPlayerLevels = VirtualPlayerLevel;
        this.gameVisibilities = GameVisibility;
        this.pageDestroyed$ = new Subject();
        this.gameParameters = new FormGroup({
            level: new FormControl(VirtualPlayerLevel.Beginner),
            visibility: new FormControl(GameVisibility.Public),
            timer: new FormControl(gameSettings.getTimer(), Validators.required),
            password: new FormControl('', [
                Validators.required,
                Validators.minLength(NAME_VALIDATION.minLength),
                Validators.maxLength(NAME_VALIDATION.maxLength),
                Validators.pattern(NAME_VALIDATION.rule),
            ]),
        });

        this.isCreatingGame = false;

        this.gameDispatcherService.observeGameCreationFailed().pipe(takeUntil(this.pageDestroyed$));
    }

    ngOnDestroy(): void {
        this.pageDestroyed$.next(true);
        this.pageDestroyed$.complete();
    }

    isFormValid(): boolean {
        return (
            (this.gameParameters?.get('timer')?.valid ?? true) &&
            (this.gameParameters?.get('visibility')?.value !== GameVisibility.Protected || (this.gameParameters?.get('password')?.valid ?? false))
        );
    }

    onSubmit(): void {
        if (this.isFormValid()) {
            gameSettings.set('timer', this.gameParameters.get('timer')?.value);
            this.createGame();
        }
    }

    private createGame(): void {
        this.isCreatingGame = true;
        this.gameDispatcherService.handleCreateGame(this.gameParameters);
    }
}
