/* eslint-disable @typescript-eslint/no-unused-expressions,no-unused-expressions */
/* eslint-disable dot-notation */
import { DailyPuzzleGenerator } from '@app/classes/puzzle/daily-puzzle-generator/daily-puzzle-generator';
import { expect } from 'chai';
import { ServicesTestingUnit } from '@app/services/service-testing-unit/services-testing-unit.spec';
import { Dictionary } from '@app/classes/dictionary';
import DictionaryService from '@app/services/dictionary-service/dictionary.service';
import { PuzzleGeneratorParameters } from '@app/classes/puzzle/puzzle-generator/puzzle-generator-parameters';
import { Puzzle } from '@app/classes/puzzle/puzzle';
import * as seedrandom from 'seedrandom';

const WORDS = ['abc', 'bac', 'cab', 'cba', 'abcd', 'abdc', 'acbd', 'acdb', 'adcb', 'adbc', 'bacd', 'badc', 'aaa', 'bbb', 'ccc', 'ddd'];
const PARAMETERS: PuzzleGeneratorParameters = {
    minWordCount: 2,
    maxWordCount: 3,
    minWordSize: 3,
    maxWordSize: 4,
    skipPlacementDistanceCutoff: 10,
    bingoWordSize: 3,
};
const RANDOM_SEEDS = ['fdsfds', 'hgdfs', 'hygreerg', 'ojfidosijf', 'lkjkjh'];

describe('DailyPuzzleGenerator', () => {
    let generator: DailyPuzzleGenerator;
    let testingUnit: ServicesTestingUnit;

    beforeEach(() => {
        const dictionary = new Dictionary({ title: '', description: '', id: 'test-dict', isDefault: true, words: WORDS });

        testingUnit = new ServicesTestingUnit();
        const dictionaryService = testingUnit.setStubbed(DictionaryService);
        dictionaryService.getDefaultDictionary.returns(dictionary);
        dictionaryService.getDictionary.returns(dictionary);

        generator = new DailyPuzzleGenerator(PARAMETERS);
    });

    afterEach(() => {
        testingUnit.restore();
    });

    it('should exist', () => {
        expect(generator).to.exist;
    });

    describe('generate', () => {
        it('should always generate the same puzzle', () => {
            const generator2 = new DailyPuzzleGenerator(PARAMETERS);

            let puzzle1: Puzzle | undefined;
            let puzzle2: Puzzle | undefined;

            do {
                try {
                    puzzle1 = generator.generate();
                    puzzle2 = generator2.generate();
                } catch {
                    generator.nextSeed();
                    generator2.nextSeed();
                }
            } while (puzzle1 === undefined && puzzle2 === undefined);

            expect(puzzle1).to.deep.equal(puzzle2);
        });

        for (const item of RANDOM_SEEDS) {
            it(`should work with a random seed: ${item}`, () => {
                const generator2 = new DailyPuzzleGenerator(PARAMETERS);

                let puzzle1: Puzzle | undefined;
                let puzzle2: Puzzle | undefined;

                let seed = item;
                let random1 = seedrandom(seed);
                let random2 = seedrandom(seed);

                do {
                    generator['random'] = random1;
                    generator2['random'] = random2;

                    try {
                        puzzle1 = generator.generate();
                        puzzle2 = generator2.generate();
                    } catch {
                        seed = seed + 'x';
                        random1 = seedrandom(seed);
                        random2 = seedrandom(seed);
                    }
                } while (puzzle1 === undefined && puzzle2 === undefined);

                expect(puzzle1).to.deep.equal(puzzle2);
            });
        }
    });
});
