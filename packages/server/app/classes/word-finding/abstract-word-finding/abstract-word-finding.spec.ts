/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable dot-notation */
import { Board, Orientation, Position } from '@app/classes/board';
import { Dictionary } from '@app/classes/dictionary';
import Range from '@app/classes/range/range';
import { Square } from '@app/classes/square';
import { Tile } from '@app/classes/tile';
import {
    BoardPlacement,
    BoardPlacementsExtractor,
    DictionarySearcher,
    DictionarySearchResult,
    ScoredWordPlacement,
    WordFindingRequest,
    WordFindingUseCase,
} from '@app/classes/word-finding';
import {
    boardFromLetterValues,
    DEFAULT_BOARD_PLACEMENT,
    DEFAULT_PERPENDICULAR_WORD,
    DEFAULT_SQUARE,
    DEFAULT_TILE,
    DEFAULT_WORD_PLACEMENT,
    DEFAULT_WORD_RESULT,
    lettersToTiles,
    LetterValues,
} from '@app/classes/word-finding/helper.spec';
import { ERROR_PLAYER_DOESNT_HAVE_TILE } from '@app/constants/classes-errors';
import { BINGO_BONUS_POINTS } from '@app/constants/game-constants';
import { ScoreCalculatorService } from '@app/services/score-calculator-service/score-calculator.service';
import { Random } from '@app/utils/random/random';
import { switchOrientation } from '@app/utils/switch-orientation/switch-orientation';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { createStubInstance, SinonStub, SinonStubbedInstance, stub } from 'sinon';
import AbstractWordFinding from './abstract-word-finding';

const GRID: LetterValues = [
    // 0   1    2    3    4
    [' ', ' ', ' ', ' ', ' '], // 0
    [' ', ' ', ' ', ' ', 'X'], // 1
    [' ', ' ', 'A', 'B', 'C'], // 2
    [' ', ' ', ' ', ' ', 'Y'], // 3
    [' ', ' ', ' ', ' ', 'Z'], // 4
];

function* mockGenerator<T>(array: T[]): Generator<T> {
    for (const a of array) yield a;
}

class WordFindingTest extends AbstractWordFinding {
    handleWordPlacement(wordPlacement: ScoredWordPlacement): void {
        this.wordPlacements.push(wordPlacement);
    }
    isSearchCompleted(): boolean {
        return true;
    }
}

describe('AbstractWordFinding', () => {
    let wordFinding: AbstractWordFinding;
    let board: Board;
    let tiles: Tile[];
    let request: WordFindingRequest;
    let dictionaryStub: SinonStubbedInstance<Dictionary>;
    let scoreCalculatorStub: SinonStubbedInstance<ScoreCalculatorService>;

    beforeEach(() => {
        board = boardFromLetterValues(GRID);
        tiles = lettersToTiles(['L', 'M', 'N']);
        request = {
            useCase: 'none' as unknown as WordFindingUseCase,
        };
        dictionaryStub = createStubInstance(Dictionary);
        scoreCalculatorStub = createStubInstance(ScoreCalculatorService, {
            calculatePoints: 0,
            bonusPoints: 0,
        });
        wordFinding = new WordFindingTest(
            board,
            tiles,
            request,
            dictionaryStub as unknown as Dictionary,
            scoreCalculatorStub as unknown as ScoreCalculatorService,
        );
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should create copy of tiles', () => {
        for (let i = 0; i < tiles.length; ++i) {
            expect(wordFinding['tiles'][i]).to.deep.equal(tiles[i]);
            expect(wordFinding['tiles'][i]).not.to.equal(tiles[i]);
        }
    });

    describe('findWords', () => {
        let convertTilesToLettersStub: SinonStub;
        let randomBoardPlacementsStub: SinonStub;
        let getAllWordsStub: SinonStub;
        let getWordPlacementStub: SinonStub;
        let validateWordPlacementStub: SinonStub;
        let handleWordPlacementStub: SinonStub;
        let isSearchCompletedStub: SinonStub;
        let wordResult: DictionarySearchResult;
        let boardPlacements: BoardPlacement[];

        beforeEach(() => {
            convertTilesToLettersStub = stub(wordFinding, 'convertTilesToLetters' as any).returns([]);
            randomBoardPlacementsStub = stub(wordFinding, 'randomBoardPlacements' as any);
            getAllWordsStub = stub(DictionarySearcher.prototype, 'getAllWords');
            getWordPlacementStub = stub(wordFinding, 'getWordPlacement' as any);
            validateWordPlacementStub = stub(wordFinding, 'validateWordPlacement' as any);
            handleWordPlacementStub = stub(wordFinding, 'handleWordPlacement' as any);
            isSearchCompletedStub = stub(wordFinding, 'isSearchCompleted' as any).returns(false);

            wordResult = { ...DEFAULT_WORD_RESULT };
            boardPlacements = [{ ...DEFAULT_BOARD_PLACEMENT }, { ...DEFAULT_BOARD_PLACEMENT }, { ...DEFAULT_BOARD_PLACEMENT }];

            getAllWordsStub.returns([wordResult]);
            randomBoardPlacementsStub.returns(mockGenerator(boardPlacements));
        });

        afterEach(() => {
            getAllWordsStub.restore();
        });

        it('should call convertTilesToLetters', () => {
            randomBoardPlacementsStub.returns([]);
            wordFinding.findWords();
            expect(convertTilesToLettersStub.called).to.be.true;
        });

        it('should call randomBoardPlacements', () => {
            randomBoardPlacementsStub.returns([]);
            wordFinding.findWords();
            expect(randomBoardPlacementsStub.called).to.be.true;
        });

        it('should call getWordPlacement with every wordResult and BoardPlacement', () => {
            validateWordPlacementStub.returns(false);

            wordFinding.findWords();

            for (const placement of boardPlacements) {
                expect(getWordPlacementStub.calledWith(wordResult, placement)).to.be.true;
            }
        });

        it('should call validateWordPlacement with every wordPlacement', () => {
            const wordPlacements: ScoredWordPlacement[] = [];

            for (let i = 0; i < boardPlacements.length; ++i) {
                const placement = { ...DEFAULT_WORD_PLACEMENT };
                wordPlacements.push(placement);
                getWordPlacementStub.onCall(i).returns(placement);
            }

            wordFinding.findWords();

            for (const placement of wordPlacements) {
                expect(validateWordPlacementStub.calledWith(placement)).to.be.true;
            }
        });

        it('should call handleWordPlacement with every wordPlacement', () => {
            validateWordPlacementStub.returns(true);
            const wordPlacements: ScoredWordPlacement[] = [];

            for (let i = 0; i < boardPlacements.length; ++i) {
                const placement = { ...DEFAULT_WORD_PLACEMENT };
                wordPlacements.push(placement);
                getWordPlacementStub.onCall(i).returns(placement);
            }

            wordFinding.findWords();

            for (const placement of wordPlacements) {
                expect(handleWordPlacementStub.calledWith(placement)).to.be.true;
            }
        });

        it('should not call handleWordPlacement if validateWordPlacement returns false', () => {
            validateWordPlacementStub.returns(false);

            wordFinding.findWords();

            expect(handleWordPlacementStub.called).to.be.false;
        });

        it('should call isSearchCompleted for every wordPlacement', () => {
            validateWordPlacementStub.returns(true);

            wordFinding.findWords();

            expect(isSearchCompletedStub.callCount).to.equal(boardPlacements.length);
        });

        it('should not continue if isSearchCompleted is true', () => {
            validateWordPlacementStub.returns(true);
            isSearchCompletedStub.returns(true);

            wordFinding.findWords();

            expect(getAllWordsStub.callCount).to.equal(1);
        });
    });

    describe('isWithingPointRange', () => {
        it('should return true if no pointRange', () => {
            const score = 42;
            request.pointRange = undefined;
            expect(wordFinding['isWithinPointRange'](score)).to.be.true;
        });

        it('should call isWithinRange', () => {
            const score = 42;
            request.pointRange = new Range(0, 1);
            const isWithinRangeStub = stub(request.pointRange, 'isWithinRange');

            wordFinding['isWithinPointRange'](score);

            expect(isWithinRangeStub.calledWith(score)).to.be.true;
        });
    });

    describe('randomBoardPlacements', () => {
        let extractBoardPlacementsStub: SinonStub;
        let popRandomStub: SinonStub;

        beforeEach(() => {
            extractBoardPlacementsStub = stub(BoardPlacementsExtractor.prototype, 'extractBoardPlacements').returns([]);
            popRandomStub = stub(Random, 'popRandom').returns(undefined);
        });

        afterEach(() => {
            extractBoardPlacementsStub.restore();
            popRandomStub.restore();
        });

        it('should call extractBoardPlacements', () => {
            // eslint-disable-next-line no-unused-vars
            for (const _ of wordFinding['randomBoardPlacements']());

            expect(extractBoardPlacementsStub.called).to.be.true;
        });

        it('should call popRandom with boardPlacement', () => {
            const boardPlacements: BoardPlacement[] = [];

            // eslint-disable-next-line no-unused-vars
            for (const _ of wordFinding['randomBoardPlacements']());

            expect(popRandomStub.calledWith(boardPlacements)).to.be.true;
        });

        it('should call popRandom while it returns a value', () => {
            const n = 4;
            popRandomStub.returns(undefined);

            for (let i = 0; i < n; ++i) popRandomStub.onCall(i).returns({ ...DEFAULT_BOARD_PLACEMENT });

            // eslint-disable-next-line no-unused-vars
            for (const _ of wordFinding['randomBoardPlacements']());

            expect(popRandomStub.callCount).to.equal(n + 1);
        });
    });

    describe('getWordPlacement', () => {
        let extractWordSquareTilesStub: SinonStub;
        let extractPerpendicularWordsSquareTilesStub: SinonStub;
        let wordResult: DictionarySearchResult;
        let boardPlacement: BoardPlacement;

        beforeEach(() => {
            extractWordSquareTilesStub = stub(wordFinding, 'extractWordSquareTiles' as any).returns([[{ ...DEFAULT_SQUARE }, { ...DEFAULT_TILE }]]);
            extractPerpendicularWordsSquareTilesStub = stub(wordFinding, 'extractPerpendicularWordsSquareTiles' as any).returns([]);

            wordResult = { ...DEFAULT_WORD_RESULT };
            boardPlacement = { ...DEFAULT_BOARD_PLACEMENT };
        });

        it('should call extractWordSquareTiles with wordResult and boardPlacement', () => {
            wordFinding['getWordPlacement'](wordResult, boardPlacement);

            expect(extractWordSquareTilesStub.calledWith(wordResult, boardPlacement)).to.be.true;
        });

        it('should call extractPerpendicularWordsSquareTiles with wordResult and boardPlacement', () => {
            wordFinding['getWordPlacement'](wordResult, boardPlacement);

            expect(extractPerpendicularWordsSquareTilesStub.calledWith(wordResult, boardPlacement)).to.be.true;
        });

        it('should call calculatePoints with wordSquareTiles and perpendicularWordsSquareTiles', () => {
            const wordSquareTiles: [Square, Tile][] = [[{ ...DEFAULT_SQUARE }, { ...DEFAULT_TILE }]];
            const perpendicularWordsSquareTiles: [Square, Tile][][] = [[[{ ...DEFAULT_SQUARE }, { ...DEFAULT_TILE }]]];
            const expected = [wordSquareTiles, ...perpendicularWordsSquareTiles];

            extractWordSquareTilesStub.returns(wordSquareTiles);
            extractPerpendicularWordsSquareTilesStub.returns(perpendicularWordsSquareTiles);

            wordFinding['getWordPlacement'](wordResult, boardPlacement);

            expect(scoreCalculatorStub.calculatePoints.calledWith(expected)).to.be.true;
        });

        it('should returns only new tiles', () => {
            const n = 2;
            const m = 5;
            const wordSquareTiles: [Square, Tile][] = [];

            for (let i = 0; i < n; ++i) {
                wordSquareTiles.push([{ ...DEFAULT_SQUARE }, { ...DEFAULT_TILE }]);
            }
            for (let i = 0; i < m - n; ++i) {
                wordSquareTiles.push([{ ...DEFAULT_SQUARE, tile: { ...DEFAULT_TILE } }, { ...DEFAULT_TILE }]);
            }

            extractWordSquareTilesStub.returns(wordSquareTiles);

            const result = wordFinding['getWordPlacement'](wordResult, boardPlacement);

            for (let i = 0; i < n; ++i) {
                expect(result.tilesToPlace[i]).to.equal(wordSquareTiles[i][1]);
            }

            expect(result.tilesToPlace.length).to.equal(n);
        });

        it('should return boardPlacement orientation', () => {
            const result = wordFinding['getWordPlacement'](wordResult, boardPlacement);

            expect(result.orientation).to.equal(boardPlacement.orientation);
        });

        it('should return first placed tile position', () => {
            const n = 2;
            const m = 5;
            const wordSquareTiles: [Square, Tile][] = [];

            for (let i = 0; i < m - n; ++i) {
                wordSquareTiles.push([{ ...DEFAULT_SQUARE, tile: { ...DEFAULT_TILE } }, { ...DEFAULT_TILE }]);
            }
            for (let i = 0; i < n; ++i) {
                wordSquareTiles.push([{ ...DEFAULT_SQUARE }, { ...DEFAULT_TILE }]);
            }

            extractWordSquareTilesStub.returns(wordSquareTiles);

            const result = wordFinding['getWordPlacement'](wordResult, boardPlacement);

            expect(result.startPosition).to.equal(wordSquareTiles[m - n][0].position);
        });

        it('should return score without bonus if no bingo is played', () => {
            const score = 43;
            scoreCalculatorStub.calculatePoints.returns(score);
            scoreCalculatorStub.bonusPoints.returns(0);

            const result = wordFinding['getWordPlacement'](wordResult, boardPlacement);

            expect(result.score).to.equal(score);
        });

        it('should return score with bonus if bingo is played', () => {
            const score = 43;
            scoreCalculatorStub.calculatePoints.returns(score);
            scoreCalculatorStub.bonusPoints.returns(BINGO_BONUS_POINTS);

            const result = wordFinding['getWordPlacement'](wordResult, boardPlacement);

            expect(result.score).to.equal(score + BINGO_BONUS_POINTS);
        });
    });

    describe('validateWordPlacement', () => {
        it('should call isWithinPointRangeStub with score', () => {
            const score = 44;
            const isWithinPointRangeStub = stub(wordFinding, 'isWithinPointRange' as any);
            const wordPlacement = { ...DEFAULT_WORD_PLACEMENT, score };

            wordFinding['validateWordPlacement'](wordPlacement);

            expect(isWithinPointRangeStub.calledWith(score)).to.be.true;
        });
    });

    describe('extractWordSquareTiles', () => {
        it('should call extractSquareTiles', () => {
            const extractSquareTilesStub = stub(wordFinding, 'extractSquareTiles' as any);
            const wordResult = { ...DEFAULT_WORD_RESULT };
            const boardPlacement = { ...DEFAULT_BOARD_PLACEMENT };

            wordFinding['extractWordSquareTiles'](wordResult, boardPlacement);

            expect(extractSquareTilesStub.calledWith(boardPlacement.position, boardPlacement.orientation, wordResult.word));
        });
    });

    describe('extractPerpendicularWordsSquareTiles', () => {
        let extractSquareTilesStub: SinonStub;
        let getPerpendicularWordPositionStub: SinonStub;
        let position: Position;
        let wordResult: DictionarySearchResult;
        let boardPlacement: BoardPlacement;

        beforeEach(() => {
            position = new Position(0, 0);
            wordResult = {
                ...DEFAULT_WORD_RESULT,
                perpendicularWords: [
                    { ...DEFAULT_PERPENDICULAR_WORD, distance: 2 },
                    { ...DEFAULT_PERPENDICULAR_WORD, junctionDistance: 3 },
                ],
            };
            boardPlacement = { ...DEFAULT_BOARD_PLACEMENT };

            extractSquareTilesStub = stub(wordFinding, 'extractSquareTiles' as any);
            getPerpendicularWordPositionStub = stub(wordFinding, 'getPerpendicularWordPosition' as any).returns(position);
        });

        it('should call getPerpendicularWordPosition for every perpendicularWord', () => {
            wordFinding['extractPerpendicularWordsSquareTiles'](wordResult, boardPlacement);

            for (const placement of wordResult.perpendicularWords) {
                expect(getPerpendicularWordPositionStub.calledWithExactly(boardPlacement, placement.distance, placement.junctionDistance));
            }
        });

        it('should call extractSquareTiles for every perpendicularWord', () => {
            wordFinding['extractPerpendicularWordsSquareTiles'](wordResult, boardPlacement);

            for (const placement of wordResult.perpendicularWords) {
                const orientation = switchOrientation(boardPlacement.orientation);
                expect(extractSquareTilesStub.calledWithExactly(position, orientation, placement.word));
            }
        });
    });

    describe('extractSquareTiles', () => {
        it('should extract square tile', () => {
            const tests: [row: number, column: number, orientation: Orientation, word: string, expected: [Square, Tile][]][] = [
                [
                    1,
                    2,
                    Orientation.Vertical,
                    'lam',
                    [
                        [board.grid[1][2], tiles[0]],
                        [board.grid[2][2], board.grid[2][2].tile!],
                        [board.grid[3][2], tiles[1]],
                    ],
                ],
                [
                    4,
                    2,
                    Orientation.Horizontal,
                    'mnz',
                    [
                        [board.grid[4][2], tiles[1]],
                        [board.grid[4][3], tiles[2]],
                        [board.grid[4][4], board.grid[4][4].tile!],
                    ],
                ],
            ];

            for (const [row, column, orientation, word, expected] of tests) {
                const position = new Position(row, column);
                const result = wordFinding['extractSquareTiles'](position, orientation, word);

                expect(result).to.deep.equal(expected);
            }
        });
    });

    describe('getTileFromLetter', () => {
        const testTiles = lettersToTiles(['A', 'B', 'C', '*']);

        const tests: [letter: string, expected: Tile][] = [
            ['a', testTiles[0]],
            ['b', testTiles[1]],
            ['z', { ...testTiles[3], letter: 'Z', isBlank: true }],
        ];

        let index = 0;
        for (const [letter, expected] of tests) {
            it(`should get tile (${index})`, () => {
                const playTiles = [...testTiles];
                const result = wordFinding['getTileFromLetter'](playTiles, letter);

                expect(result).to.deep.equal(expected);
            });
            index++;
        }

        it("should throw if does't have letter", () => {
            expect(() => wordFinding['getTileFromLetter'](tiles, 'z')).to.throw(ERROR_PLAYER_DOESNT_HAVE_TILE);
        });
    });

    describe('convertTilesToLetters', () => {
        it('should convert', () => {
            expect(wordFinding['convertTilesToLetters'](tiles)).to.deep.equal(['L', 'M', 'N']);
        });
    });

    describe('getPerpendicularWordPosition', () => {
        const tests: [
            row: number,
            col: number,
            orientation: Orientation,
            distance: number,
            junctionDistance: number,
            expectedRow: number,
            expectedCol: number,
        ][] = [
            [0, 0, Orientation.Horizontal, 2, 3, -3, 2],
            [5, 7, Orientation.Vertical, 1, 4, 6, 3],
        ];

        let index = 0;
        for (const [row, col, orientation, distance, junctionDistance, expectedRow, expectedCol] of tests) {
            it(`should get position (${index})`, () => {
                const position = new Position(row, col);
                const boardPlacement = { ...DEFAULT_BOARD_PLACEMENT, position, orientation };
                const result = wordFinding['getPerpendicularWordPosition'](boardPlacement, distance, junctionDistance);

                expect(result.row).to.equal(expectedRow);
                expect(result.column).to.equal(expectedCol);
            });
            index++;
        }
    });
});
