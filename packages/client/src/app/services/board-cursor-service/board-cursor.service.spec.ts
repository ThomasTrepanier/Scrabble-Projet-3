/* eslint-disable dot-notation */
import { TestBed } from '@angular/core/testing';

import { BoardCursorService } from './board-cursor.service';
import { MatDialogModule } from '@angular/material/dialog';
import { SquareView } from '@app/classes/square';
import { LetterValue, Tile } from '@app/classes/tile';
import { BehaviorSubject } from 'rxjs';
import { TilePlacementService } from '@app/services/tile-placement-service/tile-placement.service';
import { comparePositions } from '@app/utils/comparator/comparator';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';

const SIZE = 5;

const getGrid = () =>
    new Array(SIZE)
        .fill(0)
        .map((_, row) =>
            new Array(SIZE)
                .fill(0)
                .map<SquareView>(
                    (__, column) =>
                        new SquareView(
                            { tile: null, scoreMultiplier: null, wasMultiplierUsed: false, position: { row, column }, isCenter: false },
                            { x: 1, y: 1 },
                        ),
                ),
        );

const getTiles = () => {
    const blankTile = new Tile('*', 0);
    blankTile.isBlank = true;
    return [...new Array(SIZE).fill(0).map<Tile>((_, i) => new Tile(String.fromCharCode('A'.charCodeAt(0) + i) as LetterValue, 1)), blankTile];
};

describe('BoardCursorService', () => {
    let service: BoardCursorService;
    let grid: BehaviorSubject<SquareView[][]>;
    let tiles: Tile[];
    let tilePlacementService: TilePlacementService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatDialogModule, AppRoutingModule, HttpClientTestingModule, MatSnackBarModule],
        });
        service = TestBed.inject(BoardCursorService);
        grid = new BehaviorSubject(getGrid());
        tiles = getTiles();
        tilePlacementService = TestBed.inject(TilePlacementService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('initialize', () => {
        it('should set grid', () => {
            service.initialize(grid, () => tiles);
            expect(service['grid']).toEqual(grid);
        });

        it('should set tiles', () => {
            service.initialize(grid, () => tiles);
            expect(service['getUserTiles']).toBeDefined();
        });

        it('should set notAppliedSquares', () => {
            service.initialize(grid, () => tiles);
            expect(service['notAppliedSquares']).toBeDefined();
        });
    });

    describe('updateTiles', () => {
        it('should set tiles', () => {
            service.updateTiles(() => tiles);
            expect(service['getUserTiles']).toBeDefined();
        });
    });

    describe('handleSquareClick', () => {
        it('should set cursor', () => {
            service.initialize(grid, () => tiles);
            service.handleSquareClick(grid.value[0][0]);
            expect(service['cursor']).toBeDefined();
        });

        it('should do nothing is isDisabled is true', () => {
            service.initialize(grid, () => tiles);
            service.isDisabled = true;
            service.handleSquareClick(grid.value[0][0]);
            expect(service['cursor']).toBeUndefined();
        });
    });

    describe('clear', () => {
        it('should clear cursor', () => {
            service.initialize(grid, () => tiles);
            service.handleSquareClick(grid.value[0][0]);
            service.clear();
            expect(service['cursor']).toBeUndefined();
        });
    });

    describe('handleLetter', () => {
        it('should add letter to current position', () => {
            service.initialize(grid, () => tiles);
            service.handleSquareClick(grid.value[0][0]);
            service.handleLetter('A', false);
            expect(
                tilePlacementService.tilePlacements.find(
                    (placement) => placement.tile.letter === 'A' && comparePositions(placement.position, { row: 0, column: 0 }),
                ),
            ).toBeTruthy();
        });

        it('should add blank letter to current position', () => {
            service.initialize(grid, () => tiles);
            service.handleSquareClick(grid.value[0][0]);
            service.handleLetter('Z', true);
            expect(
                tilePlacementService.tilePlacements.find(
                    (placement) => placement.tile.playedLetter === 'Z' && comparePositions(placement.position, { row: 0, column: 0 }),
                ),
            ).toBeTruthy();
        });

        it('should not add letter to current position if it is not valid', () => {
            service.initialize(grid, () => tiles);
            service.handleSquareClick(grid.value[0][0]);
            service.handleLetter('Z', false);
            expect(
                tilePlacementService.tilePlacements.find(
                    (placement) => placement.tile.letter === 'Z' && comparePositions(placement.position, { row: 0, column: 0 }),
                ),
            ).toBeFalsy();
        });

        it('should add multiple letters [horizontal]', () => {
            service.initialize(grid, () => tiles);
            service.handleSquareClick(grid.value[0][0]);
            service.handleLetter('A', false);
            service.handleLetter('B', false);
            expect(
                tilePlacementService.tilePlacements.find(
                    (placement) => placement.tile.letter === 'A' && comparePositions(placement.position, { row: 0, column: 0 }),
                ),
            ).toBeTruthy();
            expect(
                tilePlacementService.tilePlacements.find(
                    (placement) => placement.tile.letter === 'B' && comparePositions(placement.position, { row: 0, column: 1 }),
                ),
            ).toBeTruthy();
        });

        it('should add multiple letters [vertical]', () => {
            service.initialize(grid, () => tiles);
            service.handleSquareClick(grid.value[0][0]);
            service.handleSquareClick(grid.value[0][0]);
            service.handleLetter('A', false);
            service.handleLetter('B', false);
            expect(
                tilePlacementService.tilePlacements.find(
                    (placement) => placement.tile.letter === 'A' && comparePositions(placement.position, { row: 0, column: 0 }),
                ),
            ).toBeTruthy();
            expect(
                tilePlacementService.tilePlacements.find(
                    (placement) => placement.tile.letter === 'B' && comparePositions(placement.position, { row: 1, column: 0 }),
                ),
            ).toBeTruthy();
        });

        it('should not add letter if isDisabled', () => {
            service.initialize(grid, () => tiles);
            service.isDisabled = true;
            service.handleSquareClick(grid.value[0][0]);
            service.handleLetter('A', false);
            expect(
                tilePlacementService.tilePlacements.find(
                    (placement) => placement.tile.letter === 'A' && comparePositions(placement.position, { row: 0, column: 0 }),
                ),
            ).toBeFalsy();
        });
    });

    describe('handleBackspace', () => {
        it('should remove letter from current position', () => {
            service.initialize(grid, () => tiles);
            service.handleSquareClick(grid.value[0][0]);
            service.handleLetter('A', false);
            service.handleBackspace();
            expect(grid.value[0][0].square.tile).toBeNull();
        });
    });
});
