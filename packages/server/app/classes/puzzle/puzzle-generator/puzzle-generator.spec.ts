/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Dictionary } from '@app/classes/dictionary';
import DictionaryService from '@app/services/dictionary-service/dictionary.service';
import { ServicesTestingUnit } from '@app/services/service-testing-unit/services-testing-unit.spec';
import { expect } from 'chai';
import { PuzzleGenerator } from './puzzle-generator';
import { PuzzleGeneratorParameters } from './puzzle-generator-parameters';

const WORDS = ['abc', 'bac', 'cab', 'cba', 'abcd', 'abdc', 'acbd', 'acdb', 'adcb', 'adbc', 'bacd', 'badc', 'aaa', 'bbb', 'ccc', 'ddd'];
const TEST_COUNT = 10;
const PARAMETERS: PuzzleGeneratorParameters = {
    minWordCount: 2,
    maxWordCount: 3,
    minWordSize: 3,
    maxWordSize: 4,
    skipPlacementDistanceCutoff: 10,
    bingoWordSize: 3,
};

describe('PuzzleGenerator', () => {
    let puzzleGenerator: PuzzleGenerator;
    let testingUnit: ServicesTestingUnit;

    beforeEach(() => {
        const dictionary = new Dictionary({ title: '', description: '', id: 'test-dict', isDefault: true, words: WORDS });

        testingUnit = new ServicesTestingUnit();
        const dictionaryService = testingUnit.setStubbed(DictionaryService);
        dictionaryService.getDefaultDictionary.returns(dictionary);
        dictionaryService.getDictionary.returns(dictionary);

        puzzleGenerator = new PuzzleGenerator(PARAMETERS);
    });

    afterEach(() => {
        testingUnit.restore();
    });

    it('should create', () => {
        expect(puzzleGenerator).to.exist;
    });

    describe('generate', () => {
        it('should generate', () => {
            let count = 0;

            for (let i = 0; i < TEST_COUNT; ++i) {
                try {
                    puzzleGenerator = new PuzzleGenerator(PARAMETERS);
                    const puzzle = puzzleGenerator.generate();

                    expect(puzzle).to.exist;
                    expect(puzzle.tiles).to.have.length(PARAMETERS.bingoWordSize);
                    count++;
                } catch (e) {
                    // nothing to do.
                }
            }

            expect(count).to.be.greaterThan(0);
        });
    });
});
