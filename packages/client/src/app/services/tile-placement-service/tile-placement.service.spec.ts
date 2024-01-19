/* eslint-disable max-classes-per-file */
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { Orientation } from '@app/classes/actions/orientation';
import { BoardNavigator } from '@app/classes/board-navigator/board-navigator';
import { Position } from '@app/classes/board-navigator/position';
import { SquareView } from '@app/classes/square';
import { TilePlacement } from '@app/classes/tile';
import { BOARD_SIZE } from '@app/constants/game-constants';
import BoardService from '@app/services/board-service/board.service';
import { GameHistoryForUser } from '@common/models/game-history';
import { PublicServerAction } from '@common/models/server-action';
import { PublicUser } from '@common/models/user';
import { PublicUserStatistics } from '@common/models/user-statistics';
import { BehaviorSubject } from 'rxjs';
import { UserService } from '@app/services/user-service/user.service';
import { TilePlacementService } from './tile-placement.service';
import RoundManagerService from '@app/services/round-manager-service/round-manager.service';

const DEFAULT_PLACEMENT: TilePlacement = {
    position: { row: 0, column: 0 },
    tile: { letter: 'A', value: 1 },
};
const DEFAULT_BLANK_PLACEMENT: TilePlacement = {
    position: { row: 0, column: 0 },
    tile: { letter: '*', value: 1, isBlank: true },
};

const DEFAULT_BOARD: SquareView[][] = new Array(BOARD_SIZE).fill(0).map((_, row) =>
    new Array(BOARD_SIZE).fill(0).map<SquareView>(
        (__, column) =>
            new SquareView(
                {
                    tile: null,
                    isCenter: false,
                    position: { row, column },
                    scoreMultiplier: null,
                    wasMultiplierUsed: false,
                },
                { x: 1, y: 1 },
            ),
    ),
);

describe('TilePlacementService', () => {
    let service: TilePlacementService;
    let boardService: BoardService;

    const userService = jasmine.createSpyObj(UserService, ['updateStatistics', 'updateGameHistory', 'updateServerActions']);
    userService.user = new BehaviorSubject<PublicUser>({ email: '1@2', avatar: '', username: 'John Doe' });
    userService.statistics = new BehaviorSubject<PublicUserStatistics>({
        gamesPlayedCount: 1,
        gamesWonCount: 1,
        averageTimePerGame: 1,
        averagePointsPerGame: 1,
        rating: 1,
        ratingMax: 1,
        bingoCount: 0,
    });
    userService.gameHistory = new BehaviorSubject<GameHistoryForUser[]>([]);
    userService.serverActions = new BehaviorSubject<PublicServerAction[]>([]);

    const spyRoundManagerService = jasmine.createSpyObj(RoundManagerService, ['isActivePlayerLocalPlayer']);
    spyRoundManagerService.isActivePlayerLocalPlayer.and.callFake(() => {
        return true;
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatDialogModule],
            providers: [
                { provide: UserService, useValue: userService },
                { provide: RoundManagerService, useValue: spyRoundManagerService },
            ],
        });
        service = TestBed.inject(TilePlacementService);
        boardService = TestBed.inject(BoardService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('placeTile', () => {
        it('should add a placement to tilePlacements', () => {
            service.placeTile(DEFAULT_PLACEMENT);
            expect(service.tilePlacements).toContain(DEFAULT_PLACEMENT);
        });

        it('should add placement with blank tile and ask for value', () => {
            const letter = 'Z';
            spyOn<any>(service, 'askFillBlankLetter').and.callFake((callback: (letter: string) => void) => {
                callback(letter);
            });

            service.placeTile(DEFAULT_BLANK_PLACEMENT);

            expect(service.tilePlacements.find((placement) => placement.tile.playedLetter === letter)).toBeTruthy();
        });
    });

    describe('moveTile', () => {
        it('should change placement, but keep tile', () => {
            const newPlacement: TilePlacement = { ...DEFAULT_PLACEMENT, position: { row: 14, column: 14 } };

            service.placeTile(DEFAULT_PLACEMENT);
            service.moveTile(newPlacement, DEFAULT_PLACEMENT.position);

            expect(service.tilePlacements).toContain(newPlacement);
            expect(service.tilePlacements).not.toContain(DEFAULT_PLACEMENT);
        });

        it('should change placement for blank tile and ask for value', () => {
            const previousLetter = 'Z';
            const letter = 'M';

            const spy = spyOn<any>(service, 'askFillBlankLetter').and.callFake((callback: (letter: string) => void) => {
                callback(previousLetter);
            });

            service.placeTile(DEFAULT_BLANK_PLACEMENT);

            spy.and.callFake((callback: (letter: string) => void) => {
                callback(letter);
            });

            const newPlacement: TilePlacement = { ...DEFAULT_BLANK_PLACEMENT, position: { row: 14, column: 14 } };

            service.moveTile(newPlacement, DEFAULT_BLANK_PLACEMENT.position);

            expect(service.tilePlacements.find((placement) => placement.tile.playedLetter === letter)).toBeTruthy();
            expect(service.tilePlacements.find((placement) => placement.tile.playedLetter === previousLetter)).toBeFalsy();
        });
    });

    describe('removeTile', () => {
        it('should remove tile', () => {
            service.placeTile(DEFAULT_PLACEMENT);
            service.removeTile(DEFAULT_PLACEMENT);

            expect(service.tilePlacements).toHaveSize(0);
        });

        it('should remove tile and remove placedLetter value', () => {
            const placement = { ...DEFAULT_PLACEMENT, tile: { ...DEFAULT_PLACEMENT.tile } };
            spyOn<any>(service, 'askFillBlankLetter').and.callFake((callback: (letter: string) => void) => {
                callback('Z');
            });

            service.placeTile(placement);
            service.removeTile(placement);

            expect(placement.tile.playedLetter).toBeUndefined();
        });
    });

    describe('resetTiles', () => {
        it('should remove all tiles', () => {
            service.placeTile(DEFAULT_PLACEMENT);
            service.placeTile(DEFAULT_PLACEMENT);

            service.resetTiles();

            expect(service.tilePlacements).toHaveSize(0);
        });

        it('should set all playedLetter values to undefined', () => {
            const placement = { ...DEFAULT_PLACEMENT, tile: { ...DEFAULT_PLACEMENT.tile } };
            spyOn<any>(service, 'askFillBlankLetter').and.callFake((callback: (letter: string) => void) => {
                callback('Z');
            });

            service.placeTile(placement);

            service.resetTiles();

            expect(placement.tile.playedLetter).toBeUndefined();
        });
    });

    describe('createPlaceActionPayload', () => {
        it('should return placement if valid (vertical)', () => {
            const size = 4;

            for (let i = 0; i < size; ++i) {
                service.placeTile({ ...DEFAULT_PLACEMENT, position: { ...DEFAULT_PLACEMENT.position, row: i } });
            }

            const placeActionPayload = service.createPlaceActionPayload();

            expect(placeActionPayload?.startPosition).toEqual(DEFAULT_PLACEMENT.position);
            expect(placeActionPayload?.tiles).toHaveSize(size);
            expect(placeActionPayload?.orientation).toEqual(Orientation.Vertical);
        });

        it('should return placement if valid (horizontal)', () => {
            const size = 4;

            for (let i = 0; i < size; ++i) {
                service.placeTile({ ...DEFAULT_PLACEMENT, position: { ...DEFAULT_PLACEMENT.position, column: i } });
            }

            const placeActionPayload = service.createPlaceActionPayload();

            expect(placeActionPayload?.startPosition).toEqual(DEFAULT_PLACEMENT.position);
            expect(placeActionPayload?.tiles).toHaveSize(size);
            expect(placeActionPayload?.orientation).toEqual(Orientation.Horizontal);
        });

        it('should return undefined if invalid', () => {
            const size = 4;

            for (let i = 0; i < size; ++i) {
                service.placeTile({ ...DEFAULT_PLACEMENT, position: { row: i, column: i } });
            }

            expect(service.createPlaceActionPayload()).toBeUndefined();
        });
    });

    describe('validatePlacement', () => {
        beforeEach(() => {
            const navigator = new BoardNavigator(DEFAULT_BOARD, DEFAULT_PLACEMENT.position, Orientation.Horizontal);
            boardService.navigator = navigator;
        });

        afterEach(() => {
            DEFAULT_BOARD.forEach((line) => line.forEach((squareView) => (squareView.square.tile = null)));
        });

        it('should be invalid by default', () => {
            expect(service.isPlacementValid).toBeFalse();
        });

        it('should return true if valid (horizontal, applied at start)', () => {
            const appliedTilesPositions: Position[] = [{ row: 3, column: 2 }];

            const positions: Position[] = [
                { row: 3, column: 3 },
                { row: 3, column: 4 },
                { row: 3, column: 5 },
            ];

            for (const position of appliedTilesPositions) {
                DEFAULT_BOARD[position.row][position.column].square.tile = DEFAULT_PLACEMENT.tile;
            }

            for (const position of positions) {
                service.placeTile({ ...DEFAULT_PLACEMENT, position });
            }

            expect(service.isPlacementValid).toBeTrue();
        });

        it('should return true if valid (horizontal, applied at end)', () => {
            const appliedTilesPositions: Position[] = [{ row: 3, column: 6 }];

            const positions: Position[] = [
                { row: 3, column: 3 },
                { row: 3, column: 4 },
                { row: 3, column: 5 },
            ];

            for (const position of appliedTilesPositions) {
                DEFAULT_BOARD[position.row][position.column].square.tile = DEFAULT_PLACEMENT.tile;
            }

            for (const position of positions) {
                service.placeTile({ ...DEFAULT_PLACEMENT, position });
            }

            expect(service.isPlacementValid).toBeTrue();
        });

        it('should return true if valid (horizontal, applied in middle)', () => {
            const appliedTilesPositions: Position[] = [{ row: 3, column: 4 }];

            const positions: Position[] = [
                { row: 3, column: 3 },
                { row: 3, column: 5 },
                { row: 3, column: 6 },
            ];

            for (const position of appliedTilesPositions) {
                DEFAULT_BOARD[position.row][position.column].square.tile = DEFAULT_PLACEMENT.tile;
            }

            for (const position of positions) {
                service.placeTile({ ...DEFAULT_PLACEMENT, position });
            }

            expect(service.isPlacementValid).toBeTrue();
        });

        it('should return true if valid (horizontal, applied at side)', () => {
            const appliedTilesPositions: Position[] = [{ row: 4, column: 4 }];

            const positions: Position[] = [
                { row: 3, column: 3 },
                { row: 3, column: 4 },
                { row: 3, column: 5 },
            ];

            for (const position of appliedTilesPositions) {
                DEFAULT_BOARD[position.row][position.column].square.tile = DEFAULT_PLACEMENT.tile;
            }

            for (const position of positions) {
                service.placeTile({ ...DEFAULT_PLACEMENT, position });
            }

            expect(service.isPlacementValid).toBeTrue();
        });

        it('should return true if valid (horizontal, middle)', () => {
            const positions: Position[] = [
                { row: 7, column: 7 },
                { row: 7, column: 8 },
                { row: 7, column: 9 },
            ];

            for (const position of positions) {
                service.placeTile({ ...DEFAULT_PLACEMENT, position });
            }

            expect(service.isPlacementValid).toBeTrue();
        });

        it('should return true if valid (vertical, applied at start)', () => {
            const appliedTilesPositions: Position[] = [{ row: 2, column: 3 }];

            const positions: Position[] = [
                { row: 3, column: 3 },
                { row: 4, column: 3 },
                { row: 5, column: 3 },
            ];

            for (const position of appliedTilesPositions) {
                DEFAULT_BOARD[position.row][position.column].square.tile = DEFAULT_PLACEMENT.tile;
            }

            for (const position of positions) {
                service.placeTile({ ...DEFAULT_PLACEMENT, position });
            }

            expect(service.isPlacementValid).toBeTrue();
        });

        it('should return true if valid (single, applied at side 1)', () => {
            const appliedTilesPositions: Position[] = [{ row: 2, column: 3 }];

            const positions: Position[] = [{ row: 3, column: 3 }];

            for (const position of appliedTilesPositions) {
                DEFAULT_BOARD[position.row][position.column].square.tile = DEFAULT_PLACEMENT.tile;
            }

            for (const position of positions) {
                service.placeTile({ ...DEFAULT_PLACEMENT, position });
            }

            expect(service.isPlacementValid).toBeTrue();
        });

        it('should return true if valid (single, applied at side 2)', () => {
            const appliedTilesPositions: Position[] = [{ row: 3, column: 2 }];

            const positions: Position[] = [{ row: 3, column: 3 }];

            for (const position of appliedTilesPositions) {
                DEFAULT_BOARD[position.row][position.column].square.tile = DEFAULT_PLACEMENT.tile;
            }

            for (const position of positions) {
                service.placeTile({ ...DEFAULT_PLACEMENT, position });
            }

            expect(service.isPlacementValid).toBeTrue();
        });

        it('should return false if invalid (horizontal, not connected)', () => {
            const positions: Position[] = [
                { row: 3, column: 3 },
                { row: 3, column: 4 },
                { row: 3, column: 5 },
            ];

            for (const position of positions) {
                service.placeTile({ ...DEFAULT_PLACEMENT, position });
            }

            expect(service.isPlacementValid).toBeFalse();
        });

        it('should return false if invalid (horizontal, applied at start, gap)', () => {
            const appliedTilesPositions: Position[] = [{ row: 3, column: 2 }];

            const positions: Position[] = [
                { row: 3, column: 3 },
                { row: 3, column: 4 },
                { row: 3, column: 6 },
            ];

            for (const position of appliedTilesPositions) {
                DEFAULT_BOARD[position.row][position.column].square.tile = DEFAULT_PLACEMENT.tile;
            }

            for (const position of positions) {
                service.placeTile({ ...DEFAULT_PLACEMENT, position });
            }

            expect(service.isPlacementValid).toBeFalse();
        });

        it('should return false if invalid (horizontal, applied at start, tile disconnected)', () => {
            const appliedTilesPositions: Position[] = [{ row: 3, column: 2 }];

            const positions: Position[] = [
                { row: 3, column: 3 },
                { row: 4, column: 4 },
                { row: 3, column: 5 },
            ];

            for (const position of appliedTilesPositions) {
                DEFAULT_BOARD[position.row][position.column].square.tile = DEFAULT_PLACEMENT.tile;
            }

            for (const position of positions) {
                service.placeTile({ ...DEFAULT_PLACEMENT, position });
            }

            expect(service.isPlacementValid).toBeFalse();
        });
    });
});
