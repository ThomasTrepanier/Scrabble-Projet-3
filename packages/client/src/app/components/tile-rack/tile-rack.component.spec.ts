/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-lines */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActionData, ActionType, ExchangeActionPayload } from '@app/classes/actions/action-data';
import { Message } from '@app/classes/communication/message';
import { Player } from '@app/classes/player';
import { LetterValue, Tile, TilePlacement } from '@app/classes/tile';
import { IconComponent } from '@app/components/icon/icon.component';
import { TileComponent } from '@app/components/tile/tile.component';
import { MAX_TILES_PER_PLAYER } from '@app/constants/game-constants';
import { AppMaterialModule } from '@app/modules/material.module';
import { GameService } from '@app/services';
import { GameViewEventManagerService } from '@app/services/game-view-event-manager-service/game-view-event-manager.service';
import { TilePlacementService } from '@app/services/tile-placement-service/tile-placement.service';
import { Random } from '@app/utils/random/random';
import { Observable, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RackTile, TileRackComponent } from './tile-rack.component';
import SpyObj = jasmine.SpyObj;

const DEFAULT_GAME_ID = 'gameId';
const DEFAULT_PLAYER_ID = 'playerId';
const USER1 = { username: 'user1', email: 'email1', avatar: 'avatar1' };

describe('TileRackComponent', () => {
    const EMPTY_TILE_RACK: RackTile[] = [];
    let gameServiceSpy: SpyObj<GameService>;
    let gameViewEventManagerSpy: SpyObj<GameViewEventManagerService>;
    let component: TileRackComponent;
    let fixture: ComponentFixture<TileRackComponent>;
    let handleUsedTileSpy: jasmine.Spy;

    beforeEach(() => {
        gameServiceSpy = jasmine.createSpyObj(
            'GameService',
            [
                'getLocalPlayer',
                'isLocalPlayerPlaying',
                'subscribeToUpdateTileRackEvent',
                'getTotalNumberOfTilesLeft',
                'getGameId',
                'getLocalPlayerId',
            ],
            ['playingTiles'],
        );
        gameServiceSpy.getGameId.and.returnValue(DEFAULT_GAME_ID);
        gameServiceSpy.getLocalPlayerId.and.returnValue(DEFAULT_PLAYER_ID);
        gameServiceSpy.getLocalPlayer.and.returnValue(new Player(DEFAULT_PLAYER_ID, USER1, []));
        gameServiceSpy.isLocalPlayerPlaying.and.returnValue(true);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        gameServiceSpy.getTotalNumberOfTilesLeft.and.returnValue(100);

        const tileRackUpdate$ = new Subject();
        const usedTiles$ = new Subject();
        const resetUsedTiles$ = new Subject();
        const message$ = new Subject<Message | null>();
        gameViewEventManagerSpy = jasmine.createSpyObj('GameViewEventManagerService', [
            'emitGameViewEvent',
            'subscribeToGameViewEvent',
            'getGameViewEventValue',
        ]);
        gameViewEventManagerSpy.emitGameViewEvent.and.callFake((eventType: string, payload?: any) => {
            switch (eventType) {
                case 'tileRackUpdate':
                    tileRackUpdate$.next();
                    break;
                case 'usedTiles':
                    usedTiles$.next();
                    break;
                case 'resetUsedTiles':
                    resetUsedTiles$.next();
                    break;
                case 'newMessage':
                    message$.next(payload);
            }
        });

        gameViewEventManagerSpy.subscribeToGameViewEvent.and.callFake((eventType: string, destroy$: Observable<boolean>, next: any): Subscription => {
            switch (eventType) {
                case 'tileRackUpdate':
                    return tileRackUpdate$.pipe(takeUntil(destroy$)).subscribe(next);
                case 'usedTiles':
                    return usedTiles$.pipe(takeUntil(destroy$)).subscribe(next);
                case 'resetUsedTiles':
                    return resetUsedTiles$.pipe(takeUntil(destroy$)).subscribe(next);
                case 'newMessage':
                    return message$.pipe(takeUntil(destroy$)).subscribe(next);
            }
            return new Subscription();
        });
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                MatGridListModule,
                MatCardModule,
                MatProgressSpinnerModule,
                MatIconModule,
                MatButtonModule,
                ReactiveFormsModule,
                CommonModule,
                MatInputModule,
                BrowserAnimationsModule,
                AppMaterialModule,
                MatFormFieldModule,
                FormsModule,
                MatDialogModule,
                HttpClientTestingModule,
            ],
            declarations: [TileRackComponent, IconComponent, TileComponent],
            providers: [
                { provide: GameService, useValue: gameServiceSpy },
                { provide: GameViewEventManagerService, useValue: gameViewEventManagerSpy },
                {
                    provide: TilePlacementService,
                    useValue: jasmine.createSpyObj('TilePlacementService', ['placeTile', 'handleCancelPlacement', 'resetTiles'], {
                        tilePlacements$: new Subject(),
                        tilePlacements: [],
                    }),
                },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TileRackComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        handleUsedTileSpy = spyOn<any>(component, 'handleUsedTiles');
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call updateTileRack when tileRackUpdate is received', () => {
        const spy = spyOn<any>(component, 'updateTileRack');
        gameViewEventManagerSpy.emitGameViewEvent('tileRackUpdate');
        expect(spy).toHaveBeenCalled();
    });

    it('Initializing TileRack with no Player in Game should return empty TileRack', () => {
        gameServiceSpy.getLocalPlayer.and.returnValue(undefined);
        component['updateTileRack'](undefined);
        expect(component.tiles).toEqual(EMPTY_TILE_RACK);
    });

    it('Initializing TileRack with player with no tiles should return empty TileRack', () => {
        const localPlayer: Player = new Player('', USER1, []);

        gameServiceSpy.getLocalPlayer.and.returnValue(localPlayer);
        spyOn(localPlayer, 'getTiles').and.returnValue([]);

        component['updateTileRack'](localPlayer.id);

        expect(component.tiles).toEqual(EMPTY_TILE_RACK);
    });

    it('Initializing TileRack with player with tiles should return the player tiles', () => {
        const tiles: RackTile[] = [
            { letter: 'A', value: 10, isUsed: false, isSelected: false },
            { letter: 'B', value: 1, isUsed: false, isSelected: false },
            { letter: 'D', value: 1, isUsed: true, isSelected: false },
        ];
        const localPlayer: Player = new Player('', USER1, [
            { letter: 'B', value: 1 },
            { letter: 'D', value: 1 },
            { letter: 'A', value: 10 },
        ]);

        component['tiles'] = tiles;
        gameServiceSpy.getLocalPlayer.and.returnValue(localPlayer);

        component['updateTileRack'](localPlayer.id);

        expect(component.tiles[0]).toBeTruthy();
    });

    describe('focus', () => {
        it('should call setActiveKeyboardComponent', () => {
            const spy = spyOn(component['focusableComponentService'], 'setActiveKeyboardComponent');

            component.focus();

            expect(spy).toHaveBeenCalledOnceWith(component);
        });
    });

    describe('canExchangeTiles', () => {
        let isLocalPlayerPlayingSpy: jasmine.Spy;

        beforeEach(() => {
            component.selectedTiles = [{}, {}] as RackTile[];
            isLocalPlayerPlayingSpy = gameServiceSpy.isLocalPlayerPlaying.and.returnValue(true);
            component['actionService'].hasActionBeenPlayed = false;
        });

        it('should be true if can exchange', () => {
            expect(component.canExchangeTiles()).toBeTrue();
        });

        it('should be false if selectedTiles is empty', () => {
            component.selectedTiles = [];
            expect(component.canExchangeTiles()).toBeFalse();
        });

        it('should be false if is not local player playing', () => {
            isLocalPlayerPlayingSpy.and.returnValue(false);
            expect(component.canExchangeTiles()).toBeFalse();
        });

        it('should be false if is less than 7 tiles', () => {
            gameServiceSpy.getTotalNumberOfTilesLeft.and.returnValue(MAX_TILES_PER_PLAYER - 1);
            expect(component.canExchangeTiles()).toBeFalse();
        });

        it('should be false if action has been played', () => {
            component['actionService'].hasActionBeenPlayed = true;
            expect(component.canExchangeTiles()).toBeFalse();
            component['actionService'].hasActionBeenPlayed = false;
        });
    });

    describe('exchangeTiles', () => {
        const fakePayload = { fake: 'payload' };
        const fakeData = { fake: 'data' };
        let createPayloadSpy: jasmine.Spy;
        let createActionDataSpy: jasmine.Spy;
        let sendAction: jasmine.Spy;
        let canExchangeTile: jasmine.Spy;

        beforeEach(() => {
            createPayloadSpy = spyOn(component['actionService'], 'createExchangeActionPayload').and.returnValue(
                fakePayload as unknown as ExchangeActionPayload,
            );
            createActionDataSpy = spyOn(component['actionService'], 'createActionData').and.returnValue(fakeData as unknown as ActionData);
            sendAction = spyOn(component['actionService'], 'sendAction').and.callFake(() => {
                return;
            });
            canExchangeTile = spyOn(component, 'canExchangeTiles').and.returnValue(true);
            component.selectedTiles = [{ isUsed: false }, { isPlayed: false }] as RackTile[];
        });

        it('should send exchange action', () => {
            const tiles = [...component.selectedTiles];
            component.exchangeTiles();
            expect(createPayloadSpy).toHaveBeenCalledWith(tiles);
            expect(createActionDataSpy).toHaveBeenCalledWith(ActionType.EXCHANGE, fakePayload);
            expect(sendAction).toHaveBeenCalledOnceWith(DEFAULT_GAME_ID, fakeData);
        });

        it('should set all selectedTiles as played', () => {
            const tiles = [...component.selectedTiles];
            component.exchangeTiles();
            expect(tiles.every((tile) => tile.isUsed)).toBeTrue();
        });

        it('should not send action if cannot exchange', () => {
            canExchangeTile.and.returnValue(false);
            component.exchangeTiles();
            expect(sendAction).not.toHaveBeenCalled();
        });
    });

    describe('handleUsedTiles', () => {
        beforeEach(() => {
            handleUsedTileSpy.and.callThrough();
        });

        it('should make tiles as used', () => {
            component.tiles = [
                { letter: 'A', value: 0, isUsed: false },
                { letter: 'B', value: 0, isUsed: false },
                { letter: 'C', value: 0, isUsed: false },
            ] as RackTile[];

            const tilePlacements: TilePlacement[] = [
                { tile: { letter: 'A', value: 0 }, position: { row: 0, column: 0 } },
                { tile: { letter: 'B', value: 0 }, position: { row: 0, column: 0 } },
            ];

            component['handleUsedTiles'](tilePlacements);

            for (const { tile } of tilePlacements) {
                expect(component.tiles.find((t) => t.letter === tile.letter)?.isUsed).toBeTrue();
            }
        });

        it('should mark tile as unused if not in payload', () => {
            component.tiles = [{ letter: 'A', isUsed: true }] as RackTile[];

            component['handleUsedTiles']([]);

            for (const tile of component.tiles) {
                expect(tile.isUsed).toBeFalse();
            }
        });

        it('should only mark one tile as used if two with same letter', () => {
            component.tiles = [
                { letter: 'A', value: 0, isUsed: false },
                { letter: 'A', value: 0, isUsed: true },
            ] as RackTile[];

            const tilePlacements: TilePlacement[] = [{ tile: { letter: 'A', value: 0 }, position: { row: 0, column: 0 } }];

            component['handleUsedTiles'](tilePlacements);

            expect(component.tiles[0].isUsed).toBeTrue();
            expect(component.tiles[1].isUsed).toBeFalse();
        });

        it('should not mark any tiles if paylod is undefined', () => {
            component.tiles = [{ letter: 'A', isUsed: false }] as RackTile[];

            component['handleUsedTiles']([]);

            expect(component.tiles[0].isUsed).toBeFalse();
        });
    });

    describe('updateTileRack', () => {
        const DEFAULT_TILES: Tile[] = [
            new Tile('A' as LetterValue, 1),
            new Tile('B' as LetterValue, 1),
            new Tile('C' as LetterValue, 1),
            new Tile('C' as LetterValue, 1),
            new Tile('E' as LetterValue, 1),
            new Tile('E' as LetterValue, 1),
            new Tile('*' as LetterValue, 0, true),
        ];

        it('should call right functions', () => {
            gameServiceSpy.getLocalPlayer.and.returnValue(new Player(DEFAULT_PLAYER_ID, USER1, DEFAULT_TILES));
            gameServiceSpy.getLocalPlayerId.and.returnValue(DEFAULT_PLAYER_ID);
            const createRackTileSpy = spyOn<any>(component, 'createRackTile');

            component['updateTileRack'](DEFAULT_PLAYER_ID);

            expect(gameServiceSpy.getLocalPlayer).toHaveBeenCalled();
            expect(gameServiceSpy.getLocalPlayerId).toHaveBeenCalled();
            expect(createRackTileSpy).toHaveBeenCalled();
        });
    });

    describe('createRackTile', () => {
        const DEFAULT_TILE: Tile = new Tile('A' as LetterValue, 1);
        const DEFAULT_RACK_TILE: RackTile = { letter: 'A', value: 1, isUsed: true, isSelected: true };

        it('should set isUsed to false if rackTile is undefined && rackTile.isUsed is true', () => {
            expect(component['createRackTile'](DEFAULT_TILE, undefined as unknown as RackTile).isUsed).toBeFalse();
        });

        it('should set isUsed to false if rackTile is defined && rackTile.isUsed is false', () => {
            expect(component['createRackTile'](DEFAULT_TILE, { ...DEFAULT_RACK_TILE, isUsed: false }).isUsed).toBeFalse();
        });

        it('should set isSelected to true if rackTile is defined && rackTile.isSelected is true', () => {
            expect(component['createRackTile'](DEFAULT_TILE, DEFAULT_RACK_TILE).isSelected).toBeTrue();
        });

        it('should set isSelected to false if rackTile is defined && rackTile.isSelected is false', () => {
            expect(component['createRackTile'](DEFAULT_TILE, { ...DEFAULT_RACK_TILE, isSelected: false }).isSelected).toBeFalse();
        });
    });

    describe('shuffleTiles', () => {
        it('should call randomize with tiles', async () => {
            const tiles = [1, 2, 3];
            const random = [2, 1, 3];
            (component.tiles as unknown) = tiles;

            const spy = spyOn(Random, 'randomize').and.returnValue(random);

            await component.shuffleTiles();

            expect(spy).toHaveBeenCalledWith(tiles);
            expect(component.tiles as unknown).toEqual(random);

            spy.and.callThrough();
        });
    });
});
