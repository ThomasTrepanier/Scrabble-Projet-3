import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActionType } from '@app/classes/actions/action-data';
import { FocusableComponent } from '@app/classes/focusable-component/focusable-component';
import { Tile, TilePlacement } from '@app/classes/tile';
import { ESCAPE } from '@app/constants/components-constants';
import { MAX_TILES_PER_PLAYER } from '@app/constants/game-constants';
import { RACK_TILE_DEFAULT_FONT_SIZE } from '@app/constants/tile-font-size-constants';
import { TileRackSelectType } from '@app/constants/tile-rack-select-type';
import { GameService } from '@app/services';
import { ActionService } from '@app/services/action-service/action.service';
import { DragAndDropService } from '@app/services/drag-and-drop-service/drag-and-drop.service';
import { FocusableComponentsService } from '@app/services/focusable-components-service/focusable-components.service';
import { GameViewEventManagerService } from '@app/services/game-view-event-manager-service/game-view-event-manager.service';
import { TilePlacementService } from '@app/services/tile-placement-service/tile-placement.service';
import { preserveArrayOrder } from '@app/utils/preserve-array-order/preserve-array-order';
import { Random } from '@app/utils/random/random';
import { combineLatest, Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { BoardCursorService } from '@app/services/board-cursor-service/board-cursor.service';
import { compareTile } from '@app/utils/comparator/comparator';

export type RackTile = Tile & { isUsed: boolean; isSelected: boolean };

@Component({
    selector: 'app-tile-rack',
    templateUrl: './tile-rack.component.html',
    styleUrls: ['./tile-rack.component.scss'],
})
export class TileRackComponent extends FocusableComponent<KeyboardEvent> implements OnInit, OnDestroy {
    @Input() isObserver: boolean;
    @Input() allowExchange: boolean = true;

    tiles: RackTile[];
    others: RackTile[];
    selectedTiles: RackTile[];
    selectionType: TileRackSelectType;
    tileFontSize: number;
    isShuffling: boolean;

    private componentDestroyed$: Subject<boolean>;

    constructor(
        public gameService: GameService,
        private readonly focusableComponentService: FocusableComponentsService,
        private readonly gameViewEventManagerService: GameViewEventManagerService,
        private readonly actionService: ActionService,
        private readonly tilePlacementService: TilePlacementService,
        readonly dragAndDropService: DragAndDropService,
        private readonly boardCusorService: BoardCursorService,
    ) {
        super();
        this.tiles = [];
        this.others = [];
        this.selectedTiles = [];
        this.selectionType = TileRackSelectType.Exchange;
        this.tileFontSize = RACK_TILE_DEFAULT_FONT_SIZE;
        this.isShuffling = false;
        this.componentDestroyed$ = new Subject();
        this.selectedTiles = [];
    }

    drop(event: CdkDragDrop<RackTile[]>) {
        const tile: RackTile = event.previousContainer.data[event.previousIndex];

        if (tile.isBlank || tile.letter === '*') tile.playedLetter = undefined;

        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        }
    }

    ngOnInit(): void {
        if (!this.isObserver) {
            this.subscribeToFocusableEvents();
        }
        this.updateTileRack(this.gameService.getLocalPlayerId());
        this.gameViewEventManagerService.subscribeToGameViewEvent('tileRackUpdate', this.componentDestroyed$, (playerId: string) =>
            this.updateTileRack(playerId),
        );
        this.tilePlacementService.tilePlacements$
            .pipe(takeUntil(this.componentDestroyed$))
            .subscribe((tilePlacements) => this.handleUsedTiles(tilePlacements));
    }

    ngOnDestroy(): void {
        if (!this.isObserver) {
            this.unsubscribeToFocusableEvents();
        }
        this.componentDestroyed$.next(true);
        this.componentDestroyed$.complete();
    }

    cancelPlacement(): void {
        this.resetExchange();
        this.tilePlacementService.handleCancelPlacement();
        this.boardCusorService.clear();
    }

    canCancelPlacement(): boolean {
        return this.tilePlacementService.tilePlacements.length > 0 || this.selectedTiles.length > 0;
    }

    focus(): void {
        this.focusableComponentService.setActiveKeyboardComponent(this);
    }

    canExchangeTiles(): boolean {
        return (
            this.selectedTiles.length > 0 &&
            this.gameService.isLocalPlayerPlaying() &&
            this.gameService.getTotalNumberOfTilesLeft() >= MAX_TILES_PER_PLAYER &&
            !this.actionService.hasActionBeenPlayed
        );
    }

    exchangeTiles(): void {
        if (!this.canExchangeTiles()) return;

        this.selectedTiles.forEach((tile) => (tile.isUsed = true));

        this.actionService.sendAction(
            this.gameService.getGameId(),
            this.actionService.createActionData(ActionType.EXCHANGE, this.actionService.createExchangeActionPayload(this.selectedTiles)),
        );

        this.cancelPlacement();
    }

    onTileRightClick(tile: RackTile): boolean {
        if (!this.allowExchange) return false;

        const index = this.selectedTiles.indexOf(tile);

        if (index >= 0) {
            tile.isSelected = false;
            this.selectedTiles.splice(index, 1);
        } else {
            this.selectedTiles.push(tile);
            tile.isSelected = true;
        }

        return false;
    }

    get observerTiles(): Observable<RackTile[]> {
        return combineLatest([this.tilePlacementService.opponentTilePlacementsSubject$, this.gameService.activePlayer]).pipe(
            map(([tilePlacements, activePlayer]) => {
                const tiles = [...this.tiles];

                tiles.forEach((tile) => (tile.isUsed = false));

                if (activePlayer?.id !== this.gameService.getLocalPlayerId()) return tiles;

                for (const tilePlacement of tilePlacements) {
                    const tile = tiles.find((t) => compareTile(t, tilePlacement.tile) && !t.isUsed);
                    if (tile) {
                        tile.isUsed = true;
                    }
                }

                return tiles;
            }),
        );
    }

    async shuffleTiles(): Promise<void> {
        // this.isShuffling = true;
        // await Delay.for(SHUFFLE_ANIMATION_DELAY);
        this.tiles = Random.randomize(this.tiles);
        // await Delay.for(1);
        // this.isShuffling = false;
    }

    protected onFocusableEvent(event: KeyboardEvent): void {
        if (this.isObserver) return;
        switch (event.key) {
            case ESCAPE:
                this.cancelPlacement();
                break;
        }
    }

    private resetExchange(): void {
        this.selectedTiles.forEach((tile) => (tile.isSelected = false));
        this.selectedTiles = [];
    }

    private updateTileRack(playerId?: string): void {
        const player = this.gameService.getLocalPlayer();
        if (!player) return;
        if (playerId !== this.gameService.getLocalPlayerId()) return;

        const previousTiles: RackTile[] = [...this.tiles];
        const newTiles: Tile[] = [...player.getTiles()];
        this.tiles = preserveArrayOrder(newTiles, previousTiles, (elem1: Tile, elem2: RackTile) => elem1.letter === elem2.letter).map(
            (tile: Tile, index: number) => this.createRackTile(tile, this.tiles[index]),
        );
    }

    private createRackTile(tile: Tile, rackTile: RackTile): RackTile {
        return { ...tile, isUsed: false, isSelected: rackTile && rackTile.isSelected };
    }

    private handleUsedTiles(tilePlacements: TilePlacement[]) {
        const usedTiles = [...tilePlacements];
        for (const tile of this.tiles) {
            const index = usedTiles.findIndex((usedTile) => usedTile.tile.letter === tile.letter);
            tile.isUsed = index >= 0;
            if (index >= 0) usedTiles.splice(index, 1);
        }
    }
}
