import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { PuzzleResult, PuzzleResultStatus } from '@common/models/puzzle';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IconName } from '@app/components/icon/icon.component.type';
import { ThemePalette } from '@angular/material/core';
import { ScoredWordPlacement, WordPlacement } from '@common/models/word-finding';
import { Observable, of } from 'rxjs';
import { SquareView } from '@app/classes/square';
import { BoardNavigator } from '@app/classes/board-navigator/board-navigator';
import { PuzzleLevel } from '@app/components/puzzle/start-puzzle-modal/start-puzzle-modal.component';
import { ENTER } from '@app/constants/components-constants';

export interface PuzzleResultModalParameters {
    result: PuzzleResult;
    grid: SquareView[][];
    level: PuzzleLevel;
    placement: WordPlacement | undefined;
    onCancel: () => void;
    onContinue: () => void;
    hideContinueButton: boolean;
}

@Component({
    selector: 'app-puzzle-result-modal',
    templateUrl: './puzzle-result-modal.component.html',
    styleUrls: ['./puzzle-result-modal.component.scss'],
})
export class PuzzleResultModalComponent implements OnInit {
    userPlacementGrid: Observable<SquareView[][]> | undefined = undefined;
    resultPlacements: { placement: ScoredWordPlacement; grid: Observable<SquareView[][]> }[] = [];

    constructor(
        @Inject(MAT_DIALOG_DATA) public parameters: PuzzleResultModalParameters,
        public dialogRef: MatDialogRef<PuzzleResultModalComponent>,
    ) {}

    @HostListener('document:keypress', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): void {
        switch (event.key) {
            case ENTER:
                this.onContinue();
                event.stopPropagation();
                break;
        }
    }
    @HostListener('document:keydown.escape', ['$event'])
    handleKeyboardEventEsc(event: KeyboardEvent): void {
        this.onCancel();
        event.stopPropagation();
    }

    ngOnInit() {
        if (this.parameters.placement) {
            this.userPlacementGrid = this.getGridForPlacement(this.parameters.placement);
        }
        this.resultPlacements = this.parameters.result.allPlacements.map((placement) => ({
            placement,
            grid: this.getGridForPlacement(placement),
        }));
    }

    get message(): string {
        switch (this.parameters.result.result) {
            case PuzzleResultStatus.Won:
                return 'Victoire!';
            case PuzzleResultStatus.Valid:
                return 'Bien joué!';
            case PuzzleResultStatus.Invalid:
                return 'Le placement que vous avez fait est invalide';
            case PuzzleResultStatus.Abandoned:
                return 'Puzzle abandonné';
            case PuzzleResultStatus.Timeout:
                return 'Temps écoulé';
            default:
                return '';
        }
    }

    get icon(): IconName | undefined {
        switch (this.parameters.result.result) {
            case PuzzleResultStatus.Invalid:
                return 'times';
            case PuzzleResultStatus.Abandoned:
                return 'flag';
            case PuzzleResultStatus.Timeout:
                return 'hourglass-end';
            default:
                return undefined;
        }
    }

    get color(): ThemePalette | undefined {
        switch (this.parameters.result.result) {
            case PuzzleResultStatus.Invalid:
            case PuzzleResultStatus.Abandoned:
            case PuzzleResultStatus.Timeout:
                return 'warn';
            default:
                return 'primary';
        }
    }

    get placementPoints(): number {
        return this.parameters.result.userPoints;
    }

    onContinue() {
        this.dialogRef.close();
        this.parameters.onContinue();
    }

    onCancel() {
        this.dialogRef.close();
        this.parameters.onCancel();
    }

    private getGridForPlacement(placement: WordPlacement) {
        const grid = this.getGrid();

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

    private getGrid() {
        return this.parameters.grid.map((row) => row.map<SquareView>((square) => new SquareView({ ...square.square }, { x: 1, y: 1 })));
    }
}
