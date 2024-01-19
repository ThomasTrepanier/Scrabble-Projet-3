import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PlaceActionPayload } from '@app/classes/actions/action-data';
import { Orientation } from '@app/classes/actions/orientation';
import { BoardNavigator } from '@app/classes/board-navigator/board-navigator';
import { Position } from '@app/classes/board-navigator/position';
import { LetterValue, TilePlacement } from '@app/classes/tile';
import {
    ChooseBlankTileDialogComponent,
    ChooseBlankTileDialogParameters,
} from '@app/components/choose-blank-tile-dialog/choose-blank-tile-dialog.component';
import { CANNOT_REMOVE_UNUSED_TILE } from '@app/constants/component-errors';
import { BOARD_SIZE } from '@app/constants/game-constants';
import BoardService from '@app/services/board-service/board.service';
import { comparePlacements, comparePositions } from '@app/utils/comparator/comparator';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SoundName, SoundService } from '@app/services/sound-service/sound.service';

@Injectable({
    providedIn: 'root',
})
export class TilePlacementService {
    opponentTilePlacementsSubject$: BehaviorSubject<TilePlacement[]>;
    propagateTilePlacementToOpponents: boolean;
    private blankTileModalOpened$: BehaviorSubject<boolean>;
    private tilePlacementsSubject$: BehaviorSubject<TilePlacement[]>;
    private isPlacementValidSubject$: BehaviorSubject<boolean>;

    constructor(private readonly boardService: BoardService, private readonly dialog: MatDialog, private soundService: SoundService) {
        this.blankTileModalOpened$ = new BehaviorSubject<boolean>(false);
        this.tilePlacementsSubject$ = new BehaviorSubject<TilePlacement[]>([]);
        this.isPlacementValidSubject$ = new BehaviorSubject<boolean>(false);
        this.opponentTilePlacementsSubject$ = new BehaviorSubject<TilePlacement[]>([]);
        this.propagateTilePlacementToOpponents = true;
    }

    get tilePlacements$(): Observable<TilePlacement[]> {
        return this.tilePlacementsSubject$.asObservable();
    }

    get isPlacementValid$(): Observable<boolean> {
        return combineLatest([this.isPlacementValidSubject$, this.blankTileModalOpened$]).pipe(
            map(([isPlacementValid, blankTileModalOpened]) => isPlacementValid && !blankTileModalOpened),
        );
    }

    get tilePlacements(): TilePlacement[] {
        return this.tilePlacementsSubject$.value;
    }

    get isPlacementValid(): boolean {
        return this.isPlacementValidSubject$.value && !this.blankTileModalOpened$.value;
    }

    placeTile(tilePlacement: TilePlacement, skipAskBlank: boolean = false): void {
        this.soundService.playSound(SoundName.TilePlacementSound);
        if (tilePlacement.tile.isBlank || tilePlacement.tile.letter === '*') {
            if (skipAskBlank) {
                if (tilePlacement.tile.playedLetter === undefined) throw new Error('Blank tile must have a letter');
                this.tilePlacementsSubject$.next([...this.tilePlacementsSubject$.value, tilePlacement]);
                this.updatePlacement();
            } else {
                this.askFillBlankLetter((letter) => {
                    tilePlacement.tile.playedLetter = letter as LetterValue;
                    this.tilePlacementsSubject$.next([...this.tilePlacementsSubject$.value, tilePlacement]);
                    this.updatePlacement();
                });
            }
        } else {
            this.tilePlacementsSubject$.next([...this.tilePlacementsSubject$.value, tilePlacement]);
            this.updatePlacement();
        }
    }

    placeTileFromPlacePayload(placeActionPayload: PlaceActionPayload): void {
        const navigator = this.boardService.navigator?.clone();

        if (!navigator) return;

        navigator.setPosition(placeActionPayload.startPosition);
        navigator.orientation = placeActionPayload.orientation;

        let index = 0;
        const tilePlacements: TilePlacement[] = [];
        do {
            if (navigator.isEmpty()) {
                tilePlacements.push({
                    tile: placeActionPayload.tiles[index],
                    position: { ...navigator.getPosition() },
                });
                index++;
            }

            navigator.forward();
        } while (index < placeActionPayload.tiles.length && navigator.isWithinBounds());

        this.tilePlacementsSubject$.next(tilePlacements);
        this.soundService.playSound(SoundName.TilePlacementSound);
        this.updatePlacement();
    }

    moveTile(tilePlacement: TilePlacement, previousPosition: Position): void {
        this.soundService.playSound(SoundName.TilePlacementSound);

        const placements = [...this.tilePlacements];
        const previousPlacement: TilePlacement = { ...tilePlacement, position: previousPosition };

        const index = placements.findIndex((t) => comparePlacements(t, previousPlacement));

        if (index >= 0) {
            if (tilePlacement.tile.isBlank || tilePlacement.tile.letter === '*') {
                this.askFillBlankLetter((letter) => {
                    tilePlacement.tile.playedLetter = letter as LetterValue;

                    placements.splice(index, 1);
                    placements.push(tilePlacement);
                    this.tilePlacementsSubject$.next(placements);
                    this.updatePlacement();
                });
            } else {
                placements.splice(index, 1);
                placements.push(tilePlacement);
                this.tilePlacementsSubject$.next(placements);
                this.updatePlacement();
            }
        }
    }

    removeTile(tilePlacement: TilePlacement): void {
        const placements = [...this.tilePlacements];

        const index = placements.findIndex((t) => comparePlacements(t, tilePlacement));
        placements[index].tile.playedLetter = undefined;

        if (index < 0) throw new Error(CANNOT_REMOVE_UNUSED_TILE);

        placements.splice(index, 1);
        this.tilePlacementsSubject$.next(placements);
        this.updatePlacement();
    }

    handleCancelPlacement(): void {
        this.tilePlacements.forEach(({ tile }) => (tile.playedLetter = undefined));
        this.tilePlacementsSubject$.next([]);
        this.opponentTilePlacementsSubject$.next([]);
        this.updatePlacement();
    }

    resetTiles(): void {
        this.handleCancelPlacement();
        this.boardService.updateTemporaryTilePlacements([]);
    }

    createPlaceActionPayload(): PlaceActionPayload | undefined {
        let tilePlacements = [...this.tilePlacements];
        const orientation = this.getPlacementOrientation(tilePlacements);

        if (orientation === undefined) return undefined;

        tilePlacements = this.sortTilePlacements(tilePlacements, orientation);

        return {
            orientation,
            startPosition: tilePlacements[0].position,
            tiles: tilePlacements.map(({ tile }) => tile),
        };
    }

    private askFillBlankLetter(onComplete: (letter: string) => void): void {
        const parameters: ChooseBlankTileDialogParameters = {
            onConfirm: (letter) => {
                this.blankTileModalOpened$.next(false);
                onComplete(letter);
            },
            onCancel: () => {
                this.blankTileModalOpened$.next(false);
            },
        };

        this.blankTileModalOpened$.next(true);
        this.dialog.open(ChooseBlankTileDialogComponent, { data: parameters });
    }

    private updatePlacement(): void {
        this.isPlacementValidSubject$.next(this.validatePlacement());
    }

    private validatePlacement(): boolean {
        let tilePlacements = [...this.tilePlacements];
        const orientation = this.getPlacementOrientation(tilePlacements);

        if (orientation === undefined) return false;

        tilePlacements = this.sortTilePlacements(tilePlacements, orientation);

        const navigator = this.boardService.navigator?.clone();

        if (!navigator) return false;

        navigator.setPosition(tilePlacements[0].position);
        navigator.orientation = orientation;
        let index = 0;
        let hasNeighbors = this.placementIncludesMiddle(tilePlacements) || this.placementStartsOrEndsWithNeighbor(tilePlacements, navigator);

        // We iterate through the placement
        while (navigator.isWithinBounds()) {
            const placement = tilePlacements[index];

            // We check wether the current position has the desired tile
            if (comparePositions(placement.position, navigator.getPosition())) {
                // If the desired tile is present, go to next tile
                index++;
                // We check if the tile as a neighbors.
                if (navigator.hasNonEmptyNeighbor()) {
                    hasNeighbors = true;
                }
                // If we went through all the tiles without a problem, then the placement is valid
                if (index === tilePlacements.length) return hasNeighbors;
            } else {
                // If the desired tile is not present, than we make sure that an existing tile is present.
                // If not, then there is a gap in the placement, it is invalid.
                if (navigator.isEmpty()) {
                    return false;
                } else {
                    // If there is an existing tile within the placement, than the placement is a neighbors to an existing tile.
                    hasNeighbors = true;
                }
            }

            navigator.forward();
        }

        throw new Error('I did something bad.');
    }

    private getPlacementOrientation(tilePlacements: TilePlacement[]): Orientation | undefined {
        tilePlacements = [...tilePlacements];
        const firstPlacement = tilePlacements.pop();

        if (!firstPlacement) return;
        if (tilePlacements.length === 0) return Orientation.Horizontal;

        const { row, column } = firstPlacement.position;

        if (tilePlacements.every(({ position }) => position.row === row)) return Orientation.Horizontal;
        if (tilePlacements.every(({ position }) => position.column === column)) return Orientation.Vertical;

        return undefined;
    }

    private placementIncludesMiddle(tilePlacements: TilePlacement[]): boolean {
        return tilePlacements.some(
            (placement) => placement.position.row === Math.floor(BOARD_SIZE / 2) && placement.position.column === Math.floor(BOARD_SIZE / 2),
        );
    }

    private sortTilePlacements(tilePlacements: TilePlacement[], orientation: Orientation): TilePlacement[] {
        return tilePlacements.sort(({ position: { row: rowA, column: colA } }, { position: { row: rowB, column: colB } }) =>
            orientation === Orientation.Vertical ? (rowA > rowB ? 1 : -1) : colA > colB ? 1 : -1,
        );
    }

    private placementStartsOrEndsWithNeighbor(tilePlacements: TilePlacement[], navigator: BoardNavigator): boolean {
        navigator = navigator.clone();

        navigator.setPosition(tilePlacements[0].position);

        const previous = navigator.clone().backward();

        if (previous.isWithinBounds() && !previous.isEmpty()) return true;

        const next = navigator
            .clone()
            .setPosition(tilePlacements[tilePlacements.length - 1].position)
            .forward();

        return next.isWithinBounds() && !next.isEmpty();
    }
}
