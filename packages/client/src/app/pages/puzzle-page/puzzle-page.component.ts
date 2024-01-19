/* eslint-disable max-lines */
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, HostListener, OnInit } from '@angular/core';
import { BoardNavigator } from '@app/classes/board-navigator/board-navigator';
import { Timer } from '@app/classes/round/timer';
import { SquareView } from '@app/classes/square';
import { Tile, TilePlacement } from '@app/classes/tile';
import { SECONDS_TO_MILLISECONDS, SQUARE_SIZE } from '@app/constants/game-constants';
import { BoardService } from '@app/services';
import { DragAndDropService } from '@app/services/drag-and-drop-service/drag-and-drop.service';
import { PuzzleService } from '@app/services/puzzle-service/puzzle.service';
import { TilePlacementService } from '@app/services/tile-placement-service/tile-placement.service';
import { Random } from '@app/utils/random/random';
import { Orientation } from '@common/models/position';
import { BehaviorSubject, iif, Observable, of, timer } from 'rxjs';
import { catchError, map, mergeMap, takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { PuzzleLevel } from '@app/components/puzzle/start-puzzle-modal/start-puzzle-modal.component';
import { puzzleSettings } from '@app/utils/settings';
import { ActivatedRoute, Router } from '@angular/router';
import { ROUTE_PUZZLE_HOME } from '@app/constants/routes-constants';
import { ENTER, ESCAPE } from '@app/constants/components-constants';
import { PuzzleResultModalComponent, PuzzleResultModalParameters } from '@app/components/puzzle/puzzle-result-modal/puzzle-result-modal.component';
import { WordPlacement } from '@common/models/word-finding';
import { PuzzleResult } from '@common/models/puzzle';
import { DefaultDialogComponent } from '@app/components/default-dialog/default-dialog.component';
import { DefaultDialogParameters } from '@app/components/default-dialog/default-dialog.component.types';
import {
    PUZZLE_ERROR_DIALOG_BUTTON_CONTINUE,
    PUZZLE_ERROR_DIALOG_BUTTON_GO_HOME,
    PUZZLE_ERROR_DIALOG_CONTENT,
    PUZZLE_ERROR_DIALOG_TITLE,
} from '@app/constants/puzzle-constants';
import { BoardCursorService } from '@app/services/board-cursor-service/board-cursor.service';
import { LOW_TIME, SoundName, SoundService } from '@app/services/sound-service/sound.service';

export type RackTile = Tile & { isUsed: boolean; isSelected: boolean };

@Component({
    selector: 'app-puzzle-page',
    templateUrl: './puzzle-page.component.html',
    styleUrls: ['./puzzle-page.component.scss'],
})
export class PuzzlePageComponent implements OnInit {
    isDailyPuzzle: boolean = false;
    history: PuzzleResult[] = [];
    startGrid: SquareView[][];
    grid: BehaviorSubject<SquareView[][]> = new BehaviorSubject<SquareView[][]>([]);
    tiles: BehaviorSubject<RackTile[]> = new BehaviorSubject<RackTile[]>([]);
    isPlaying: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    level?: PuzzleLevel;
    timer?: Timer;

    private notAppliedSquares: SquareView[] = [];

    constructor(
        private readonly puzzleService: PuzzleService,
        readonly dragAndDropService: DragAndDropService,
        private readonly tilePlacementService: TilePlacementService,
        private readonly boardService: BoardService,
        private readonly dialog: MatDialog,
        private readonly router: Router,
        private readonly boardCursorService: BoardCursorService,
        private readonly soundService: SoundService,
        private readonly route: ActivatedRoute,
    ) {}

    get stopPlaying(): Observable<boolean> {
        return this.isPlaying.pipe(mergeMap((isPlaying) => iif(() => !isPlaying, of(true))));
    }

    @HostListener('document:keypress', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): void {
        if (event.key.length === 1 && event.key.toLowerCase() >= 'a' && event.key.toLowerCase() <= 'z') {
            this.boardCursorService.handleLetter(event.key, event.shiftKey);
        } else {
            switch (event.key) {
                case ENTER:
                    this.play();
                    break;
            }
        }
    }

    @HostListener('document:keydown.escape', ['$event'])
    handleKeyboardEventEsc(): void {
        this.boardCursorService.clear();
        this.tilePlacementService.resetTiles();
    }

    @HostListener('document:keydown.backspace', ['$event'])
    handleBackspaceEventEvent(): void {
        this.boardCursorService.handleBackspace();
    }

    ngOnInit(): void {
        this.tilePlacementService.resetTiles();
        this.dragAndDropService.reset();

        this.tilePlacementService.tilePlacements$.subscribe((tilePlacements) => this.handleUsedTiles(tilePlacements));

        this.route.data.subscribe((data) => (this.isDailyPuzzle = data.isDaily));

        this.askStart();
    }

    askStart(): void {
        this.puzzleService.askToStart(
            (level) => {
                this.start(level.time);
                this.level = level;
                puzzleSettings.setTime(level.time);
            },
            () => {
                this.router.navigate([ROUTE_PUZZLE_HOME]);
            },
            puzzleSettings.getTime(),
            this.isDailyPuzzle,
        );
    }

    start(time: number): void {
        this.isPlaying.next(true);
        this.tilePlacementService.resetTiles();
        this.dragAndDropService.reset();
        this.clearNotAppliedSquares();

        (this.isDailyPuzzle ? this.puzzleService.startDaily() : this.puzzleService.start()).subscribe((puzzle) => {
            const grid = puzzle.board.grid.map((row) => row.map((square) => new SquareView({ ...square }, SQUARE_SIZE)));
            this.startGrid = puzzle.board.grid.map((row) => row.map((square) => new SquareView({ ...square }, SQUARE_SIZE)));

            this.boardService.navigator = new BoardNavigator(grid, { row: 0, column: 0 }, Orientation.Horizontal);

            this.grid.next(grid);
            this.tiles.next(puzzle.tiles.map((tile) => ({ ...tile, isUsed: false, isSelected: false })));

            this.boardCursorService.initialize(this.grid, () => this.tiles.value);
        });

        this.startTimer(time);
    }

    cancelPlacement(): void {
        this.tilePlacementService.resetTiles();
        this.boardCursorService.clear();
    }

    canCancelPlacement(): Observable<boolean> {
        return this.tilePlacementService.tilePlacements$.pipe(map((placements) => placements.length > 0));
    }

    canPlay(): Observable<boolean> {
        return this.tilePlacementService.isPlacementValid$;
    }

    play(): boolean {
        if (!this.isPlaying.value) return false;

        const payload = this.tilePlacementService.createPlaceActionPayload();

        if (!payload) return false;

        const placement: WordPlacement = {
            orientation: payload.orientation,
            startPosition: payload.startPosition,
            tilesToPlace: payload.tiles,
        };

        this.stopPuzzle();

        this.puzzleService
            .complete(placement)
            .pipe(
                catchError(() => {
                    this.showErrorModal();
                    return of(null);
                }),
            )
            .subscribe((result) => {
                if (result) {
                    this.history.push(result);
                    this.showEndOfPuzzleModal(result, placement);
                }
            });

        return true;
    }

    abandon(): void {
        this.puzzleService.askToAbandon(() => {
            this.stopPuzzle();

            this.puzzleService
                .abandon()
                .pipe(
                    catchError(() => {
                        this.showErrorModal();
                        return of(null);
                    }),
                )
                .subscribe((result) => {
                    if (result) {
                        this.history.push(result);
                        this.showEndOfPuzzleModal(result, undefined);
                    }
                });
        });
    }

    timeout(): void {
        if (!this.play()) {
            this.tilePlacementService.resetTiles();
            this.stopPuzzle();

            this.puzzleService
                .timeout()
                .pipe(
                    catchError(() => {
                        this.showErrorModal();
                        return of(null);
                    }),
                )
                .subscribe((result) => {
                    if (result) {
                        this.history.push(result);
                        this.showEndOfPuzzleModal(result, undefined);
                    }
                });
        }
    }

    drop(event: CdkDragDrop<RackTile[]>) {
        const tile: RackTile = event.previousContainer.data[event.previousIndex];

        if (tile.isBlank || tile.letter === '*') tile.playedLetter = undefined;

        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        }
    }

    shuffleTiles(): void {
        this.tiles.next(Random.randomize(this.tiles.value));
    }

    stopPuzzle(): void {
        this.isPlaying.next(false);
        this.timer = undefined;
    }

    handleSquareClick(square: SquareView): void {
        this.boardCursorService.handleSquareClick(square);
    }

    private startTimer(time: number): void {
        this.timer = Timer.convertTime(time);

        timer(time * SECONDS_TO_MILLISECONDS)
            .pipe(takeUntil(this.stopPlaying))
            .subscribe(() => this.timeout());
        timer(0, SECONDS_TO_MILLISECONDS)
            .pipe(takeUntil(this.stopPlaying))
            .subscribe(() => {
                this.timer?.decrement();
                if (this.timer?.getTime() === LOW_TIME) {
                    this.soundService.playSound(SoundName.LowTimeSound);
                }
            });
    }

    private showEndOfPuzzleModal(result: PuzzleResult, placement: WordPlacement | undefined) {
        this.dialog.open<PuzzleResultModalComponent, PuzzleResultModalParameters>(PuzzleResultModalComponent, {
            disableClose: true,
            data: {
                grid: this.startGrid,
                result,
                placement,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                level: this.level!,
                onCancel: () => {
                    this.router.navigate([ROUTE_PUZZLE_HOME]);
                },

                onContinue: () => {
                    if (this.isDailyPuzzle) {
                        this.router.navigate([ROUTE_PUZZLE_HOME]);
                    } else {
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        this.start(this.level!.time);
                    }
                },
                hideContinueButton: this.isDailyPuzzle,
            },
        });
    }

    private showErrorModal() {
        this.dialog.open<DefaultDialogComponent, DefaultDialogParameters>(DefaultDialogComponent, {
            disableClose: true,
            data: {
                title: PUZZLE_ERROR_DIALOG_TITLE,
                content: PUZZLE_ERROR_DIALOG_CONTENT,
                buttons: [
                    {
                        content: PUZZLE_ERROR_DIALOG_BUTTON_GO_HOME,
                        key: ESCAPE,
                        closeDialog: true,
                        action: () => {
                            this.router.navigate([ROUTE_PUZZLE_HOME]);
                        },
                    },
                    {
                        content: PUZZLE_ERROR_DIALOG_BUTTON_CONTINUE,
                        key: ENTER,
                        closeDialog: true,
                        action: () => {
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            this.start(this.level!.time);
                        },
                    },
                ],
            },
        });
    }

    private handleUsedTiles(tilePlacements: TilePlacement[]) {
        this.clearNotAppliedSquares();

        const usedTiles = [...tilePlacements];
        for (const tile of this.tiles.value) {
            const index = usedTiles.findIndex((usedTile) => usedTile.tile.letter === tile.letter);
            tile.isUsed = index >= 0;
            if (index >= 0) usedTiles.splice(index, 1);
        }

        for (const placement of tilePlacements) {
            const squareView = this.grid.value[placement.position.row][placement.position.column];
            squareView.square.tile = placement.tile;
            squareView.applied = false;
            this.notAppliedSquares.push(squareView);
        }
        this.grid.next(this.grid.value);
    }

    private clearNotAppliedSquares(): void {
        for (const {
            square: { position },
        } of this.notAppliedSquares) {
            this.grid.value[position.row][position.column].square.tile = null;
        }
        this.notAppliedSquares = [];
        this.grid.next(this.grid.value);
    }
}
