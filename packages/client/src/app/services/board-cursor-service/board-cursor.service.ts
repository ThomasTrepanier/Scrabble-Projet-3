import { Injectable } from '@angular/core';
import { Position } from '@app/classes/board-navigator/position';
import { Orientation } from '@common/models/position';
import { SquareView } from '@app/classes/square';
import { TilePlacementService } from '@app/services/tile-placement-service/tile-placement.service';
import { comparePositions } from '@app/utils/comparator/comparator';
import { BoardNavigator } from '@app/classes/board-navigator/board-navigator';
import { LetterValue, Tile } from '@app/classes/tile';
import { BehaviorSubject } from 'rxjs';
import { DragAndDropService } from '@app/services/drag-and-drop-service/drag-and-drop.service';

const BOARD_CURSOR_NOT_INITIALIZED = 'Board cursor service not initialized';

@Injectable({
    providedIn: 'root',
})
export class BoardCursorService {
    isDisabled: boolean = false;
    private grid: BehaviorSubject<SquareView[][]> | undefined;
    private getUserTiles: (() => Tile[]) | undefined;
    private notAppliedSquares: SquareView[] | undefined;
    private cursor: BoardNavigator | undefined;

    constructor(private readonly tilePlacementService: TilePlacementService, private readonly dragAndDropService: DragAndDropService) {
        this.dragAndDropService.drop$.subscribe(() => {
            this.clearCurrentCursor();
        });
    }

    initialize(grid: BehaviorSubject<SquareView[][]>, getUserTiles: (() => Tile[]) | undefined): void {
        this.grid = grid;
        this.updateTiles(getUserTiles);
        this.notAppliedSquares = [];
        this.isDisabled = false;
    }

    updateTiles(getUserTiles: (() => Tile[]) | undefined): void {
        this.getUserTiles = getUserTiles;
    }

    handleSquareClick(squareView?: SquareView): void {
        if (this.isDisabled) return;

        this.tilePlacementService.resetTiles();
        if (squareView) {
            this.setCursor(squareView.square.position);
        } else {
            this.clearCurrentCursor();
            this.cursor = undefined;
        }
    }

    clear(): void {
        this.clearCurrentCursor();
        this.cursor = undefined;
        this.tilePlacementService.resetTiles();
    }

    clearCurrentCursor(): void {
        this.clearCursor(this.getCursorSquare());
    }

    handleLetter(letter: string, isHoldingShift: boolean): void {
        if (!this.notAppliedSquares) throw new Error(BOARD_CURSOR_NOT_INITIALIZED);
        if (!this.getUserTiles) throw new Error(BOARD_CURSOR_NOT_INITIALIZED);

        if (this.isDisabled) return;
        if (!this.cursor) return;

        const square = this.cursor.currentSquareView;
        if (!square) return;

        if (square.square.tile) {
            if (this.cursor.clone().forward().isWithinBounds()) {
                this.cursor.forward();
                this.handleLetter(letter, isHoldingShift);
            }
            return;
        }

        const tile = this.getAvailableTiles().find((t) => (isHoldingShift ? t.isBlank : t.letter.toLowerCase() === letter.toLowerCase()));
        if (!tile) return;

        if (isHoldingShift) tile.playedLetter = letter.toUpperCase() as LetterValue;

        this.tilePlacementService.placeTile(
            {
                tile,
                position: { ...this.cursor.getPosition() },
            },
            true,
        );
        this.notAppliedSquares.push(square);

        this.clearCurrentCursor();
        while (this.cursor.isWithinBounds() && this.cursor.clone().forward().isWithinBounds() && this.cursorHasTile()) {
            this.cursor.forward();
        }
        this.setCurrentCursorSquare();
    }

    handleBackspace(): void {
        if (!this.notAppliedSquares) throw new Error(BOARD_CURSOR_NOT_INITIALIZED);
        if (!this.cursor) return;

        const currentSquareView = this.cursor.currentSquareView;

        if (!currentSquareView) return;

        if (currentSquareView.square.tile && !currentSquareView.applied) {
            this.tilePlacementService.removeTile({
                tile: currentSquareView.square.tile,
                position: { ...this.cursor.getPosition() },
            });
            this.notAppliedSquares.pop();
        } else {
            if (!this.cursor.clone().backward().isWithinBounds()) return;

            this.clearCurrentCursor();
            do {
                this.cursor.backward();
            } while (this.cursor.currentSquareView.applied && this.cursor.currentSquareView.square.tile && this.cursor.isWithinBounds());
            this.setCurrentCursorSquare();

            const square = this.cursor.currentSquareView;

            if (square.square.tile) {
                this.tilePlacementService.removeTile({
                    tile: square.square.tile,
                    position: { ...this.cursor.getPosition() },
                });
                this.notAppliedSquares.pop();
            }
        }
    }

    private setCursor(position: Position): void {
        if (!this.grid) throw new Error(BOARD_CURSOR_NOT_INITIALIZED);

        if (this.cursor && comparePositions(this.cursor.getPosition(), position)) {
            this.cursor.switchOrientation();
        } else {
            this.clear();
            this.clearCurrentCursor();
            this.cursor = new BoardNavigator(this.grid.value, position, Orientation.Horizontal);
        }

        this.setCurrentCursorSquare();
    }

    private getCursorSquare(): SquareView | undefined {
        return this.cursor?.currentSquareView;
    }

    private hasTile(square: SquareView): boolean {
        return (
            !!square.square.tile ||
            !!this.tilePlacementService.tilePlacements.find(({ position }) => comparePositions(position, square.square.position))
        );
    }

    private cursorHasTile(): boolean {
        const square = this.getCursorSquare();
        return square ? this.hasTile(square) : false;
    }

    private getAvailableTiles(): Tile[] {
        if (!this.getUserTiles) throw new Error(BOARD_CURSOR_NOT_INITIALIZED);
        const placed = [...this.tilePlacementService.tilePlacements.map((placement) => placement.tile)];
        return this.getUserTiles().filter((tile) => {
            const index = placed.indexOf(tile);

            if (index >= 0) {
                placed.splice(index, 1);
                return false;
            }

            return true;
        });
    }

    private clearCursor(square: SquareView | undefined): void {
        if (square) {
            square.isCursor = false;
            square.cursorOrientation = undefined;
        }
    }

    private setCursorSquare(square: SquareView | undefined): void {
        if (square) {
            square.isCursor = true;
            square.cursorOrientation = this.cursor?.orientation;
        }
    }

    private setCurrentCursorSquare(): void {
        this.setCursorSquare(this.getCursorSquare());
    }
}
