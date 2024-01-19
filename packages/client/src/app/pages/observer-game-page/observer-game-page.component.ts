import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DefaultDialogComponent } from '@app/components/default-dialog/default-dialog.component';
import { TileRackComponent } from '@app/components/tile-rack/tile-rack.component';
import { OBSERVER_HELP_DELAY, OBSERVER_HELP_MESSAGE } from '@app/constants/game-constants';
import {
    DIALOG_END_OF_GAME_CLOSE_BUTTON,
    DIALOG_END_OF_GAME_OBSERVER_CONTENT,
    DIALOG_END_OF_GAME_OBSERVER_TITLE,
    DIALOG_NO_ACTIVE_GAME_BUTTON,
    DIALOG_NO_ACTIVE_GAME_CONTENT,
    DIALOG_NO_ACTIVE_GAME_TITLE,
    DIALOG_QUIT_BUTTON_CONFIRM,
    DIALOG_QUIT_CONTENT,
    DIALOG_QUIT_STAY,
    DIALOG_QUIT_TITLE,
    DIALOG_REPLACE_BUTTON_CONFIRM,
    DIALOG_REPLACE_BUTTON_CONTINUE,
    DIALOG_REPLACE_CONTENT,
    DIALOG_REPLACE_TITLE,
} from '@app/constants/pages-constants';
import { ROUTE_HOME } from '@app/constants/routes-constants';
import { GameService } from '@app/services';
import { AlertService } from '@app/services/alert-service/alert.service';
import { GameViewEventManagerService } from '@app/services/game-view-event-manager-service/game-view-event-manager.service';
import { PlayerLeavesService } from '@app/services/player-leave-service/player-leave.service';
import { ReconnectionService } from '@app/services/reconnection-service/reconnection.service';
import { SoundName, SoundService } from '@app/services/sound-service/sound.service';
import { Subject } from 'rxjs';
const VIRTUAL_PLAYER_ID_PREFIX = 'virtual-player';
@Component({
    selector: 'app-observer-game-page',
    templateUrl: './observer-game-page.component.html',
    styleUrls: ['./observer-game-page.component.scss'],
})
export class ObserverGamePageComponent implements OnInit, OnDestroy {
    @ViewChild(TileRackComponent, { static: false }) tileRackComponent: TileRackComponent;
    observedPlayerNumber: number;
    private hasChangedPlayer: boolean = false;
    private componentDestroyed$: Subject<boolean>;

    constructor(
        public dialog: MatDialog,
        public gameService: GameService,
        private readonly reconnectionService: ReconnectionService,
        public surrenderDialog: MatDialog,
        private gameViewEventManagerService: GameViewEventManagerService,
        private playerLeavesService: PlayerLeavesService,
        private readonly alertService: AlertService,
        private readonly soundService: SoundService,
    ) {
        this.componentDestroyed$ = new Subject();
    }

    @HostListener('window:beforeunload')
    ngOnDestroy(): void {
        this.componentDestroyed$.next(true);
        this.componentDestroyed$.complete();
    }

    ngOnInit(): void {
        this.gameViewEventManagerService.subscribeToGameViewEvent('noActiveGame', this.componentDestroyed$, () => this.noActiveGameDialog());
        this.gameViewEventManagerService.subscribeToGameViewEvent('endOfGame', this.componentDestroyed$, (winnerNames: string[]) =>
            this.endOfGameDialog(winnerNames),
        );
        if (!this.gameService.getGameId()) {
            this.reconnectionService.reconnectGame();
        }

        setTimeout(() => {
            if (!this.hasChangedPlayer) this.alertService.info(OBSERVER_HELP_MESSAGE);
        }, OBSERVER_HELP_DELAY);
    }

    handleQuitButtonClick(): void {
        const title = DIALOG_QUIT_TITLE;
        const content = DIALOG_QUIT_CONTENT;
        const buttonsContent = [DIALOG_QUIT_BUTTON_CONFIRM, DIALOG_QUIT_STAY];
        this.openDialog(title, content, buttonsContent);
    }
    handleReplaceButtonClick() {
        const title = DIALOG_REPLACE_TITLE;
        const content = DIALOG_REPLACE_CONTENT(this.gameService.getLocalPlayer()?.publicUser.username ?? 'ce joueur virtuel');
        const buttonsContent = [DIALOG_REPLACE_BUTTON_CONTINUE, DIALOG_REPLACE_BUTTON_CONFIRM];
        this.openReplacementDialog(title, content, buttonsContent);
    }
    changeObservingPlayer(playerNumber: number): void {
        this.observedPlayerNumber = playerNumber;
        this.hasChangedPlayer = true;
        this.gameService.setLocalPlayer(playerNumber);
    }

    replaceObservingVirtualPlayer() {
        this.gameService.replaceVirtualPlayer(this.observedPlayerNumber);
    }

    getObservingPlayerId(): string | undefined {
        return this.gameService.getLocalPlayerId();
    }

    handleReplaceVirtualPlayerByObserver() {
        this.gameService.replaceVirtualPlayer(this.observedPlayerNumber);
    }

    isObservingVirtualPlayer() {
        return this.gameService.getLocalPlayerId()?.includes(VIRTUAL_PLAYER_ID_PREFIX);
    }

    get isGameOver(): boolean {
        return this.gameService.isGameOver;
    }

    private openDialog(title: string, content: string, buttonsContent: string[]): void {
        this.dialog.open(DefaultDialogComponent, {
            data: {
                title,
                content,
                buttons: [
                    {
                        content: buttonsContent[0],
                        redirect: ROUTE_HOME,
                        style: 'background-color: #FA6B84; color: rgb(0, 0, 0)',
                        action: () => this.handlePlayerLeaves(),
                    },
                    {
                        content: buttonsContent[1],
                        closeDialog: true,
                        style: 'background-color: rgb(231, 231, 231)',
                    },
                ],
            },
        });
    }
    private openReplacementDialog(title: string, content: string, buttonsContent: string[]): void {
        this.dialog.open(DefaultDialogComponent, {
            data: {
                title,
                content,
                buttons: [
                    {
                        content: buttonsContent[0],
                        style: 'background-color: #FA6B84; color: rgb(255, 255, 255)',
                        closeDialog: true,
                    },
                    {
                        content: buttonsContent[1],
                        closeDialog: true,
                        style: 'background-color: rgba(var(--primary); color: rgb(255, 255, 255);',
                        action: () => this.replaceObservingVirtualPlayer(),
                    },
                ],
            },
        });
    }

    private noActiveGameDialog(): void {
        this.dialog.open(DefaultDialogComponent, {
            data: {
                title: DIALOG_NO_ACTIVE_GAME_TITLE,
                content: DIALOG_NO_ACTIVE_GAME_CONTENT,
                buttons: [
                    {
                        content: DIALOG_NO_ACTIVE_GAME_BUTTON,
                        closeDialog: false,
                        redirect: ROUTE_HOME,
                        style: 'background-color: rgb(231, 231, 231)',
                        // We haven't been able to test that the right function is called because this
                        // arrow function creates a new instance of the function. We cannot spy on it.
                        // It totally works tho, try it!
                    },
                ],
            },
        });
    }

    private endOfGameDialog(winnerNames: string[]): void {
        this.soundService.playSound(SoundName.EndGameSound);

        this.dialog.open(DefaultDialogComponent, {
            data: {
                title: DIALOG_END_OF_GAME_OBSERVER_TITLE,
                content: DIALOG_END_OF_GAME_OBSERVER_CONTENT(winnerNames),
                buttons: [
                    {
                        content: DIALOG_QUIT_BUTTON_CONFIRM,
                        redirect: ROUTE_HOME,
                        style: 'background-color: rgb(231, 231, 231)',
                        // We haven't been able to test that the right function is called because this
                        // arrow function creates a new instance of the function. We cannot spy on it.
                        // It totally works tho, try it!
                        action: () => this.handlePlayerLeaves(),
                    },
                    {
                        content: DIALOG_END_OF_GAME_CLOSE_BUTTON,
                        closeDialog: true,
                        style: 'background-color: rgb(231, 231, 231)',
                    },
                ],
            },
        });
    }

    private handlePlayerLeaves(): void {
        this.playerLeavesService.handleLocalPlayerLeavesGame();
    }
}
