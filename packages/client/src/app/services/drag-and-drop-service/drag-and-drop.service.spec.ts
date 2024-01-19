/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-empty-function */
import { CdkDragMove } from '@angular/cdk/drag-drop';
import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { Position } from '@app/classes/board-navigator/position';
import { TilePlacement } from '@app/classes/tile';
import { TilePlacementService } from '@app/services/tile-placement-service/tile-placement.service';
import { GameHistoryForUser } from '@common/models/game-history';
import { PublicServerAction } from '@common/models/server-action';
import { PublicUser } from '@common/models/user';
import { PublicUserStatistics } from '@common/models/user-statistics';
import { BehaviorSubject } from 'rxjs';
import { UserService } from '@app/services/user-service/user.service';
import { DragAndDropService } from './drag-and-drop.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';

const DEFAULT_PLACEMENT: TilePlacement = {
    position: { row: 0, column: 0 },
    tile: { letter: 'A', value: 1 },
};
const DEFAULT_EVENT: CdkDragMove<HTMLElement> = {
    pointerPosition: { x: 0, y: 0 },
} as CdkDragMove<HTMLElement>;

const createSquare = (document: Document, position: Position = DEFAULT_PLACEMENT.position) => {
    const square = document.createElement('div');
    square.classList.add('square', 'can-drop');
    square.setAttribute('column', `${position.column}`);
    square.setAttribute('row', `${position.row}`);
    return square;
};

describe('DragAndDropService', () => {
    let service: DragAndDropService;
    let document: Document;
    let tilePlacementService: TilePlacementService;
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

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatDialogModule, HttpClientTestingModule, RouterTestingModule, MatSnackBarModule],
            providers: [{ provide: UserService, useValue: userService }],
        });
        service = TestBed.inject(DragAndDropService);
        // tilePlacementService = TestBed.inject(TilePlacementService);
        document = TestBed.inject(DOCUMENT);
        tilePlacementService = TestBed.inject(TilePlacementService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('onRackTileDrop', () => {
        it('should add tile to tilePlacements if is square', () => {
            const square = createSquare(document);
            spyOn(document, 'elementFromPoint').and.returnValue(square);

            service.onRackTileMove(DEFAULT_EVENT);
            service.onRackTileDrop(DEFAULT_PLACEMENT.tile);

            expect(tilePlacementService.tilePlacements).toHaveSize(1);
        });

        it('should not add tile to tilePlacements if is not square', () => {
            const square = document.createElement('div');
            spyOn(document, 'elementFromPoint').and.returnValue(square);

            service.onRackTileMove(DEFAULT_EVENT);
            service.onRackTileDrop(DEFAULT_PLACEMENT.tile);

            expect(tilePlacementService.tilePlacements).toHaveSize(0);
        });
    });

    describe('onBoardTileDrop', () => {
        let newPosition: Position;

        beforeEach(() => {
            newPosition = { row: 1, column: 1 };
        });

        it('should move tile if is square', () => {
            const square = createSquare(document, newPosition);
            spyOn(document, 'elementFromPoint').and.returnValue(square);

            tilePlacementService.placeTile(DEFAULT_PLACEMENT);

            service.onBoardTileMove(DEFAULT_EVENT);
            service.onBoardTileDrop(DEFAULT_PLACEMENT.tile, DEFAULT_PLACEMENT.position);

            expect(
                tilePlacementService.tilePlacements.find(
                    (placement: TilePlacement) => placement.position.column === newPosition.column && placement.position.row === newPosition.row,
                ),
            ).toBeTruthy();
            expect(
                tilePlacementService.tilePlacements.find(
                    (placement: TilePlacement) =>
                        placement.position.column === DEFAULT_PLACEMENT.position.column && placement.position.row === DEFAULT_PLACEMENT.position.row,
                ),
            ).toBeFalsy();
        });

        it('should not move tile if is not square', () => {
            const square = document.createElement('div');
            spyOn(document, 'elementFromPoint').and.returnValue(square);

            tilePlacementService.placeTile(DEFAULT_PLACEMENT);

            service.onBoardTileMove(DEFAULT_EVENT);
            service.onBoardTileDrop(DEFAULT_PLACEMENT.tile, DEFAULT_PLACEMENT.position);

            expect(
                tilePlacementService.tilePlacements.find(
                    (placement: TilePlacement) => placement.position.column === newPosition.column && placement.position.row === newPosition.row,
                ),
            ).toBeFalsy();
            expect(
                tilePlacementService.tilePlacements.find(
                    (placement: TilePlacement) =>
                        placement.position.column === DEFAULT_PLACEMENT.position.column && placement.position.row === DEFAULT_PLACEMENT.position.row,
                ),
            ).toBeTruthy();
        });

        it('should remove tile from tilePlacements if is tileRack', () => {
            const tileRack = document.createElement('div');
            tileRack.classList.add('tile-rack');
            spyOn(document, 'elementFromPoint').and.returnValue(tileRack);

            tilePlacementService.placeTile(DEFAULT_PLACEMENT);

            service.onBoardTileMove(DEFAULT_EVENT);
            service.onBoardTileDrop(DEFAULT_PLACEMENT.tile, DEFAULT_PLACEMENT.position);

            expect(tilePlacementService.tilePlacements).toHaveSize(0);
        });
    });
});
