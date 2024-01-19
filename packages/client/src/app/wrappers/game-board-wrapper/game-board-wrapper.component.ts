import { Component, Input, OnDestroy, OnInit, HostListener } from '@angular/core';
import { BoardNavigator } from '@app/classes/board-navigator/board-navigator';
import { Square, SquareView } from '@app/classes/square';
import { TilePlacement } from '@app/classes/tile';
import { SQUARE_SIZE, UNDEFINED_SQUARE } from '@app/constants/game-constants';
import { BoardService, GameService } from '@app/services';
import { TilePlacementService } from '@app/services/tile-placement-service/tile-placement.service';
import { Orientation } from '@common/models/position';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BoardCursorService } from '@app/services/board-cursor-service/board-cursor.service';
import { removeAccents } from '@app/utils/remove-accents/remove-accents';
import RoundManagerService from '@app/services/round-manager-service/round-manager.service';

@Component({
    selector: 'app-game-board-wrapper',
    templateUrl: './game-board-wrapper.component.html',
    styleUrls: ['./game-board-wrapper.component.scss'],
})
export class GameBoardWrapperComponent implements OnInit, OnDestroy {
    @Input() isObserver: boolean;
    @Input() canInteract: boolean = true;
    grid: BehaviorSubject<SquareView[][]> = new BehaviorSubject<SquareView[][]>([]);

    private notAppliedSquares: SquareView[] = [];
    private newlyPlacedTiles: SquareView[] = [];
    private opponentPlacedTiles: SquareView[] = [];
    private componentDestroyed$: Subject<boolean> = new Subject<boolean>();

    constructor(
        readonly boardService: BoardService,
        readonly tilePlacementService: TilePlacementService,
        readonly gameService: GameService,
        private readonly roundManagerService: RoundManagerService,
        private readonly boardCursorService: BoardCursorService,
    ) {}

    @HostListener('document:keypress', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): void {
        if (this.isObserver || this.gameService.isGameOver) return;

        const key = removeAccents(event.key.toLowerCase());

        if (event.key.length === 1 && key >= 'a' && key <= 'z') {
            this.boardCursorService.handleLetter(key, event.shiftKey);
        }
    }
    @HostListener('document:keydown.escape', ['$event'])
    handleEscapeEvent(): void {
        this.boardCursorService.clear();
    }

    @HostListener('document:keydown.backspace', ['$event'])
    handleBackspaceEventEvent(): void {
        this.boardCursorService.handleBackspace();
    }

    ngOnInit(): void {
        this.boardService.subscribeToInitializeBoard(this.componentDestroyed$, this.initializeBoard.bind(this));
        this.boardService.subscribeToBoardUpdate(this.componentDestroyed$, this.handleUpdateBoard.bind(this));
        this.tilePlacementService.tilePlacements$.pipe(takeUntil(this.componentDestroyed$)).subscribe(this.handlePlaceTiles.bind(this));
        this.boardService.subscribeToTemporaryTilePlacements(this.componentDestroyed$, this.handleOpponentPlaceTiles.bind(this));
        this.roundManagerService.subscribeToEndRoundEvent(this.componentDestroyed$, this.resetNotAppliedSquares.bind(this));

        if (!this.boardService.readInitialBoard()) return;
        this.initializeBoard(this.boardService.readInitialBoard());

        this.boardCursorService.initialize(this.grid, () => [...(this.gameService.getLocalPlayer()?.getTiles() ?? [])]);
    }

    ngOnDestroy() {
        this.componentDestroyed$.next(true);
        this.componentDestroyed$.complete();
    }

    resetNotAppliedSquares(): void {
        this.boardCursorService.clear();
        this.tilePlacementService.resetTiles();
    }

    clearNewlyPlacedTiles(): void {
        this.newlyPlacedTiles.forEach((squareView) => (squareView.newlyPlaced = false));
        this.newlyPlacedTiles = [];
    }

    squareClickHandler(squareView?: SquareView): void {
        if (this.isObserver || this.gameService.isGameOver || this.gameService.cannotPlay()) return;
        this.boardCursorService.handleSquareClick(squareView);
    }

    private initializeBoard(board: Square[][]): void {
        const grid = this.grid.value;

        for (let i = 0; i < board.length; i++) {
            grid[i] = [];

            for (let j = 0; j < board[i].length; j++) {
                const square: Square = this.getSquare(board, i, j);
                grid[i][j] = new SquareView(square, SQUARE_SIZE);
            }
        }

        this.boardService.navigator = new BoardNavigator(grid, { row: 0, column: 0 }, Orientation.Horizontal);
        this.grid.next(grid);
    }

    private handleUpdateBoard(squaresToUpdate: Square[]): void {
        this.clearNewlyPlacedTiles();
        this.boardCursorService.isDisabled = false;
        this.boardCursorService.clear();
        this.tilePlacementService.resetTiles();

        const grid = this.grid.value;

        for (const square of squaresToUpdate) {
            const squareView = grid[square.position.row][square.position.column];

            squareView.square = square;
            squareView.applied = true;
            squareView.newlyPlaced = true;
            squareView.halfOppacity = false;

            this.newlyPlacedTiles.push(squareView);
        }

        this.grid.next(grid);
    }

    private handlePlaceTiles(tilePlacements: TilePlacement[]): void {
        this.clearNotAppliedSquares();

        const grid = this.grid.value;

        for (const tilePlacement of tilePlacements) {
            const squareView = grid[tilePlacement.position.row][tilePlacement.position.column];

            if (!squareView.square.tile || !squareView.applied) {
                squareView.square.tile = tilePlacement.tile;
                squareView.applied = false;
                this.notAppliedSquares.push(squareView);
            }
        }

        this.grid.next(grid);
    }

    private handleOpponentPlaceTiles(tilePlacements: TilePlacement[]): void {
        this.opponentPlacedTiles.forEach((squareView: SquareView) => {
            squareView.square.tile = null;
            squareView.halfOppacity = false;
        });
        this.opponentPlacedTiles = [];

        const grid = this.grid.value;

        for (const tilePlacement of tilePlacements) {
            const squareView = grid[tilePlacement.position.row][tilePlacement.position.column];

            if (!squareView.square.tile) {
                squareView.square.tile = tilePlacement.tile;
                squareView.halfOppacity = true;
                squareView.applied = true;
                squareView.newlyPlaced = false;
                this.opponentPlacedTiles.push(squareView);
            }
        }

        this.tilePlacementService.opponentTilePlacementsSubject$.next(tilePlacements);

        this.grid.next(grid);
    }

    private clearNotAppliedSquares(): void {
        this.notAppliedSquares.forEach((squareView) => {
            squareView.applied = false;
            squareView.square.tile = null;
        });
        this.notAppliedSquares = [];
    }

    private getSquare(board: Square[][], row: number, column: number): Square {
        return board[row] && board[row][column] ? board[row][column] : UNDEFINED_SQUARE;
    }
}
