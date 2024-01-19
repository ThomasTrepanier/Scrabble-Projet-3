/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Board } from '@app/classes/board';
import Player from '@app/classes/player/player';
import { Round } from '@app/classes/round/round';
import RoundManager from '@app/classes/round/round-manager';
import { LetterValue, Tile } from '@app/classes/tile';
import TileReserve from '@app/classes/tile/tile-reserve';
import { TileReserveData } from '@app/classes/tile/tile.types';
import { TEST_DICTIONARY } from '@app/constants/dictionary-tests-const';
import { INVALID_PLAYER_ID_FOR_GAME } from '@app/constants/services-errors';
import BoardService from '@app/services/board-service/board.service';
import ObjectivesService from '@app/services/objective-service/objective.service';
import { GameVisibility } from '@common/models/game-visibility';
import { VirtualPlayerLevel } from '@common/models/virtual-player-level';
import * as chai from 'chai';
import { assert } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import * as sinon from 'sinon';
import { createStubInstance, SinonStub, SinonStubbedInstance, stub } from 'sinon';
import { Container } from 'typedi';
import { DictionarySummary } from '@app/classes/communication/dictionary-data';
import Game from './game';
import { ReadyGameConfig, StartGameData } from './game-config';
import { AuthentificationService } from '@app/services/authentification-service/authentification.service';
const expect = chai.expect;

chai.use(spies);
chai.use(chaiAsPromised);

const DEFAULT_GAME_ID = 'gameId';
const DEFAULT_GAME_CHANNEL_ID = 1;

const DEFAULT_PLAYER_1_ID = '1';
const DEFAULT_PLAYER_2_ID = '2';
const DEFAULT_PLAYER_3_ID = '3';
const DEFAULT_PLAYER_4_ID = '4';
const USER1 = { username: 'user1', email: 'email1', avatar: 'avatar1' };
const USER2 = { username: 'user2', email: 'email2', avatar: 'avatar2' };
const USER3 = { username: 'user3', email: 'email3', avatar: 'avatar3' };
const USER4 = { username: 'user4', email: 'email4', avatar: 'avatar4' };

const NEW_PLAYER_ID = 'newid';
const DEFAULT_PLAYER_1 = new Player(DEFAULT_PLAYER_1_ID, USER1);
const DEFAULT_PLAYER_2 = new Player(DEFAULT_PLAYER_2_ID, USER2);
const DEFAULT_PLAYER_3 = new Player(DEFAULT_PLAYER_3_ID, USER3);
const DEFAULT_PLAYER_4 = new Player(DEFAULT_PLAYER_4_ID, USER4);

const DEFAULT_MULTIPLAYER_CONFIG: ReadyGameConfig = {
    player1: DEFAULT_PLAYER_1,
    player2: DEFAULT_PLAYER_2,
    player3: DEFAULT_PLAYER_3,
    player4: DEFAULT_PLAYER_4,
    maxRoundTime: 1,
    dictionarySummary: {} as unknown as DictionarySummary,
    virtualPlayerLevel: VirtualPlayerLevel.Beginner,
    gameVisibility: GameVisibility.Public,
    password: '',
};
const DEFAULT_TILE: Tile = { letter: 'A', value: 1 };
const DEFAULT_TILE_2: Tile = { letter: 'B', value: 5 };

const DEFAULT_AMOUNT_OF_TILES = 25;

let DEFAULT_MAP = new Map<LetterValue, number>([
    ['A', 0],
    ['B', 0],
]);

describe('Game', () => {
    let defaultInit: () => Promise<void>;

    beforeEach(() => {
        defaultInit = TileReserve.prototype.init;
        TileReserve.prototype.init = async function () {
            this['initialized'] = true;
            for (let i = 0; i < DEFAULT_AMOUNT_OF_TILES; ++i) {
                this['tiles'].push({ ...DEFAULT_TILE });
            }
            this['referenceTiles'] = [...this['tiles']];
            return Promise.resolve();
        };

        sinon.stub(Container.get(AuthentificationService).connectedUsers, 'getUserId').returns(1);

        Game.injectServices();
    });

    afterEach(() => {
        TileReserve.prototype.init = defaultInit;
        sinon.restore();
    });

    describe('createGame', () => {
        let game: Game;

        beforeEach(async () => {
            game = await Game.createGame(DEFAULT_GAME_ID, DEFAULT_GAME_CHANNEL_ID, DEFAULT_MULTIPLAYER_CONFIG, []);
        });

        afterEach(() => {
            sinon.restore();
        });

        it('should create', () => {
            expect(game).to.exist;
        });

        it('should instantiate attributes', () => {
            expect(game.player1).to.exist;
            expect(game.player2).to.exist;
            expect(game.player3).to.exist;
            expect(game.player4).to.exist;
            expect(game.roundManager).to.exist;
            expect(game['tileReserve']).to.exist;
            expect(game.board).to.exist;
        });

        it('should init TileReserve', () => {
            expect(game['tileReserve'].isInitialized()).to.be.true;
        });

        it('should give players their tiles', () => {
            expect(game.player1.tiles).to.not.be.empty;
            expect(game.player2.tiles).to.not.be.empty;
            expect(game.player3.tiles).to.not.be.empty;
            expect(game.player4.tiles).to.not.be.empty;
        });
    });

    describe('General', () => {
        let game: Game;
        let tileReserveStub: SinonStubbedInstance<TileReserve>;

        beforeEach(async () => {
            game = await Game.createGame(DEFAULT_GAME_ID, DEFAULT_GAME_CHANNEL_ID, DEFAULT_MULTIPLAYER_CONFIG, []);
            tileReserveStub = createStubInstance(TileReserve);
            game['tileReserve'] = tileReserveStub as unknown as TileReserve;
        });

        it('getId should return an id', () => {
            expect(game.getId()).to.exist;
        });

        it('getTiles should call tileReserve.getTiles and return it', () => {
            const expected = [DEFAULT_TILE];
            tileReserveStub.getTiles.returns([DEFAULT_TILE]);
            expect(game.getTilesFromReserve(1)).to.deep.equal(expected);
            assert(tileReserveStub.getTiles.calledOnce);
        });

        it('swapTiles should call tileReserve.swapTiles and return it', () => {
            const expected = [DEFAULT_TILE];
            tileReserveStub.swapTiles.returns([DEFAULT_TILE]);
            expect(game.swapTilesFromReserve([DEFAULT_TILE_2])).to.deep.equal(expected);
            assert(tileReserveStub.swapTiles.calledOnce);
        });

        it('swapTiles should call tileReserve.getTilesLeftPerLetter and return it', () => {
            const expected = DEFAULT_MAP;
            tileReserveStub.getTilesLeftPerLetter.returns(DEFAULT_MAP);
            expect(game.getTilesLeftPerLetter()).to.deep.equal(expected);
            assert(tileReserveStub.getTilesLeftPerLetter.calledOnce);
        });

        it('getTotalTilesLeft should call same function from tileReserve', () => {
            tileReserveStub.getTotalTilesLeft.returns(1);
            game.getTotalTilesLeft();
            assert(tileReserveStub.getTotalTilesLeft.calledOnce);
        });

        describe('getPlayer', () => {
            beforeEach(() => {
                game.player1 = DEFAULT_PLAYER_1;
                game.player2 = DEFAULT_PLAYER_2;
                game.player3 = DEFAULT_PLAYER_3;
                game.player4 = DEFAULT_PLAYER_4;
            });

            it('should throw INVALID_PLAYER_ID_FOR_GAME if player is not from ', () => {
                chai.spy.on(game, 'isPlayerFromGame', () => false);
                expect(() => game.getPlayer('random id')).to.throw(INVALID_PLAYER_ID_FOR_GAME);
            });

            it('should return player 1 if id is player1 and is requesting player', () => {
                expect(game.getPlayer(DEFAULT_PLAYER_1_ID)).to.equal(game.player1);
            });

            it('should return player 2 if id is player2 and is requesting player', () => {
                expect(game.getPlayer(DEFAULT_PLAYER_2_ID)).to.equal(game.player2);
            });

            it('should return player 3 if id is player3 and is requesting player', () => {
                expect(game.getPlayer(DEFAULT_PLAYER_3_ID)).to.equal(game.player3);
            });

            it('should return player 4 if id is player4 and is requesting player', () => {
                expect(game.getPlayer(DEFAULT_PLAYER_4_ID)).to.equal(game.player4);
            });

            it('should throw INVALID_PLAYER_ID_FOR_GAME if player is from game but id is not player1 or player2', () => {
                chai.spy.on(game, 'isPlayerFromGame', () => true);
                expect(() => game.getPlayer('random id')).to.throw(INVALID_PLAYER_ID_FOR_GAME);
            });
        });

        describe('getPlayer', () => {
            it('should return player with same id (player 1)', () => {
                const player = game.getPlayer(DEFAULT_PLAYER_1.id);
                expect(player).to.equal(DEFAULT_PLAYER_1);
            });

            it('should return player with same id (player 2)', () => {
                const player = game.getPlayer(DEFAULT_PLAYER_2.id);
                expect(player).to.equal(DEFAULT_PLAYER_2);
            });

            it('should return player with same id (player 3)', () => {
                const player = game.getPlayer(DEFAULT_PLAYER_3.id);
                expect(player).to.equal(DEFAULT_PLAYER_3);
            });

            it('should return player with same id (player 4)', () => {
                const player = game.getPlayer(DEFAULT_PLAYER_4.id);
                expect(player).to.equal(DEFAULT_PLAYER_4);
            });

            it('should throw error if invalid id', () => {
                const invalidId = 'invalidId';
                expect(() => game.getPlayer(invalidId)).to.throw(INVALID_PLAYER_ID_FOR_GAME);
            });
        });
    });

    describe('isGameOver', () => {
        let game: Game;
        let roundManagerStub: SinonStubbedInstance<RoundManager>;
        let player1Stub: SinonStubbedInstance<Player>;
        let player2Stub: SinonStubbedInstance<Player>;
        let player3Stub: SinonStubbedInstance<Player>;
        let player4Stub: SinonStubbedInstance<Player>;

        beforeEach(() => {
            game = new Game(DEFAULT_GAME_CHANNEL_ID);
            roundManagerStub = createStubInstance(RoundManager);
            player1Stub = createStubInstance(Player);
            player2Stub = createStubInstance(Player);
            player3Stub = createStubInstance(Player);
            player4Stub = createStubInstance(Player);
            game.roundManager = roundManagerStub as unknown as RoundManager;
            game.player1 = player1Stub as unknown as Player;
            game.player2 = player2Stub as unknown as Player;
            game.player3 = player3Stub as unknown as Player;
            game.player4 = player4Stub as unknown as Player;
            game.player1.tiles = [
                { letter: 'A', value: 0 },
                { letter: 'B', value: 0 },
            ];
            game.player2.tiles = [
                { letter: 'A', value: 0 },
                { letter: 'B', value: 0 },
            ];
            game.player3.tiles = [
                { letter: 'A', value: 0 },
                { letter: 'B', value: 0 },
            ];
            game.player4.tiles = [
                { letter: 'A', value: 0 },
                { letter: 'B', value: 0 },
            ];
            player1Stub.hasTilesLeft.returns(true);
            player2Stub.hasTilesLeft.returns(true);
            player3Stub.hasTilesLeft.returns(true);
            player4Stub.hasTilesLeft.returns(true);
        });

        it('should not be gameOver passCount lower than threshold and all players have tiles', () => {
            roundManagerStub.verifyIfGameOver.returns(false);
            expect(game.areGameOverConditionsMet()).to.be.false;
        });

        it('should be gameOver passCount is equal to threshold', () => {
            roundManagerStub.verifyIfGameOver.returns(true);
            expect(game.areGameOverConditionsMet()).to.be.true;
        });

        it('should be gameOver when player 1 has no tiles', () => {
            roundManagerStub.verifyIfGameOver.returns(false);
            player1Stub.hasTilesLeft.returns(false);
            expect(game.areGameOverConditionsMet()).to.be.true;
        });

        it('should gameOver when player 2 has no tiles', () => {
            roundManagerStub.verifyIfGameOver.returns(false);
            player2Stub.hasTilesLeft.returns(false);
            expect(game.areGameOverConditionsMet()).to.be.true;
        });

        it('should gameOver when player 3 has no tiles', () => {
            roundManagerStub.verifyIfGameOver.returns(false);
            player3Stub.hasTilesLeft.returns(false);
            expect(game.areGameOverConditionsMet()).to.be.true;
        });

        it('should gameOver when player 4 has no tiles', () => {
            roundManagerStub.verifyIfGameOver.returns(false);
            player4Stub.hasTilesLeft.returns(false);
            expect(game.areGameOverConditionsMet()).to.be.true;
        });
    });

    describe('replacePlayer', () => {
        let game: Game;
        let roundManagerStub: SinonStubbedInstance<RoundManager>;
        let player1Stub: SinonStubbedInstance<Player>;
        let player2Stub: SinonStubbedInstance<Player>;
        let player3Stub: SinonStubbedInstance<Player>;
        let player4Stub: SinonStubbedInstance<Player>;
        let newPlayerStub: SinonStubbedInstance<Player>;

        beforeEach(() => {
            game = new Game(DEFAULT_GAME_CHANNEL_ID);
            roundManagerStub = createStubInstance(RoundManager);
            player1Stub = createStubInstance(Player);
            player2Stub = createStubInstance(Player);
            player3Stub = createStubInstance(Player);
            player4Stub = createStubInstance(Player);
            newPlayerStub = createStubInstance(Player);
            player1Stub.id = DEFAULT_PLAYER_1_ID;
            player2Stub.id = DEFAULT_PLAYER_2_ID;
            player3Stub.id = DEFAULT_PLAYER_3_ID;
            player4Stub.id = DEFAULT_PLAYER_4_ID;
            newPlayerStub.id = NEW_PLAYER_ID;
            game.roundManager = roundManagerStub as unknown as RoundManager;
            game.player1 = player1Stub as unknown as Player;
            game.player2 = player2Stub as unknown as Player;
            game.player3 = player3Stub as unknown as Player;
            game.player4 = player4Stub as unknown as Player;
        });

        it('should throw if the player is not from the game', () => {
            const result = () => {
                game.replacePlayer('badid', newPlayerStub as unknown as Player);
            };
            expect(result).to.throw(INVALID_PLAYER_ID_FOR_GAME);
        });

        it('should update the player1 if called with its id', () => {
            player1Stub.copyPlayerInfo.returns({ id: NEW_PLAYER_ID });
            chai.spy.on(game.roundManager, 'replacePlayer', () => {});
            game.replacePlayer(DEFAULT_PLAYER_1_ID, newPlayerStub as unknown as Player);

            expect(newPlayerStub.copyPlayerInfo.calledOnceWith(player1Stub)).to.be.true;
            expect(game.player1).to.equal(newPlayerStub);
            expect(game.player2).to.equal(player2Stub);
        });

        it('should update the player2 if called with its id', () => {
            player2Stub.copyPlayerInfo.returns({ id: NEW_PLAYER_ID });
            chai.spy.on(game.roundManager, 'replacePlayer', () => {});
            game.replacePlayer(DEFAULT_PLAYER_2_ID, newPlayerStub as unknown as Player);

            expect(newPlayerStub.copyPlayerInfo.calledOnceWith(player2Stub)).to.be.true;
            expect(game.player1).to.equal(player1Stub);
            expect(game.player2).to.equal(newPlayerStub);
        });

        it('should update the player3 if called with its id', () => {
            player3Stub.copyPlayerInfo.returns({ id: NEW_PLAYER_ID });
            chai.spy.on(game.roundManager, 'replacePlayer', () => {});
            game.replacePlayer(DEFAULT_PLAYER_3_ID, newPlayerStub as unknown as Player);

            expect(newPlayerStub.copyPlayerInfo.calledOnceWith(player3Stub)).to.be.true;
            expect(game.player3).to.equal(newPlayerStub);
        });

        it('should update the player4 if called with its id', () => {
            player4Stub.copyPlayerInfo.returns({ id: NEW_PLAYER_ID });
            chai.spy.on(game.roundManager, 'replacePlayer', () => {});
            game.replacePlayer(DEFAULT_PLAYER_4_ID, newPlayerStub as unknown as Player);

            expect(newPlayerStub.copyPlayerInfo.calledOnceWith(player4Stub)).to.be.true;
            expect(game.player4).to.equal(newPlayerStub);
        });

        it('should call roundManager.replacePlayer', () => {
            player2Stub.copyPlayerInfo.returns({ id: NEW_PLAYER_ID });
            const spy = chai.spy.on(game.roundManager, 'replacePlayer', () => {});

            game.replacePlayer(DEFAULT_PLAYER_2_ID, newPlayerStub as unknown as Player);
            expect(spy).to.have.been.called();
        });
    });

    describe('endOfGame', () => {
        let game: Game;
        let roundManagerStub: SinonStubbedInstance<RoundManager>;
        let player1Stub: SinonStubbedInstance<Player>;
        let player2Stub: SinonStubbedInstance<Player>;
        let player3Stub: SinonStubbedInstance<Player>;
        let player4Stub: SinonStubbedInstance<Player>;
        const PLAYER_1_SCORE = 20;
        const PLAYER_2_SCORE = 40;
        const PLAYER_3_SCORE = 60;
        const PLAYER_4_SCORE = 80;
        const PLAYER_1_TILE_SCORE = 6;
        const PLAYER_2_TILE_SCORE = 14;
        const PLAYER_3_TILE_SCORE = 20;
        const PLAYER_4_TILE_SCORE = 24;
        beforeEach(() => {
            game = new Game(DEFAULT_GAME_CHANNEL_ID);
            roundManagerStub = createStubInstance(RoundManager);
            player1Stub = createStubInstance(Player);
            player2Stub = createStubInstance(Player);
            player3Stub = createStubInstance(Player);
            player4Stub = createStubInstance(Player);
            game.roundManager = roundManagerStub as unknown as RoundManager;
            player1Stub.publicUser = USER1;
            player2Stub.publicUser = USER2;
            player3Stub.publicUser = USER3;
            player4Stub.publicUser = USER4;
            player1Stub.id = DEFAULT_PLAYER_1_ID;
            player2Stub.id = DEFAULT_PLAYER_2_ID;
            player3Stub.id = DEFAULT_PLAYER_3_ID;
            player4Stub.id = DEFAULT_PLAYER_4_ID;
            player1Stub.tiles = [{ letter: 'A', value: 2 } as Tile, { letter: 'B', value: 4 } as Tile];
            player2Stub.tiles = [{ letter: 'A', value: 6 } as Tile, { letter: 'B', value: 8 } as Tile];
            player3Stub.tiles = [{ letter: 'A', value: 6 } as Tile, { letter: 'B', value: 8 } as Tile];
            player4Stub.tiles = [{ letter: 'A', value: 6 } as Tile, { letter: 'B', value: 8 } as Tile];
            player1Stub.score = PLAYER_1_SCORE;
            player2Stub.score = PLAYER_2_SCORE;
            player3Stub.score = PLAYER_3_SCORE;
            player4Stub.score = PLAYER_4_SCORE;
            player1Stub.getTileRackPoints.returns(PLAYER_1_TILE_SCORE);
            player2Stub.getTileRackPoints.returns(PLAYER_2_TILE_SCORE);
            player3Stub.getTileRackPoints.returns(PLAYER_3_TILE_SCORE);
            player4Stub.getTileRackPoints.returns(PLAYER_4_TILE_SCORE);

            game.player1 = player1Stub as unknown as Player;
            game.player2 = player2Stub as unknown as Player;
            game.player3 = player3Stub as unknown as Player;
            game.player4 = player4Stub as unknown as Player;

            player1Stub.hasTilesLeft.returns(true);
            player2Stub.hasTilesLeft.returns(true);
            player3Stub.hasTilesLeft.returns(true);
            player4Stub.hasTilesLeft.returns(true);

            chai.spy.on(game, 'completeGameHistory', () => {
                return;
            });
        });

        it('should deduct points from all players if the verifyIfGameOver is true', () => {
            roundManagerStub.verifyIfGameOver.returns(true);
            game.endOfGame();
            expect(game.player1.score).to.equal(PLAYER_1_SCORE - PLAYER_1_TILE_SCORE);
            expect(game.player2.score).to.equal(PLAYER_2_SCORE - PLAYER_2_TILE_SCORE);
            expect(game.player3.score).to.equal(PLAYER_3_SCORE - PLAYER_3_TILE_SCORE);
            expect(game.player4.score).to.equal(PLAYER_4_SCORE - PLAYER_4_TILE_SCORE);
        });

        it('should deduct points from player2,3,4 and add them to player1 if player 1 has no tiles', () => {
            roundManagerStub.verifyIfGameOver.returns(false);
            player1Stub.hasTilesLeft.returns(false);
            player2Stub.hasTilesLeft.returns(true);
            player3Stub.hasTilesLeft.returns(true);
            player4Stub.hasTilesLeft.returns(true);

            game.endOfGame();

            expect(game.player1.score).to.equal(PLAYER_1_SCORE + PLAYER_2_TILE_SCORE + PLAYER_3_TILE_SCORE + PLAYER_4_TILE_SCORE);
            expect(game.player2.score).to.equal(PLAYER_2_SCORE - PLAYER_2_TILE_SCORE);
            expect(game.player3.score).to.equal(PLAYER_3_SCORE - PLAYER_3_TILE_SCORE);
            expect(game.player4.score).to.equal(PLAYER_4_SCORE - PLAYER_4_TILE_SCORE);
        });

        it('should deduct points from player 1,3,4 and add them to player2 if player 2 has no tiles', () => {
            roundManagerStub.verifyIfGameOver.returns(false);
            player1Stub.hasTilesLeft.returns(true);
            player2Stub.hasTilesLeft.returns(false);
            player3Stub.hasTilesLeft.returns(true);
            player4Stub.hasTilesLeft.returns(true);

            game.endOfGame();

            expect(game.player1.score).to.equal(PLAYER_1_SCORE - PLAYER_1_TILE_SCORE);
            expect(game.player2.score).to.equal(PLAYER_2_SCORE + PLAYER_1_TILE_SCORE + PLAYER_3_TILE_SCORE + PLAYER_4_TILE_SCORE);
            expect(game.player3.score).to.equal(PLAYER_3_SCORE - PLAYER_3_TILE_SCORE);
            expect(game.player4.score).to.equal(PLAYER_4_SCORE - PLAYER_4_TILE_SCORE);
        });
    });

    describe('completeGameHistory', () => {
        let game: Game;
        let roundManagerStub: SinonStubbedInstance<RoundManager>;
        let player1Stub: SinonStubbedInstance<Player>;
        let player2Stub: SinonStubbedInstance<Player>;
        let player3Stub: SinonStubbedInstance<Player>;
        let player4Stub: SinonStubbedInstance<Player>;
        const PLAYER_1_SCORE = 20;
        const PLAYER_2_SCORE = 40;
        const PLAYER_3_SCORE = 60;
        const PLAYER_4_SCORE = 80;
        const PLAYER_1_TILE_SCORE = 6;
        const PLAYER_2_TILE_SCORE = 14;
        const PLAYER_3_TILE_SCORE = 24;
        const PLAYER_4_TILE_SCORE = 14;

        beforeEach(() => {
            game = new Game(DEFAULT_GAME_CHANNEL_ID);
            roundManagerStub = createStubInstance(RoundManager);
            player1Stub = createStubInstance(Player);
            player2Stub = createStubInstance(Player);
            player3Stub = createStubInstance(Player);
            player4Stub = createStubInstance(Player);
            game.roundManager = roundManagerStub as unknown as RoundManager;
            player1Stub.publicUser = USER1;
            player2Stub.publicUser = USER2;
            player3Stub.publicUser = USER3;
            player4Stub.publicUser = USER4;
            player1Stub.id = DEFAULT_PLAYER_1_ID;
            player2Stub.id = DEFAULT_PLAYER_2_ID;
            player3Stub.id = DEFAULT_PLAYER_3_ID;
            player4Stub.id = DEFAULT_PLAYER_4_ID;
            game.player1 = player1Stub as unknown as Player;
            game.player2 = player2Stub as unknown as Player;
            game.player3 = player3Stub as unknown as Player;
            game.player4 = player4Stub as unknown as Player;

            game.player1.tiles = [
                { letter: 'A', value: 2 },
                { letter: 'B', value: 4 },
            ];
            game.player2.tiles = [
                { letter: 'A', value: 6 },
                { letter: 'B', value: 8 },
            ];
            game.player3.tiles = [
                { letter: 'A', value: 6 },
                { letter: 'B', value: 8 },
            ];
            game.player4.tiles = [
                { letter: 'A', value: 6 },
                { letter: 'B', value: 8 },
            ];
            game.player1.score = PLAYER_1_SCORE;
            game.player2.score = PLAYER_2_SCORE;
            game.player3.score = PLAYER_3_SCORE;
            game.player4.score = PLAYER_4_SCORE;
            game.player1.isConnected = true;
            game.player2.isConnected = true;
            game.player3.isConnected = true;
            game.player4.isConnected = true;
            player1Stub.getTileRackPoints.returns(PLAYER_1_TILE_SCORE);
            player2Stub.getTileRackPoints.returns(PLAYER_2_TILE_SCORE);
            player3Stub.getTileRackPoints.returns(PLAYER_3_TILE_SCORE);
            player4Stub.getTileRackPoints.returns(PLAYER_4_TILE_SCORE);
        });

        describe('isPlayerWinner', () => {
            it('should set player1Data.isWinner to true if winnerName is not player 1 but player1 has highest score', () => {
                game.player1.score = 200;
                game.player2.score = 90;
                game.player3.score = 90;
                game.player4.score = 90;
                expect(game.isPlayerWinner(game.player1)).to.be.true;
            });

            it('should set player1Data.isWinner to false if winnerName is not player 1 and player1 does not have highest score', () => {
                game.player1.score = 200;
                game.player2.score = 900;
                game.player3.score = 90;
                game.player4.score = 90;
                expect(game.isPlayerWinner(game.player1)).to.be.false;
            });

            it('should set player2Data.isWinner to true if winnerName is not player 1 but player1 has highest score', () => {
                game.player1.score = 200;
                game.player2.score = 900;
                game.player3.score = 90;
                game.player4.score = 90;
                expect(game.isPlayerWinner(game.player2)).to.be.true;
            });

            it('should set player2Data.isWinner to false if winnerName is not player 1 and player2 does not have highest score', () => {
                game.player1.score = 200;
                game.player2.score = 100;
                game.player3.score = 90;
                game.player4.score = 90;
                expect(game.isPlayerWinner(game.player2)).to.be.false;
            });

            it('should set both playerData.isWinner to true if winnerName is undefined and players have equal scores', () => {
                game.player1.score = 200;
                game.player2.score = 900;
                game.player3.score = 900;
                game.player4.score = 90;
                expect(game.isPlayerWinner(game.player2)).to.be.true;
                expect(game.isPlayerWinner(game.player3)).to.be.true;
                game.completeGameHistory();
                expect(game.gameHistory.players[0].isWinner).to.be.false;
                expect(game.gameHistory.players[1].isWinner).to.be.true;
                expect(game.gameHistory.players[2].isWinner).to.be.true;
                expect(game.gameHistory.players[3].isWinner).to.be.false;
            });
        });
    });

    describe('endGameMessage', () => {
        let game: Game;
        let player1Stub: SinonStubbedInstance<Player>;
        let player2Stub: SinonStubbedInstance<Player>;
        let player3Stub: SinonStubbedInstance<Player>;
        let player4Stub: SinonStubbedInstance<Player>;

        let computeWinnersSpy: SinonStub<any[], any>;

        const PLAYER_1_END_GAME_MESSAGE = 'player1 : ABC';
        const PLAYER_2_END_GAME_MESSAGE = 'player2 : SOS';
        const PLAYER_3_END_GAME_MESSAGE = 'player3 : SAAOS';
        const PLAYER_4_END_GAME_MESSAGE = 'player4 : SZZOS';

        beforeEach(() => {
            game = new Game(DEFAULT_GAME_CHANNEL_ID);
            player1Stub = createStubInstance(Player);
            player2Stub = createStubInstance(Player);
            player3Stub = createStubInstance(Player);
            player4Stub = createStubInstance(Player);
            player1Stub.publicUser = USER1;
            player2Stub.publicUser = USER2;
            player3Stub.publicUser = USER3;
            player4Stub.publicUser = USER4;
            game.player1 = player1Stub as unknown as Player;
            game.player2 = player2Stub as unknown as Player;
            game.player3 = player3Stub as unknown as Player;
            game.player4 = player4Stub as unknown as Player;
            player1Stub.endGameMessage.returns(PLAYER_1_END_GAME_MESSAGE);
            player2Stub.endGameMessage.returns(PLAYER_2_END_GAME_MESSAGE);
            player3Stub.endGameMessage.returns(PLAYER_3_END_GAME_MESSAGE);
            player4Stub.endGameMessage.returns(PLAYER_4_END_GAME_MESSAGE);
            computeWinnersSpy = stub(game, <any>'computeWinners').returns([player1Stub.publicUser.username]);
        });

        it('should call the messages', () => {
            game.endGameMessage();
            assert(player1Stub.endGameMessage.calledOnce);
            assert(player2Stub.endGameMessage.calledOnce);
            assert(player3Stub.endGameMessage.calledOnce);
            assert(player4Stub.endGameMessage.calledOnce);
        });

        it('should call computeWinners if winnerName is undefined', () => {
            game.endGameMessage();
            assert(computeWinnersSpy.calledOnce);
        });
    });

    describe('computeWinners', () => {
        let game: Game;
        let player1Stub: SinonStubbedInstance<Player>;
        let player2Stub: SinonStubbedInstance<Player>;
        let player3Stub: SinonStubbedInstance<Player>;
        let player4Stub: SinonStubbedInstance<Player>;

        const HIGHER_SCORE = 100;
        const LOWER_SCORE = 1;

        beforeEach(() => {
            game = new Game(DEFAULT_GAME_CHANNEL_ID);
            player1Stub = createStubInstance(Player);
            player2Stub = createStubInstance(Player);
            player3Stub = createStubInstance(Player);
            player4Stub = createStubInstance(Player);
            player1Stub.publicUser = USER1;
            player2Stub.publicUser = USER2;
            player3Stub.publicUser = USER3;
            player4Stub.publicUser = USER4;
            player1Stub.id = DEFAULT_PLAYER_1_ID;
            player2Stub.id = DEFAULT_PLAYER_2_ID;
            player3Stub.id = DEFAULT_PLAYER_3_ID;
            player4Stub.id = DEFAULT_PLAYER_4_ID;
            player1Stub.isConnected = true;
            player2Stub.isConnected = true;
            player3Stub.isConnected = true;
            player4Stub.isConnected = true;
            game.player1 = player1Stub as unknown as Player;
            game.player2 = player2Stub as unknown as Player;
            game.player3 = player3Stub as unknown as Player;
            game.player4 = player4Stub as unknown as Player;
        });

        it('should return player 1 name if he has a higher score ', () => {
            player1Stub.score = HIGHER_SCORE;
            player2Stub.score = LOWER_SCORE;
            player3Stub.score = LOWER_SCORE;
            player4Stub.score = LOWER_SCORE;
            const expected = [USER1.username];
            expect(game['computeWinners']()).to.deep.equal(expected);
        });
        it('should congratulate player 2 if he has a higher score ', () => {
            player1Stub.score = LOWER_SCORE;
            player2Stub.score = HIGHER_SCORE;
            player3Stub.score = LOWER_SCORE;
            player4Stub.score = LOWER_SCORE;
            const expected = [USER2.username];
            expect(game['computeWinners']()).to.deep.equal(expected);
        });
        it('should congratulate player 1 and player 2 if they are tied ', () => {
            player1Stub.score = HIGHER_SCORE;
            player2Stub.score = HIGHER_SCORE;
            player3Stub.score = LOWER_SCORE;
            player4Stub.score = LOWER_SCORE;
            const expected = [USER1.username, USER2.username];
            expect(game['computeWinners']()).to.deep.equal(expected);
        });
    });

    describe('Game Service Injection', () => {
        afterEach(() => {
            chai.spy.restore();
        });

        it('injectServices should set static Game BoardService if it does not exist', () => {
            Game['boardService'] = undefined as unknown as BoardService;

            Game.injectServices();
            expect(Game['boardService']).to.equal(Container.get(BoardService));
        });

        it('injectServices should set static Game ObjectivesService if it does not exist', () => {
            Game['objectivesService'] = undefined as unknown as ObjectivesService;

            Game.injectServices();
            expect(Game['objectivesService']).to.equal(Container.get(ObjectivesService));
        });

        it('injectServices should NOT set BoardService and ObjectivesService if they exist', () => {
            Game['boardService'] = Container.get(BoardService);
            Game['objectivesService'] = Container.get(ObjectivesService);
            const getSpy = chai.spy.on(Container, 'get');

            Game.injectServices();
            expect(getSpy).not.to.have.been.called();
        });
    });

    describe('createStartGameData', () => {
        const PLAYER_1_ID = 'player1Id';
        const PLAYER_2_ID = 'player2Id';
        const PLAYER_3_ID = 'player3Id';
        const PLAYER_4_ID = 'player4Id';
        const PLAYER_1 = new Player(PLAYER_1_ID, USER1);
        const PLAYER_2 = new Player(PLAYER_2_ID, USER2);
        const PLAYER_3 = new Player(PLAYER_3_ID, USER3);
        const PLAYER_4 = new Player(PLAYER_4_ID, USER4);
        const DEFAULT_TIME = 60;
        DEFAULT_MAP = new Map<LetterValue, number>([
            ['A', 1],
            ['B', 2],
            ['C', 2],
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            ['F', 8],
        ]);
        const TILE_RESERVE_DATA: TileReserveData[] = [
            { letter: 'A', amount: 1 },
            { letter: 'B', amount: 2 },
            { letter: 'C', amount: 2 },
            { letter: 'F', amount: 8 },
        ];
        let roundManagerStub: SinonStubbedInstance<RoundManager>;
        let board: Board;
        let round: Round;
        let game: Game;

        beforeEach(() => {
            game = new Game(DEFAULT_GAME_CHANNEL_ID);
            board = new Board([[]]);
            roundManagerStub = createStubInstance(RoundManager);
            roundManagerStub.getMaxRoundTime.returns(DEFAULT_TIME);
            game.player1 = PLAYER_1;
            game.player2 = PLAYER_2;
            game.player3 = PLAYER_3;
            game.player4 = PLAYER_4;
            chai.spy.on(game, 'getTilesLeftPerLetter', () => DEFAULT_MAP);
            game.dictionarySummary = TEST_DICTIONARY;
            chai.spy.on(game, 'getId', () => DEFAULT_GAME_ID);
            game.board = board;
            chai.spy.on(game.board, ['isWithinBounds'], () => true);
            game.roundManager = roundManagerStub as unknown as RoundManager;

            round = { player: game.player1, startTime: new Date(), limitTime: new Date(), tiles: [], board: {} as unknown as Board };
            roundManagerStub.getCurrentRound.returns(round);
        });

        it('should return the expected StartMultiplayerGameData', () => {
            const result = game['createStartGameData']();
            const expectedMultiplayerGameData: StartGameData = {
                player1: game.player1.convertToPlayerData(),
                player2: game.player2.convertToPlayerData(),
                player3: game.player3.convertToPlayerData(),
                player4: game.player4.convertToPlayerData(),
                maxRoundTime: DEFAULT_TIME,
                gameId: DEFAULT_GAME_ID,
                board: game.board.grid,
                tileReserve: TILE_RESERVE_DATA,
                round: roundManagerStub.convertRoundToRoundData(round),
            };
            expect(result).to.deep.equal(expectedMultiplayerGameData);
        });
    });

    describe('getPlayerNumber', () => {
        let game: Game;
        const invalidPlayer = new Player('invalid', { username: 'invalid', email: '', avatar: '' });
        beforeEach(() => {
            game = new Game(DEFAULT_GAME_CHANNEL_ID);
            game.player1 = DEFAULT_PLAYER_1;
            game.player2 = DEFAULT_PLAYER_2;
            game.player3 = DEFAULT_PLAYER_3;
            game.player4 = DEFAULT_PLAYER_4;
        });

        it('should return the correct number', () => {
            expect(game.getPlayerNumber(game.player1)).to.equal(1);
            expect(game.getPlayerNumber(game.player2)).to.equal(2);
            expect(game.getPlayerNumber(game.player3)).to.equal(3);
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            expect(game.getPlayerNumber(game.player4)).to.equal(4);
        });

        it('should throw if given an invalid player', () => {
            expect(() => game.getPlayerNumber(invalidPlayer)).to.throw(INVALID_PLAYER_ID_FOR_GAME);
        });
    });

    describe('getGroupChannelId', () => {
        let game: Game;
        beforeEach(() => {
            game = new Game(DEFAULT_GAME_CHANNEL_ID);
        });

        it('should return the correct number', () => {
            expect(game.getGroupChannelId()).to.equal(DEFAULT_GAME_CHANNEL_ID);
        });
    });
});
