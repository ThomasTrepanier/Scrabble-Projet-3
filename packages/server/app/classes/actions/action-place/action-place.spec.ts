/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { ActionUtils } from '@app/classes/actions/action-utils/action-utils';
import { Board, Orientation, Position } from '@app/classes/board';
import { ActionPlacePayload } from '@app/classes/communication/action-data';
import { DictionarySummary } from '@app/classes/communication/dictionary-data';
import { GameUpdateData } from '@app/classes/communication/game-update-data';
import { PlayerData } from '@app/classes/communication/player-data';
import Game from '@app/classes/game/game';
import Player from '@app/classes/player/player';
import { Square } from '@app/classes/square';
import { Tile, TileReserve } from '@app/classes/tile';
import { WordExtraction } from '@app/classes/word-extraction/word-extraction';
import { WordPlacement } from '@app/classes/word-finding';
import { TEST_ORIENTATION, TEST_SCORE, TEST_START_POSITION } from '@app/constants/virtual-player-tests-constants';
import { ScoreCalculatorService } from '@app/services/score-calculator-service/score-calculator.service';
import { ServicesTestingUnit } from '@app/services/service-testing-unit/services-testing-unit.spec';
import { WordsVerificationService } from '@app/services/words-verification-service/words-verification.service';
import { StringConversion } from '@app/utils/string-conversion/string-conversion';
import * as chai from 'chai';
import { assert, spy } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import * as sinon from 'sinon';
import { createStubInstance, SinonStub, SinonStubbedInstance, stub } from 'sinon';
import { ActionPlace } from '..';
import { IMPOSSIBLE_ACTION } from './action-errors';

const expect = chai.expect;

chai.use(spies);
chai.use(chaiAsPromised);

const USER1 = { username: 'user1', email: 'email1', avatar: 'avatar1' };
const USER2 = { username: 'user2', email: 'email2', avatar: 'avatar2' };
const DEFAULT_PLAYER_1 = new Player('player-1', USER1);
const DEFAULT_PLAYER_2 = new Player('player-2', USER2);
const INITIAL_SCORE = DEFAULT_PLAYER_1.score;
const TILES_PLAYER_1: Tile[] = [
    { letter: 'A', value: 1 },
    { letter: 'A', value: 1 },
    { letter: 'C', value: 1 },
    { letter: '*', value: 0 },
];
const VALID_TILES_TO_PLACE: Tile[] = [
    { letter: 'A', value: 1 },
    { letter: 'F', value: 0 },
    { letter: 'C', value: 1 },
];

const DEFAULT_ORIENTATION = Orientation.Horizontal;
const CENTER = 7;
const DEFAULT_POSITION: Position = new Position(CENTER, CENTER);

const DEFAULT_TILE_A: Tile = { letter: 'A', value: 1 };
const DEFAULT_TILE_B: Tile = { letter: 'B', value: 3 };
const DEFAULT_SQUARE_1: Square = { tile: null, position: new Position(0, 0), scoreMultiplier: null, wasMultiplierUsed: false, isCenter: false };
const DEFAULT_SQUARE_2: Square = { tile: null, position: new Position(0, 1), scoreMultiplier: null, wasMultiplierUsed: false, isCenter: false };
const DEFAULT_SQUARE_CENTER: Square = { tile: null, position: new Position(0, 1), scoreMultiplier: null, wasMultiplierUsed: false, isCenter: true };

const EXTRACT_RETURN: [Square, Tile][][] = [
    [
        [{ ...DEFAULT_SQUARE_1 }, { ...DEFAULT_TILE_A }],
        [{ ...DEFAULT_SQUARE_2 }, { ...DEFAULT_TILE_B }],
    ],
];
const EXTRACT_RETURN_LETTERS = 2;

const EXTRACT_CENTER: [Square, Tile][][] = [
    [
        [{ ...DEFAULT_SQUARE_CENTER }, { ...DEFAULT_TILE_A }],
        [{ ...DEFAULT_SQUARE_2 }, { ...DEFAULT_TILE_B }],
    ],
];
const SCORE_RETURN = 132;
const UPDATE_BOARD_RETURN: (Square | undefined)[] = [
    { ...DEFAULT_SQUARE_1, tile: DEFAULT_TILE_A },
    { ...DEFAULT_SQUARE_2, tile: DEFAULT_TILE_B },
];
const GET_TILES_RETURN: Tile[] = [
    { letter: 'Y', value: 10 },
    { letter: 'Z', value: 10 },
];
const BOARD: Square[][] = [
    [
        { ...DEFAULT_SQUARE_1, position: new Position(0, 0) },
        { ...DEFAULT_SQUARE_1, position: new Position(0, 1) },
    ],
    [
        { ...DEFAULT_SQUARE_1, position: new Position(1, 0) },
        { ...DEFAULT_SQUARE_1, position: new Position(1, 1) },
    ],
];
const testEvaluatedPlacement = {
    tilesToPlace: [],
    orientation: TEST_ORIENTATION,
    startPosition: TEST_START_POSITION,
    score: TEST_SCORE,
};

const VALID_PLACEMENT: WordPlacement = {
    tilesToPlace: VALID_TILES_TO_PLACE,
    startPosition: DEFAULT_POSITION,
    orientation: DEFAULT_ORIENTATION,
};

describe('ActionPlace', () => {
    let gameStub: SinonStubbedInstance<Game>;
    let tileReserveStub: SinonStubbedInstance<TileReserve>;
    let boardStub: SinonStubbedInstance<Board>;
    let wordValidatorStub: SinonStubbedInstance<WordsVerificationService>;
    let scoreCalculatorServiceStub: SinonStubbedInstance<ScoreCalculatorService>;
    let game: Game;
    let testingUnit: ServicesTestingUnit;

    beforeEach(() => {
        testingUnit = new ServicesTestingUnit();

        wordValidatorStub = testingUnit.setStubbed(WordsVerificationService, {
            verifyWords: undefined,
        });
        scoreCalculatorServiceStub = testingUnit.setStubbed(ScoreCalculatorService, {
            calculatePoints: SCORE_RETURN,
            bonusPoints: 0,
        });
    });

    beforeEach(() => {
        gameStub = createStubInstance(Game);
        tileReserveStub = createStubInstance(TileReserve);
        boardStub = createStubInstance(Board);

        gameStub.player1 = new Player(DEFAULT_PLAYER_1.id, DEFAULT_PLAYER_1.publicUser);
        gameStub.player2 = new Player(DEFAULT_PLAYER_2.id, DEFAULT_PLAYER_2.publicUser);
        gameStub.player1.tiles = TILES_PLAYER_1.map((t) => ({ ...t }));
        gameStub.player2.tiles = TILES_PLAYER_1.map((t) => ({ ...t }));
        gameStub.getPlayerNumber.returns(1);
        boardStub.grid = BOARD.map((row) => row.map((s) => ({ ...s })));
        gameStub.dictionarySummary = { id: 'id' } as unknown as DictionarySummary;

        // eslint-disable-next-line dot-notation
        gameStub['tileReserve'] = tileReserveStub as unknown as TileReserve;

        gameStub.board = boardStub as unknown as Board;

        game = gameStub as unknown as Game;
    });

    afterEach(() => {
        chai.spy.restore();
        sinon.restore();
        testingUnit.restore();
    });

    it('should create', () => {
        const action = new ActionPlace(game.player1, game, VALID_PLACEMENT);
        expect(action).to.exist;
    });

    it('should call createActionPlacePayload', () => {
        const actionPayloadSpy = spy.on(ActionPlace, 'createActionPlacePayload', () => {
            return testEvaluatedPlacement;
        });
        ActionPlace.createActionData(testEvaluatedPlacement);
        expect(actionPayloadSpy).to.have.been.called();
    });

    it('should return payload', () => {
        const payload: ActionPlacePayload = {
            tiles: testEvaluatedPlacement.tilesToPlace,
            orientation: testEvaluatedPlacement.orientation,
            startPosition: testEvaluatedPlacement.startPosition,
        };
        expect(ActionPlace['createActionPlacePayload'](testEvaluatedPlacement)).to.deep.equal(payload);
    });

    describe('execute', () => {
        describe('valid word', () => {
            let action: ActionPlace;
            let getTilesFromPlayerSpy: unknown;
            let wordExtractSpy: unknown;
            let updateBoardSpy: unknown;

            let isLegalPlacementStub: SinonStub<[words: [Square, Tile][][]], boolean>;
            let wordsToStringSpy: unknown;

            let updateObjectiveStub: SinonStub;

            beforeEach(() => {
                action = new ActionPlace(game.player1, game, VALID_PLACEMENT);
                getTilesFromPlayerSpy = chai.spy.on(ActionUtils, 'getTilesFromPlayer', () => [[...VALID_TILES_TO_PLACE], []]);

                gameStub.getTilesFromReserve.returns(GET_TILES_RETURN);

                updateBoardSpy = chai.spy.on(ActionPlace.prototype, 'updateBoard', () => UPDATE_BOARD_RETURN);
                isLegalPlacementStub = stub(ActionPlace.prototype, <any>'isLegalPlacement').returns(true) as SinonStub<
                    [words: [Square, Tile][][]],
                    boolean
                >;
                wordExtractSpy = chai.spy.on(WordExtraction.prototype, 'extract', () => [...EXTRACT_RETURN]);
                wordsToStringSpy = chai.spy.on(StringConversion, 'wordsToString', () => []);

                updateObjectiveStub = stub(game.player1, 'validateObjectives').returns({ updateData: {}, completionMessages: [] });
            });

            afterEach(() => {
                chai.spy.restore();
                isLegalPlacementStub.restore();
                updateObjectiveStub.restore();
            });

            it('should call getTilesFromPlayer', () => {
                action.execute();
                expect(getTilesFromPlayerSpy).to.have.been.called();
            });

            it('should call word extraction', () => {
                action.execute();
                expect(wordExtractSpy).to.have.been.called();
            });

            it('should call word validator', () => {
                action.execute();
                assert(wordValidatorStub.verifyWords.calledOnce);
            });

            it('should call score computer and set this.scoredPoints', () => {
                action.execute();
                assert(scoreCalculatorServiceStub.calculatePoints.calledOnce);
                expect(action['scoredPoints']).to.equal(SCORE_RETURN);
            });

            it('should call board update', () => {
                action.execute();
                expect(updateBoardSpy).to.have.been.called();
            });

            it('should call get tiles', () => {
                action.execute();
                assert(gameStub.getTilesFromReserve.calledOnce);
            });

            it('should call bonusPoints', () => {
                action.execute();
                assert(scoreCalculatorServiceStub.bonusPoints.calledOnce);
            });

            it('should call wordsToString', () => {
                action.execute();
                expect(wordsToStringSpy).to.have.been.called();
            });

            it('should call isLegalPlacement', () => {
                action.execute();
                assert(isLegalPlacementStub.calledOnce);
            });

            it('should throw if isLegalPlacement returns false', () => {
                isLegalPlacementStub.restore();
                isLegalPlacementStub = stub(ActionPlace.prototype, <any>'isLegalPlacement').returns(false) as SinonStub<
                    [words: [Square, Tile][][]],
                    boolean
                >;
                const result = () => action.execute();
                expect(result).to.throw(IMPOSSIBLE_ACTION);
            });

            it('should return update', () => {
                const update = action.execute();
                expect(update).to.exist;
            });

            it('should return update with player', () => {
                const update: GameUpdateData = action.execute()!;
                expect(update.player1).to.exist;
            });

            it('should return update with board', () => {
                const update: GameUpdateData = action.execute()!;
                expect(update.board).to.exist;
            });

            it('should return update with updated score', () => {
                const update: GameUpdateData = action.execute()!;
                const player: PlayerData = update.player1!;
                expect(player.score).to.equal(INITIAL_SCORE + SCORE_RETURN);
            });

            it('should return update with player 2', () => {
                gameStub.getPlayerNumber.returns(2);
                const update: GameUpdateData = action.execute()!;
                expect(update.player2).to.exist;
            });

            it('should return update with player 3', () => {
                gameStub.getPlayerNumber.returns(3);
                const update: GameUpdateData = action.execute()!;
                expect(update.player3).to.exist;
            });

            it('should return update with player 4', () => {
                gameStub.getPlayerNumber.returns(4);
                const update: GameUpdateData = action.execute()!;
                expect(update.player4).to.exist;
            });

            it('should execute with a blank tile', () => {
                const userTiles: Tile[] = [
                    { letter: 'A', value: 1 },
                    { letter: 'B', value: 1 },
                    { letter: '*', value: 0 },
                ];
                const playTiles: Tile[] = [
                    { letter: 'A', value: 1 },
                    { letter: 'B', value: 1 },
                    { letter: 'C', value: 0, isBlank: true },
                ];
                const returnTiles: Tile[] = [
                    { letter: 'D', value: 1 },
                    { letter: 'E', value: 1 },
                    { letter: 'F', value: 1 },
                ];
                scoreCalculatorServiceStub.calculatePoints.callThrough();
                game.player1.tiles = userTiles;
                gameStub.getTilesFromReserve.returns(returnTiles);

                action = new ActionPlace(game.player1, game, {
                    tilesToPlace: playTiles,
                    startPosition: DEFAULT_POSITION,
                    orientation: DEFAULT_ORIENTATION,
                });
                action.execute();

                for (const tile of userTiles) {
                    expect(game.player1.tiles).to.not.include(tile);
                }
                for (const tile of returnTiles) {
                    expect(game.player1.tiles).to.include(tile);
                }
            });
        });
    });

    describe('updateBoard', () => {
        it('should return array with changed tiles', () => {
            const action = new ActionPlace(game.player1, game, {
                tilesToPlace: VALID_TILES_TO_PLACE,
                startPosition: DEFAULT_POSITION,
                orientation: DEFAULT_ORIENTATION,
            });
            const result = action['updateBoard'](EXTRACT_RETURN);

            for (const changes of EXTRACT_RETURN) {
                for (const [square, tile] of changes) {
                    const { row, column } = square.position;
                    const resultSquare: Square = result.filter((s: Square) => s.position.row === row && s.position.column === column)[0];
                    expect(resultSquare).to.exist;
                    expect(resultSquare!.tile).to.exist;
                    expect(resultSquare.wasMultiplierUsed).to.be.true;
                    expect(resultSquare!.tile!.letter).to.equal(tile.letter);
                    expect(resultSquare!.tile!.value).to.equal(tile.value);
                }
            }
        });

        it('should return an empty array if all the square are already filled', () => {
            const action = new ActionPlace(game.player1, game, VALID_PLACEMENT);
            const copiedExtractReturn: [Square, Tile][][] = EXTRACT_RETURN.map((row) => row.map(([square, tile]) => [{ ...square }, { ...tile }]));
            copiedExtractReturn.forEach((row) => row.forEach(([square, tile]) => (square.tile = tile)));
            const result = action['updateBoard'](EXTRACT_RETURN);

            expect(result).to.be.empty;
        });
    });

    describe('getMessage', () => {
        let action: ActionPlace;

        beforeEach(() => {
            action = new ActionPlace(game.player1, game, {
                tilesToPlace: VALID_TILES_TO_PLACE,
                startPosition: DEFAULT_POSITION,
                orientation: DEFAULT_ORIENTATION,
            });
        });

        it('should return simple place message if no objectives were completed', () => {
            const lineSkip = '<br>';
            action['objectivesCompletedMessages'] = [];
            expect(action.getMessage().message?.includes(lineSkip)).to.be.false;
        });

        it('should return place message with completed objectives if they exist', () => {
            action['objectivesCompletedMessages'] = ['test'];
            expect(action.getMessage().message?.includes('test')).to.be.true;
        });
    });

    describe('getOpponentMessage', () => {
        let action: ActionPlace;

        beforeEach(() => {
            action = new ActionPlace(game.player1, game, VALID_PLACEMENT);
        });

        it('should return simple place message if no objectives were completed', () => {
            const lineSkip = '<br>';
            action['objectivesCompletedMessages'] = [];
            expect(action.getOpponentMessage().message?.includes(lineSkip)).to.be.false;
        });

        it('should return place message with completed objectives if they exist', () => {
            action['objectivesCompletedMessages'] = ['test'];
            expect(action.getOpponentMessage().message?.includes('test')).to.be.true;
        });
    });

    describe('amountOfLettersInWords', () => {
        let action: ActionPlace;

        beforeEach(() => {
            action = new ActionPlace(game.player1, game, VALID_PLACEMENT);
        });

        it('should return the correct number of tiles', () => {
            expect(action['amountOfLettersInWords'](EXTRACT_RETURN)).to.equal(EXTRACT_RETURN_LETTERS);
        });
    });

    describe('isLegalPlacement', () => {
        let action: ActionPlace;

        beforeEach(() => {
            action = new ActionPlace(game.player1, game, VALID_PLACEMENT);
        });

        it('should call amountOfLettersInWords', () => {
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            const amountOfLettersInWordsStub = stub(ActionPlace.prototype, <any>'amountOfLettersInWords').returns(1000);
            action['isLegalPlacement'](EXTRACT_RETURN);
            assert(amountOfLettersInWordsStub.calledOnce);
            amountOfLettersInWordsStub.restore();
        });
        it('should call containsCenterSquare if amountOfLettersInWords return the same amount than tileToPlace', () => {
            chai.spy.restore(ActionPlace.prototype, 'amountOfLettersInWords');
            const containsCenterSquareStub = stub(action, <any>'containsCenterSquare').returns(true);
            const amountOfLettersInWordsStub = stub(action, <any>'amountOfLettersInWords').returns(VALID_TILES_TO_PLACE.length);
            action['isLegalPlacement'](EXTRACT_RETURN);
            assert(containsCenterSquareStub.calledOnce);
            containsCenterSquareStub.restore();
            amountOfLettersInWordsStub.restore();
        });
    });

    describe('containsCenterSquare', () => {
        let action: ActionPlace;

        beforeEach(() => {
            action = new ActionPlace(game.player1, game, VALID_PLACEMENT);
        });

        it('should return true if it contains center square', () => {
            const result = action['containsCenterSquare'](EXTRACT_CENTER);
            expect(result).to.be.true;
        });

        it('should return true if it contains center square', () => {
            const result = action['containsCenterSquare'](EXTRACT_RETURN);
            expect(result).to.be.false;
        });
    });
});
