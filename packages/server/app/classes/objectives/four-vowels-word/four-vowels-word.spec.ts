/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { ObjectiveValidationParameters } from '@app/classes/objectives/validation-parameters';
import { Square } from '@app/classes/square';
import Tile from '@app/classes/tile/tile';
import * as chai from 'chai';
import { expect } from 'chai';
import * as spies from 'chai-spies';
import * as sinon from 'sinon';
import { BONUS_POINTS, DESCRIPTION, FourVowelsWordObjective, MAX_PROGRESS, NAME, SHOULD_RESET } from './four-vowels-word';
chai.use(spies);

const FOUR_VOWELS_CREATED_WORD = [
    [{} as unknown as Square, { letter: 'A' } as Tile],
    [{} as unknown as Square, { letter: 'D' } as Tile],
    [{} as unknown as Square, { letter: 'I' } as Tile],
    [{} as unknown as Square, { letter: 'E' } as Tile],
    [{} as unknown as Square, { letter: 'U' } as Tile],
];

const FOUR_VOWELS_CREATED_WORD_WITH_BLANK = [
    [{} as unknown as Square, { letter: 'A' } as Tile],
    [{} as unknown as Square, { letter: 'D' } as Tile],
    [{} as unknown as Square, { playedLetter: 'I' } as Tile],
    [{} as unknown as Square, { letter: 'E' } as Tile],
    [{} as unknown as Square, { letter: 'U' } as Tile],
];

const FIVE_VOWELS_CREATED_WORD = [
    [{} as unknown as Square, { letter: 'O' } as Tile],
    [{} as unknown as Square, { letter: 'I' } as Tile],
    [{} as unknown as Square, { letter: 'S' } as Tile],
    [{} as unknown as Square, { letter: 'E' } as Tile],
    [{} as unknown as Square, { letter: 'A' } as Tile],
    [{} as unknown as Square, { letter: 'U' } as Tile],
];

const FAIL_CREATED_WORD = [
    [{} as unknown as Square, { letter: 'M' } as Tile],
    [{} as unknown as Square, { letter: 'O' } as Tile],
    [{} as unknown as Square, { letter: 'U' } as Tile],
    [{} as unknown as Square, { letter: 'C' } as Tile],
    [{} as unknown as Square, { letter: 'H' } as Tile],
    [{} as unknown as Square, { letter: 'E' } as Tile],
    [{} as unknown as Square, { letter: 'S' } as Tile],
];

const VALID_PARAMETERS_4 = { createdWords: [FOUR_VOWELS_CREATED_WORD, FAIL_CREATED_WORD] } as ObjectiveValidationParameters;

const VALID_PARAMETERS_4_BLANK = { createdWords: [FOUR_VOWELS_CREATED_WORD_WITH_BLANK, FAIL_CREATED_WORD] } as ObjectiveValidationParameters;

const VALID_PARAMETERS_5 = { createdWords: [FIVE_VOWELS_CREATED_WORD, FAIL_CREATED_WORD] } as ObjectiveValidationParameters;

const VALID_PARAMETERS_MULTIPLE = { createdWords: [FOUR_VOWELS_CREATED_WORD, FIVE_VOWELS_CREATED_WORD] } as ObjectiveValidationParameters;

const INVALID_PARAMETERS = { createdWords: [FAIL_CREATED_WORD] } as ObjectiveValidationParameters;

describe('FourVowelsWordObjective', () => {
    let objective: FourVowelsWordObjective;

    beforeEach(() => {
        objective = new FourVowelsWordObjective();
    });

    afterEach(() => {
        chai.spy.restore();
        sinon.restore();
    });

    it('constructor should initialize with right attributes', () => {
        expect(objective.name).to.equal(NAME);
        expect(objective.description).to.equal(DESCRIPTION);
        expect(objective.bonusPoints).to.equal(BONUS_POINTS);
        expect(objective.shouldResetOnInvalidWord).to.equal(SHOULD_RESET);
        expect(objective['maxProgress']).to.equal(MAX_PROGRESS);
    });

    describe('updateProgress', () => {
        it('should not update progress if no created word has 4 vowels', () => {
            objective.progress = 0;
            objective.updateProgress(INVALID_PARAMETERS);
            expect(objective.progress).to.equal(0);
        });

        it('should update progress if a created word has 4 vowels', () => {
            objective.progress = 0;
            objective.updateProgress(VALID_PARAMETERS_4);
            expect(objective.progress).to.equal(1);
        });

        it('should update progress if a created word has 4 vowels including blank tiles', () => {
            objective.progress = 0;
            objective.updateProgress(VALID_PARAMETERS_4_BLANK);
            expect(objective.progress).to.equal(1);
        });

        it('should update progress if a created word has more than 4 vowels', () => {
            objective.progress = 0;
            objective.updateProgress(VALID_PARAMETERS_5);
            expect(objective.progress).to.equal(1);
        });

        it('should only update progress once even if multiple created words have 4 vowels', () => {
            objective.progress = 0;
            objective.updateProgress(VALID_PARAMETERS_MULTIPLE);
            expect(objective.progress).to.equal(1);
        });
    });

    it('clone should do deep copy of object', () => {
        const clone = objective.clone();
        expect(clone).to.deep.equal(objective);
        expect(clone).not.to.equal(objective);
    });
});
