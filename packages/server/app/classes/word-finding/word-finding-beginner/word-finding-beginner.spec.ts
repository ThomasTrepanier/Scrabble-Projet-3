/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Board } from '@app/classes/board';
import { Dictionary } from '@app/classes/dictionary';
import { Tile } from '@app/classes/tile';
import { boardFromLetterValues, DEFAULT_WORD_PLACEMENT, lettersToTiles, LetterValues } from '@app/classes/word-finding/helper.spec';
import { ScoreCalculatorService } from '@app/services/score-calculator-service/score-calculator.service';
import { expect } from 'chai';
import { createStubInstance, SinonStub, SinonStubbedInstance, stub } from 'sinon';
import { WordFindingRequest, WordFindingUseCase } from '..';
import { ScoredWordPlacement } from '@app/classes/word-finding/word-finding-types';
import WordFindingBeginner from './word-finding-beginner';
import Range from '@app/classes/range/range';
import { WORD_FINDING_BEGINNER_ACCEPTANCE_THRESHOLD } from '@app/constants/classes-constants';
import { NO_REQUEST_POINT_HISTORY, NO_REQUEST_POINT_RANGE } from '@app/constants/services-errors';
import * as sinon from 'sinon';

const GRID: LetterValues = [
    // 0   1    2    3    4
    [' ', ' ', ' ', ' ', ' '], // 0
    [' ', ' ', ' ', ' ', 'X'], // 1
    [' ', ' ', 'A', 'B', 'C'], // 2
    [' ', ' ', ' ', ' ', 'Y'], // 3
    [' ', ' ', ' ', ' ', 'Z'], // 4
];

describe('WordFindingBeginner', () => {
    let wordFinding: WordFindingBeginner;
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
            pointRange: new Range(0, 1),
            pointHistory: new Map(),
        };
        dictionaryStub = createStubInstance(Dictionary);
        scoreCalculatorStub = createStubInstance(ScoreCalculatorService, {
            calculatePoints: 0,
        });
        wordFinding = new WordFindingBeginner(
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

    describe('handleWordPlacement', () => {
        let isWithinPointRangeStub: SinonStub;
        let acceptanceProbabilitiesGetStub: SinonStub;
        let wordPlacement: ScoredWordPlacement;

        beforeEach(() => {
            wordFinding['acceptanceProbabilities'] = new Map();

            isWithinPointRangeStub = stub(wordFinding, 'isWithinPointRange' as any).returns(true);
            acceptanceProbabilitiesGetStub = stub(wordFinding['acceptanceProbabilities'], 'get').returns(1);
            wordPlacement = { ...DEFAULT_WORD_PLACEMENT, score: 46 };
        });

        it('should call isWithinPointRange()', () => {
            wordFinding['handleWordPlacement'](wordPlacement);

            expect(isWithinPointRangeStub.calledWith(wordPlacement.score)).to.be.true;
        });

        it('should get acceptance probability if isWithingPointRange', () => {
            isWithinPointRangeStub.returns(true);

            wordFinding['handleWordPlacement'](wordPlacement);

            expect(acceptanceProbabilitiesGetStub.calledWith(wordPlacement.score)).to.be.true;
        });

        it('should not call acceptance probability if isWithinPointRange is false', () => {
            isWithinPointRangeStub.returns(false);

            wordFinding['handleWordPlacement'](wordPlacement);

            expect(acceptanceProbabilitiesGetStub.called).to.be.false;
        });

        it('should update values if acceptanceProbability is greater than found acceptance', () => {
            const acceptance = 0.75;
            wordFinding['highestAcceptanceFoundPlacement'] = 0.5;
            wordFinding['wordPlacements'] = [];
            acceptanceProbabilitiesGetStub.returns(acceptance);

            wordFinding['handleWordPlacement'](wordPlacement);

            expect(wordFinding['highestAcceptanceFoundPlacement']).to.equal(acceptance);
            expect(wordFinding['wordPlacements']).to.deep.equal([wordPlacement]);
        });

        it('should not update values if acceptanceProbability is lower than found acceptance', () => {
            const found = 0.5;
            const acceptance = 0.25;
            wordFinding['highestAcceptanceFoundPlacement'] = found;
            wordFinding['wordPlacements'] = [];
            acceptanceProbabilitiesGetStub.returns(acceptance);

            wordFinding['handleWordPlacement'](wordPlacement);

            expect(wordFinding['highestAcceptanceFoundPlacement']).to.equal(found);
            expect(wordFinding['wordPlacements']).to.deep.equal([]);
        });

        it('should not update values if acceptanceProbability is lower than found acceptance (value is undefined)', () => {
            const found = 0.5;
            wordFinding['highestAcceptanceFoundPlacement'] = found;
            wordFinding['wordPlacements'] = [];
            acceptanceProbabilitiesGetStub.returns(undefined);

            wordFinding['handleWordPlacement'](wordPlacement);

            expect(wordFinding['highestAcceptanceFoundPlacement']).to.equal(found);
            expect(wordFinding['wordPlacements']).to.deep.equal([]);
        });
    });

    describe('isSearchCompleted', () => {
        const tests: [wordPlacementsLength: number, foundAcceptance: number, expected: boolean][] = [
            [1, 1, true],
            [0, 1, false],
            [1, 0, false],
            [1, WORD_FINDING_BEGINNER_ACCEPTANCE_THRESHOLD, true],
        ];

        let index = 0;
        for (const [wordPlacementsLength, foundAcceptance, expected] of tests) {
            it(`should check if completed (${index})`, () => {
                wordFinding['wordPlacements'] = [];
                for (let i = 0; i < wordPlacementsLength; ++i) {
                    wordFinding['wordPlacements'].push({ ...DEFAULT_WORD_PLACEMENT });
                }
                wordFinding['highestAcceptanceFoundPlacement'] = foundAcceptance;

                expect(wordFinding['isSearchCompleted']()).to.equal(expected);
            });
            index++;
        }
    });

    describe('calculateAcceptanceProbabilities', () => {
        let findScoreMinimumFrequencyStub: SinonStub;
        let range: Range;

        beforeEach(() => {
            findScoreMinimumFrequencyStub = stub(wordFinding, 'findScoreMinimumFrequency' as any).returns(0);
            range = new Range(1, 4);
            wordFinding['request'].pointRange = range;
        });

        it('should call findScoreMinimumFrequency', () => {
            wordFinding['calculateAcceptanceProbabilities']();
            expect(findScoreMinimumFrequencyStub.called).to.be.true;
        });

        it('should all be equal to 1 if history is empty', () => {
            wordFinding['calculateAcceptanceProbabilities']();

            for (const score of range) {
                expect(wordFinding['acceptanceProbabilities'].get(score)).to.equal(1);
            }
        });

        it('should all be between 0 and 1', () => {
            wordFinding['request'].pointHistory = new Map([
                [1, 4],
                [2, 8],
                [3, 10],
                [4, 4],
            ]);
            findScoreMinimumFrequencyStub.returns(4);

            wordFinding['calculateAcceptanceProbabilities']();

            for (const score of range) {
                const probability = wordFinding['acceptanceProbabilities'].get(score);
                expect(probability).to.be.lessThanOrEqual(1);
                expect(probability).to.be.greaterThanOrEqual(0);
            }
        });

        it('should only contain all value from range', () => {
            wordFinding['calculateAcceptanceProbabilities']();

            for (const score of range) {
                expect(wordFinding['acceptanceProbabilities'].has(score)).to.be.true;
            }
            expect(wordFinding['acceptanceProbabilities'].size).to.equal(range.max - range.min + 1);
        });

        it('should throw if no pointRange', () => {
            wordFinding['request'].pointRange = undefined;

            expect(() => wordFinding['calculateAcceptanceProbabilities']()).to.throw(NO_REQUEST_POINT_RANGE);
        });

        it('should throw if no pointRange', () => {
            wordFinding['request'].pointHistory = undefined;

            expect(() => wordFinding['calculateAcceptanceProbabilities']()).to.throw(NO_REQUEST_POINT_HISTORY);
        });
    });

    describe('findScoreMinimumFrequency', () => {
        let range: Range;

        beforeEach(() => {
            range = new Range(1, 4);
            wordFinding['request'].pointRange = range;
        });

        const tests: [scores: number[], expected: number][] = [
            [[10, 5, 9, 3], 3],
            [[1, 2, 3, 4], 1],
            [[6, 2, 9, 4], 2],
        ];

        let index = 0;
        for (const [scores, expected] of tests) {
            it(`should find minimum ${index}`, () => {
                let i = 0;
                for (const score of range) {
                    wordFinding['request'].pointHistory?.set(score, scores[i]);
                    i++;
                }

                expect(wordFinding['findScoreMinimumFrequency']()).to.equal(expected);
            });
            index++;
        }

        it('should return 0 if a value is missing', () => {
            wordFinding['request'].pointHistory?.set(1, 1);
            wordFinding['request'].pointHistory?.set(2, 1);
            wordFinding['request'].pointHistory?.set(4, 1);

            expect(wordFinding['findScoreMinimumFrequency']()).to.equal(0);
        });

        it('should throw if no pointRange', () => {
            wordFinding['request'].pointRange = undefined;

            expect(() => wordFinding['findScoreMinimumFrequency']()).to.throw(NO_REQUEST_POINT_RANGE);
        });

        it('should throw if no pointRange', () => {
            wordFinding['request'].pointHistory = undefined;

            expect(() => wordFinding['findScoreMinimumFrequency']()).to.throw(NO_REQUEST_POINT_HISTORY);
        });
    });
});
