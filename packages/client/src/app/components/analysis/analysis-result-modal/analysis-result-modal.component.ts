/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ScoredWordPlacement, WordPlacement } from '@common/models/word-finding';
import { Observable, of } from 'rxjs';
import { SquareView } from '@app/classes/square';
import { BoardNavigator } from '@app/classes/board-navigator/board-navigator';
import { ENTER } from '@app/constants/components-constants';
import { Analysis, CriticalMoment } from '@common/models/analysis';
import { ActionType } from '@common/models/action';
import { Board, Tile } from '@common/models/game';
import { SQUARE_SIZE } from '@app/constants/game-constants';
import { COLORS } from '@app/constants/colors-constants';
import { RackTile } from '@app/pages/puzzle-page/puzzle-page.component';
import { DefaultDialogButtonParameters } from '@app/components/default-dialog/default-dialog.component.types';
import { Router } from '@angular/router';
import { MAJOR_MISTAKE_THRESHOLD, MEDIUM_MISTAKE_THRESHOLD } from '@app/constants/analysis-constants';

export interface PlacementView {
    grid?: Observable<SquareView[][]>;
    tileRack: RackTile[];
    placement?: ScoredWordPlacement;
}

export interface CriticalMomentView {
    actionType: ActionType;
    bestPlacement: PlacementView;
    playedPlacement: PlacementView;
    actionToShow: ActionToShow;
}

export interface AnalysisOverview {
    minorMistakeCount: number;
    mediumMistakeCount: number;
    majorMistakeCount: number;
}

export interface AnalysisResultModalParameters {
    analysis: Analysis;
    leftButton?: DefaultDialogButtonParameters;
    rightButton?: DefaultDialogButtonParameters;
}

export enum ActionToShow {
    PLAYED = 'playedAction',
    BEST = 'bestAction',
}
@Component({
    selector: 'app-analysis-result-modal',
    templateUrl: './analysis-result-modal.component.html',
    styleUrls: ['./analysis-result-modal.component.scss'],
})
export class AnalysisResultModalComponent implements OnInit {
    criticalMoments: CriticalMomentView[] = [];
    overview: AnalysisOverview = { minorMistakeCount: 0, mediumMistakeCount: 0, majorMistakeCount: 0 };
    // actionShown: string = ActionToShow.PLAYED;
    actionTypes: typeof ActionType = ActionType;
    colors: typeof COLORS = COLORS;
    actionToShow: typeof ActionToShow = ActionToShow;
    leftButton?: DefaultDialogButtonParameters;
    rightButton?: DefaultDialogButtonParameters;

    constructor(
        @Inject(MAT_DIALOG_DATA) public parameters: AnalysisResultModalParameters,
        public dialogRef: MatDialogRef<AnalysisResultModalComponent>,
        private router: Router,
    ) {}

    @HostListener('document:keypress', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): void {
        switch (event.key) {
            case ENTER:
                this.onContinue();
                break;
        }
    }
    @HostListener('document:keydown.escape', ['$event'])
    handleKeyboardEventEsc(): void {
        this.onCancel();
    }

    ngOnInit() {
        this.criticalMoments = this.parameters.analysis.criticalMoments.map((criticalMoment) => {
            this.updateOverview(criticalMoment);
            return this.transformToCriticalMomentView(criticalMoment);
        });

        if (this.parameters.rightButton) {
            this.rightButton = {
                content: this.parameters.rightButton.content,
                closeDialog: this.parameters.rightButton.redirect ? true : this.parameters.rightButton.closeDialog ?? false,
                action: this.parameters.rightButton.action,
                redirect: this.parameters.rightButton.redirect,
                style: this.parameters.rightButton.style,
                icon: this.parameters.rightButton.icon,
            };
        }

        if (this.parameters.leftButton) {
            this.leftButton = {
                content: this.parameters.leftButton.content,
                closeDialog: this.parameters.leftButton.redirect ? true : this.parameters.leftButton.closeDialog ?? false,
                action: this.parameters.leftButton.action,
                redirect: this.parameters.leftButton.redirect,
                style: this.parameters.leftButton.style,
                icon: this.parameters.leftButton.icon,
            };
        }
    }

    handleButtonClick(button: DefaultDialogButtonParameters): void {
        if (button.action) button.action();
        if (button.redirect) this.router.navigate([button.redirect]);
    }

    get message(): string {
        if (this.overview.majorMistakeCount > 0) {
            if (this.overview.majorMistakeCount > 1) {
                return 'Multiples erreurs';
            }
            return 'Une erreur';
        } else if (this.overview.mediumMistakeCount > 0) {
            if (this.overview.mediumMistakeCount > 1) {
                return 'Multiples imprécisions';
            }
            return 'Une seule imprécision';
        } else if (this.overview.minorMistakeCount > 0) {
            if (this.overview.minorMistakeCount > 1) {
                return 'Multiples opportunités manquées';
            }
            return 'Une seule opportunité manquée';
        } else {
            return 'Incroyable! Une partie parfaite!';
        }
    }

    onContinue() {
        this.dialogRef.close();
    }

    onCancel() {
        this.dialogRef.close();
    }

    private updateOverview(criticalMoment: CriticalMoment) {
        const pointDifference = criticalMoment.bestPlacement.score - (criticalMoment.playedPlacement ? criticalMoment.playedPlacement.score : 0);
        if (pointDifference > MAJOR_MISTAKE_THRESHOLD) {
            this.overview.majorMistakeCount++;
        } else if (pointDifference > MEDIUM_MISTAKE_THRESHOLD) {
            this.overview.mediumMistakeCount++;
        } else {
            this.overview.minorMistakeCount++;
        }
    }

    private transformToCriticalMomentView(criticalMoment: CriticalMoment): CriticalMomentView {
        return {
            actionType: criticalMoment.actionType,
            bestPlacement: {
                placement: criticalMoment.bestPlacement,
                grid: this.getGridForPlacement(criticalMoment.bestPlacement, criticalMoment.board),
                tileRack: this.transformToTileView(criticalMoment.tiles, criticalMoment.bestPlacement),
            },
            playedPlacement: {
                placement: criticalMoment.playedPlacement,
                grid: criticalMoment.playedPlacement ? this.getGridForPlacement(criticalMoment.playedPlacement, criticalMoment.board) : undefined,
                tileRack: this.transformToTileView(criticalMoment.tiles, criticalMoment.playedPlacement),
            },
            actionToShow: ActionToShow.PLAYED,
        };
    }

    private transformToTileView(tiles: Tile[], placement?: ScoredWordPlacement): RackTile[] {
        const tileViews = tiles.map((tile) => ({ ...tile, isUsed: false, isSelected: false }));
        if (!placement) return tileViews;
        const usedTiles = [...placement.tilesToPlace];
        for (const tile of tileViews) {
            const index = usedTiles.findIndex((usedTile) => usedTile.letter === tile.letter);
            tile.isUsed = index >= 0;
            if (index >= 0) usedTiles.splice(index, 1);
        }
        return tileViews;
    }

    private getGridForPlacement(placement: WordPlacement, board: Board) {
        const grid = this.getGrid(board);

        const navigator = new BoardNavigator(grid, placement.startPosition, placement.orientation);
        let index = 0;

        while (index < placement.tilesToPlace.length) {
            if (navigator.isEmpty(true)) {
                navigator.currentSquareView.square.tile = placement.tilesToPlace[index];
                navigator.currentSquareView.applied = false;
                index++;
            }
            navigator.forward();
        }

        return of(grid);
    }

    private getGrid(board: Board) {
        return board.grid.map((row) => row.map((square) => new SquareView({ ...square }, SQUARE_SIZE)));
    }
}
