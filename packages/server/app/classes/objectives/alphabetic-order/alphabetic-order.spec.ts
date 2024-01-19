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
import { AlphabeticOrderObjective, BONUS_POINTS, DESCRIPTION, MAX_PROGRESS, NAME, SHOULD_RESET } from './alphabetic-order';
chai.use(spies);

const ALPHABETIC_WORD_1 = [
    [{} as unknown as Square, { letter: 'D' } as Tile],
    [{} as unknown as Square, { letter: 'E' } as Tile],
    [{} as unknown as Square, { letter: 'H' } as Tile],
    [{} as unknown as Square, { letter: 'O' } as Tile],
    [{} as unknown as Square, { letter: 'R' } as Tile],
    [{} as unknown as Square, { letter: 'S' } as Tile],
];

const ALPHABETIC_WORD_2 = [
    [{} as unknown as Square, { letter: 'E' } as Tile],
    [{} as unknown as Square, { letter: 'F' } as Tile],
    [{} as unknown as Square, { letter: 'F' } as Tile],
    [{} as unknown as Square, { letter: 'O' } as Tile],
    [{} as unknown as Square, { letter: 'R' } as Tile],
    [{} as unknown as Square, { letter: 'T' } as Tile],
];

const ALPHABETIC_WORD_BLANK_TILE = [
    [{} as unknown as Square, { letter: 'E' } as Tile],
    [{} as unknown as Square, { letter: 'F' } as Tile],
    [{} as unknown as Square, { letter: 'F' } as Tile],
    [{} as unknown as Square, { letter: 'O' } as Tile],
    [{} as unknown as Square, { letter: '*', playedLetter: 'R' } as Tile],
    [{} as unknown as Square, { letter: 'T' } as Tile],
];

const NON_ALPHABETIC_WORD = [
    [{} as unknown as Square, { letter: 'V' } as Tile],
    [{} as unknown as Square, { letter: 'I' } as Tile],
    [{} as unknown as Square, { letter: 'E' } as Tile],
    [{} as unknown as Square, { letter: 'U' } as Tile],
    [{} as unknown as Square, { letter: 'X' } as Tile],
];

const SHORT_WORD = [
    [{} as unknown as Square, { letter: 'V' } as Tile],
    [{} as unknown as Square, { letter: 'I' } as Tile],
];

const VALID_PARAMETERS_ONE_WORD = { createdWords: [ALPHABETIC_WORD_1] } as ObjectiveValidationParameters;

const VALID_PARAMETERS_TWO_WORDS = { createdWords: [ALPHABETIC_WORD_1, ALPHABETIC_WORD_2] } as ObjectiveValidationParameters;

const VALID_PARAMETERS_DOUBLED_LETTER = { createdWords: [ALPHABETIC_WORD_2] } as ObjectiveValidationParameters;

const VALID_PARAMETERS_BLANK_TILE = { createdWords: [ALPHABETIC_WORD_BLANK_TILE] } as ObjectiveValidationParameters;

const INVALID_PARAMETERS = { createdWords: [NON_ALPHABETIC_WORD] } as ObjectiveValidationParameters;

const SHORT_WORD_PARAMETERS = { createdWords: [SHORT_WORD] } as ObjectiveValidationParameters;

describe('AlphabeticOrderObjective', () => {
    let objective: AlphabeticOrderObjective;

    beforeEach(() => {
        objective = new AlphabeticOrderObjective();
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
        it('should update progress if a created word is in alphabetical order', () => {
            objective.progress = 0;
            objective.updateProgress(VALID_PARAMETERS_ONE_WORD);
            expect(objective.progress).to.equal(1);
        });

        it('should update progress if a created word is too short (continue)', () => {
            objective.progress = 0;
            objective.updateProgress(SHORT_WORD_PARAMETERS);
            expect(objective.progress).to.equal(0);
        });

        it('should update progress if a created word is in alphabetical order but has 2 identical letters in a row', () => {
            objective.progress = 0;
            objective.updateProgress(VALID_PARAMETERS_DOUBLED_LETTER);
            expect(objective.progress).to.equal(1);
        });

        it('should update progress if a created word is in alphabetical order but has a blank tile', () => {
            objective.progress = 0;
            objective.updateProgress(VALID_PARAMETERS_BLANK_TILE);
            expect(objective.progress).to.equal(1);
        });

        it('should only update progress once even if multiple created words are in alphabetical order', () => {
            objective.progress = 0;
            objective.updateProgress(VALID_PARAMETERS_TWO_WORDS);
            expect(objective.progress).to.equal(1);
        });

        it('should not update progress if no created word is not in alphabetical order', () => {
            objective.progress = 0;
            objective.updateProgress(INVALID_PARAMETERS);
            expect(objective.progress).to.equal(0);
        });
    });

    it('clone should do deep copy of object', () => {
        const clone = objective.clone();
        expect(clone).to.deep.equal(objective);
        expect(clone).not.to.equal(objective);
    });
});
