/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { ActionUtils } from '@app/classes/actions/action-utils/action-utils';
import Game from '@app/classes/game/game';
import Player from '@app/classes/player/player';
import { Tile } from '@app/classes/tile';
import { UNKOWN_USER } from '@common/models/user';
import * as chai from 'chai';
import { spy } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import { assert } from 'console';
import * as sinon from 'sinon';
import { createStubInstance, SinonStub, SinonStubbedInstance, stub } from 'sinon';
import ActionExchange from './action-exchange';

const expect = chai.expect;

chai.use(spies);
chai.use(chaiAsPromised);

const DEFAULT_PLAYER_1_ID = '1';
const PLAYER_TILES: Tile[] = [
    { letter: 'A', value: 0 },
    { letter: 'B', value: 0 },
    { letter: 'C', value: 0 },
];
const TILES_TO_EXCHANGE = [PLAYER_TILES[1]];
const TILES_NOT_TO_EXCHANGE = [PLAYER_TILES[0], PLAYER_TILES[2]];
const TEST_TILES: Tile[] = [];

describe('ActionExchange', () => {
    let gameStub: SinonStubbedInstance<Game>;
    let game: Game;
    let getTilesFromPlayerStub: SinonStub;

    beforeEach(() => {
        gameStub = createStubInstance(Game);
        gameStub.swapTilesFromReserve.returns(PLAYER_TILES);
        getTilesFromPlayerStub = stub(ActionUtils, 'getTilesFromPlayer');

        gameStub.player1 = new Player(DEFAULT_PLAYER_1_ID, UNKOWN_USER);
        gameStub.player1.tiles = PLAYER_TILES.map((t) => ({ ...t }));

        game = gameStub as unknown as Game;
    });

    afterEach(() => {
        getTilesFromPlayerStub.restore();
        chai.spy.restore();
        sinon.restore();
    });

    describe('static calls', () => {
        it('should call createActionPlacePayload', () => {
            const actionExchangeSpy = spy.on(ActionExchange, 'createActionExchangePayload', () => {
                return;
            });
            ActionExchange.createActionData(TEST_TILES);
            expect(actionExchangeSpy).to.have.been.called();
        });

        it('should return payload', () => {
            const payload = { tiles: TEST_TILES };
            expect(ActionExchange.createActionExchangePayload(TEST_TILES)).to.deep.equal(payload);
        });
    });

    describe('execute', () => {
        it('should call getTilesFromPlayer', () => {
            getTilesFromPlayerStub.returns([game.player1.tiles, []]);

            gameStub.getPlayerNumber.returns(1);
            const action = new ActionExchange(game.player1, game, []);
            action.execute();

            expect(getTilesFromPlayerStub.called).to.be.true;
        });

        it('should call swapTiles', () => {
            getTilesFromPlayerStub.returns([game.player1.tiles, []]);
            gameStub.getPlayerNumber.returns(1);

            const action = new ActionExchange(game.player1, game, []);
            action.execute();

            expect(gameStub.swapTilesFromReserve.called).to.be.true;
        });

        it('should return a player with tiles', () => {
            const tilesToReceive: Tile[] = [{ letter: 'Z', value: 0 }];

            getTilesFromPlayerStub.returns([TILES_TO_EXCHANGE, TILES_NOT_TO_EXCHANGE]);
            gameStub.swapTilesFromReserve.returns(tilesToReceive);

            gameStub.getPlayerNumber.returns(1);

            const action = new ActionExchange(game.player1, game, []);
            const result = action.execute();

            expect(result.player1).to.exist;
            expect(result.player1!.tiles).to.exist;
        });

        it('should return a player with tiles (player 2)', () => {
            const tilesToReceive: Tile[] = [{ letter: 'Z', value: 0 }];

            getTilesFromPlayerStub.returns([TILES_TO_EXCHANGE, TILES_NOT_TO_EXCHANGE]);
            gameStub.swapTilesFromReserve.returns(tilesToReceive);

            gameStub.getPlayerNumber.returns(2);

            const action = new ActionExchange(game.player1, game, []);
            const result = action.execute();

            expect(result.player2).to.exist;
            expect(result.player2!.tiles).to.exist;
        });

        it('should return a player with tiles (player 3)', () => {
            const tilesToReceive: Tile[] = [{ letter: 'Z', value: 0 }];

            getTilesFromPlayerStub.returns([TILES_TO_EXCHANGE, TILES_NOT_TO_EXCHANGE]);
            gameStub.swapTilesFromReserve.returns(tilesToReceive);

            gameStub.getPlayerNumber.returns(3);

            const action = new ActionExchange(game.player1, game, []);
            const result = action.execute();

            expect(result.player3).to.exist;
            expect(result.player3!.tiles).to.exist;
        });

        it('should return a player with tiles (player 4)', () => {
            const tilesToReceive: Tile[] = [{ letter: 'Z', value: 0 }];

            getTilesFromPlayerStub.returns([TILES_TO_EXCHANGE, TILES_NOT_TO_EXCHANGE]);
            gameStub.swapTilesFromReserve.returns(tilesToReceive);

            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            gameStub.getPlayerNumber.returns(4);

            const action = new ActionExchange(game.player1, game, []);
            const result = action.execute();

            expect(result.player4).to.exist;
            expect(result.player4!.tiles).to.exist;
        });

        it('should return a player with same amount as before', () => {
            const tilesToReceive: Tile[] = [{ letter: 'Z', value: 0 }];
            const initialTilesAmount = game.player1.tiles.length;

            getTilesFromPlayerStub.returns([TILES_TO_EXCHANGE, TILES_NOT_TO_EXCHANGE]);
            gameStub.swapTilesFromReserve.returns(tilesToReceive);

            gameStub.getPlayerNumber.returns(1);

            const action = new ActionExchange(game.player1, game, []);
            const result = action.execute();

            expect(result.player1!.tiles!.length).to.equal(initialTilesAmount);
        });

        it('should return a player with not exchanged tiles', () => {
            const tilesToReceive: Tile[] = [{ letter: 'Z', value: 0 }];

            getTilesFromPlayerStub.returns([TILES_TO_EXCHANGE, TILES_NOT_TO_EXCHANGE]);
            gameStub.swapTilesFromReserve.returns(tilesToReceive);

            gameStub.getPlayerNumber.returns(1);

            const action = new ActionExchange(game.player1, game, []);
            const result = action.execute();

            expect(
                TILES_NOT_TO_EXCHANGE.every((t) =>
                    result.player1!.tiles!.some((t2) => {
                        return t.letter === t2.letter && t.value === t2.value;
                    }),
                ),
            ).to.be.true;
        });

        it('should return a player with new tiles', () => {
            const tilesToReceive: Tile[] = [{ letter: 'Z', value: 0 }];

            getTilesFromPlayerStub.returns([TILES_TO_EXCHANGE, TILES_NOT_TO_EXCHANGE]);
            gameStub.swapTilesFromReserve.returns(tilesToReceive);

            gameStub.getPlayerNumber.returns(1);

            const action = new ActionExchange(game.player1, game, []);
            const result = action.execute();

            expect(tilesToReceive.every((t) => result.player1!.tiles!.some((t2) => t.letter === t2.letter && t.value === t2.value))).to.be.true;
        });
    });

    describe('getMessage', () => {
        let action: ActionExchange;

        it('should return message', () => {
            action = new ActionExchange(game.player1, game, PLAYER_TILES);

            expect(action.getMessage().message).to.equal('Vous avez échangé les tuiles ABC');
        });

        it('should return message', () => {
            action = new ActionExchange(game.player1, game, [PLAYER_TILES[0]]);
            expect(action.getMessage().message).to.equal('Vous avez échangé la tuile A');
        });

        it('should call lettersToSwap', () => {
            action = new ActionExchange(game.player1, game, [PLAYER_TILES[0]]);
            const stubLettersToSwap = stub(action, <any>'lettersToSwap').returns('a');
            assert(stubLettersToSwap.calledOnce);
        });

        it("should have 'les tuiles' if more than one tiles to exchange", () => {
            action['tilesToExchange'] = PLAYER_TILES;
            expect(action.getMessage().message).to.include('les tuiles');
        });

        it("should have 'la tuile' if one tile to exchange", () => {
            action['tilesToExchange'] = [PLAYER_TILES[0]];
            expect(action.getMessage().message).to.include('la tuile');
        });
    });

    describe('getOpponentMessage', () => {
        let action: ActionExchange;

        beforeEach(() => {
            action = new ActionExchange(game.player1, game, []);
        });

        it('should return message', () => {
            expect(action.getOpponentMessage().message).to.exist;
        });

        it('should be different from getMessage', () => {
            expect(action.getOpponentMessage().message).to.not.equal(action.getMessage());
        });

        it("should have 'tuile' plural if more than one tiles to exchange", () => {
            action['tilesToExchange'] = PLAYER_TILES;
            expect(action.getOpponentMessage().message).to.include(`${PLAYER_TILES.length} tuiles`);
        });

        it("should have 'tuile' singular if one tile to exchange", () => {
            action['tilesToExchange'] = [PLAYER_TILES[0]];
            expect(action.getOpponentMessage().message).to.include('1 tuile');
        });
    });
});
