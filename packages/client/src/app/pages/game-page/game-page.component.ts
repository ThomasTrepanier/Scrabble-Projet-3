import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TilePlacementService } from '@app/services/tile-placement-service/tile-placement.service';
import { ActionService } from '@app/services/action-service/action.service';
import { GameViewEventManagerService } from '@app/services/game-view-event-manager-service/game-view-event-manager.service';
import { PlayerLeavesService } from '@app/services/player-leave-service/player-leave.service';
import { ReconnectionService } from '@app/services/reconnection-service/reconnection.service';
import { GameService } from '@app/services';
import { ActionType } from '@app/classes/actions/action-data';
import {
    AnalysisResultModalComponent,
    AnalysisResultModalParameters,
} from '@app/components/analysis/analysis-result-modal/analysis-result-modal.component';
import {
    AnalysisWaitingDialogComponent,
    AnalysisWaitingDialogParameter,
} from '@app/components/analysis/analysis-waiting-dialog/analysis-waiting-dialog';
import { DefaultDialogComponent } from '@app/components/default-dialog/default-dialog.component';
import { EndGameDialogComponent } from '@app/components/end-game-dialog/end-game-dialog';
import { DefaultDialogParameters } from '@app/components/default-dialog/default-dialog.component.types';
import {
    DIALOG_ABANDON_BUTTON_CONFIRM,
    DIALOG_ABANDON_BUTTON_CONTINUE,
    DIALOG_ABANDON_CONTENT,
    DIALOG_ABANDON_TITLE,
    DIALOG_NO_ACTIVE_GAME_BUTTON,
    DIALOG_NO_ACTIVE_GAME_CONTENT,
    DIALOG_NO_ACTIVE_GAME_TITLE,
    DIALOG_QUIT_BUTTON_CONFIRM,
    DIALOG_QUIT_CONTENT,
    DIALOG_QUIT_STAY,
    DIALOG_QUIT_TITLE,
    MAX_CONFETTI_COUNT,
    MIN_CONFETTI_COUNT,
} from '@app/constants/pages-constants';
import { ROUTE_HOME } from '@app/constants/routes-constants';
import { Analysis, AnalysisRequestInfoType } from '@common/models/analysis';
import party from 'party-js';
import { DynamicSourceType } from 'party-js/lib/systems/sources';
import { DEFAULT_PLAYER_RATING } from '@common/models/constants';
import { Observable, Subject } from 'rxjs';
import { BoardCursorService } from '@app/services/board-cursor-service/board-cursor.service';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit, OnDestroy {
    private mustDisconnectGameOnLeave: boolean;
    private analysis: Analysis;
    private readonly componentDestroyed$: Subject<boolean>;

    constructor(
        private readonly dialog: MatDialog,
        private readonly gameService: GameService,
        private readonly reconnectionService: ReconnectionService,
        private readonly playerLeavesService: PlayerLeavesService,
        private readonly gameViewEventManagerService: GameViewEventManagerService,
        private readonly actionService: ActionService,
        private readonly tilePlacementService: TilePlacementService,
        private readonly boardCursorService: BoardCursorService,
    ) {
        this.mustDisconnectGameOnLeave = true;
        this.componentDestroyed$ = new Subject();
    }

    @HostListener('document:keydown.enter', ['$event'])
    handleEnter(): void {
        this.boardCursorService.isDisabled = true;
        this.boardCursorService.clearCurrentCursor();
        this.gameService.playTilesOnBoard();
    }

    @HostListener('document:keydown.escape', ['$event'])
    handleEscape(): void {
        this.tilePlacementService.handleCancelPlacement();
    }

    @HostListener('window:beforeunload')
    ngOnDestroy(): void {
        if (this.mustDisconnectGameOnLeave) {
            this.reconnectionService.disconnectGame();
        }
        this.componentDestroyed$.next(true);
        this.componentDestroyed$.complete();
    }

    ngOnInit() {
        this.gameViewEventManagerService.subscribeToGameViewEvent('noActiveGame', this.componentDestroyed$, this.openNoActiveGameDialog.bind(this));
        this.gameViewEventManagerService.subscribeToGameViewEvent('endOfGame', this.componentDestroyed$, this.endOfGameDialog.bind(this));
    }

    handleHintButtonClick(): void {
        this.actionService.sendAction(this.gameService.getGameId(), this.actionService.createActionData(ActionType.HINT, {}, '', true));
    }

    handlePassButtonClick(): void {
        this.boardCursorService.isDisabled = true;
        this.gameService.makeTilePlacement([]);
        this.boardCursorService.clear();
        this.actionService.sendAction(this.gameService.getGameId(), this.actionService.createActionData(ActionType.PASS, {}, '', true));
    }

    handlePlaceButtonClick(): void {
        this.gameService.playTilesOnBoard();
    }

    handleQuitButtonClick(): void {
        this.openDialog(
            this.gameService.isGameOver ? DIALOG_QUIT_TITLE : DIALOG_ABANDON_TITLE,
            this.gameService.isGameOver ? DIALOG_QUIT_CONTENT : DIALOG_ABANDON_CONTENT,
            [
                this.gameService.isGameOver ? DIALOG_QUIT_BUTTON_CONFIRM : DIALOG_ABANDON_BUTTON_CONFIRM,

                this.gameService.isGameOver ? DIALOG_QUIT_STAY : DIALOG_ABANDON_BUTTON_CONTINUE,
            ],
        );
    }

    canPlay(): boolean {
        return this.isLocalPlayerTurn() && !this.gameService.isGameOver && !this.actionService.hasActionBeenPlayed;
    }

    canPlaceWord(): Observable<boolean> {
        return this.tilePlacementService.isPlacementValid$;
    }

    requestAnalysis(): void {
        if (this.analysis) {
            this.showAnalysisModal(this.analysis);
        } else {
            const dialogRef = this.dialog.open<AnalysisWaitingDialogComponent, AnalysisWaitingDialogParameter>(AnalysisWaitingDialogComponent, {
                disableClose: false,
                data: { id: this.gameService.idGameHistory ?? -1, type: AnalysisRequestInfoType.ID_GAME },
            });
            dialogRef.afterClosed().subscribe((analysis) => {
                if (analysis) {
                    this.analysis = analysis;
                    this.showAnalysisModal(analysis);
                }
            });
        }
    }

    private showAnalysisModal(analysis: Analysis) {
        this.dialog.open<AnalysisResultModalComponent, AnalysisResultModalParameters>(AnalysisResultModalComponent, {
            disableClose: false,
            data: {
                leftButton: {
                    content: 'Quitter la partie',
                    redirect: ROUTE_HOME,
                    action: () => this.handlePlayerLeaves(),
                },
                rightButton: {
                    content: 'Rester dans la partie',
                    closeDialog: true,
                },
                analysis,
            },
        });
    }

    get isGameOver(): boolean {
        return this.gameService.isGameOver;
    }

    private openNoActiveGameDialog() {
        this.dialog.open<DefaultDialogComponent, DefaultDialogParameters>(DefaultDialogComponent, {
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
                        action: () => (this.mustDisconnectGameOnLeave = false),
                    },
                ],
            },
        });
    }

    private endOfGameDialog(winnerNames: string[]): void {
        const localPlayer = this.gameService.getLocalPlayer();

        this.dialog.open(EndGameDialogComponent, {
            data: {
                hasWon: this.isLocalPlayerWinner(winnerNames),
                adjustedRating: localPlayer?.adjustedRating ?? DEFAULT_PLAYER_RATING,
                ratingVariation: localPlayer?.ratingVariation ?? 0,
                action: () => this.handlePlayerLeaves(),
                actionAnalysis: () => this.requestAnalysis(),
            },
        });

        if (this.isLocalPlayerWinner(winnerNames)) this.throwConfettis();
    }

    private openDialog(title: string, content: string, buttons: string[]): MatDialogRef<DefaultDialogComponent> {
        return this.dialog.open<DefaultDialogComponent, DefaultDialogParameters>(DefaultDialogComponent, {
            data: {
                title,
                content,
                buttons: [
                    {
                        content: buttons[0],
                        redirect: ROUTE_HOME,
                        style: 'background-color: #FA6B84; color: rgb(0, 0, 0)',
                        action: () => {
                            this.handlePlayerLeaves();
                            this.gameService.makeTilePlacement([]);
                        },
                    },
                    {
                        content: buttons[1],
                        closeDialog: true,
                        style: 'background-color: rgb(231, 231, 231)',
                    },
                ],
            },
        });
    }

    private isLocalPlayerTurn(): boolean {
        return this.gameService.isLocalPlayerPlaying();
    }

    private handlePlayerLeaves(): void {
        this.mustDisconnectGameOnLeave = false;
        this.playerLeavesService.handleLocalPlayerLeavesGame();
    }

    private throwConfettis(): void {
        /* We have not been able to cover this line in the tests because it is impossible to spyOn the confetti method
        from the party-js package. This method is not exported from a class or a module, so jasmine does not offer a
        way to spy on it. Additionally, calling this method through in the tests would create some errors because the
        mat-dialog-container is not defined in the tests. */
        party.confetti(document.querySelector('.mat-dialog-container') as DynamicSourceType, {
            count: party.variation.range(MIN_CONFETTI_COUNT, MAX_CONFETTI_COUNT),
        });
    }

    private isLocalPlayerWinner(winnerNames: string[]): boolean {
        return winnerNames.includes(this.gameService.getLocalPlayer()?.publicUser.username ?? '');
    }
}
