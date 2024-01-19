/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { ObjectiveValidationParameters } from '@app/classes/objectives/validation-parameters';
import { DEFAULT_SQUARE } from '@app/classes/word-finding/helper.spec';
import { expect } from 'chai';
import { ThreeWordsPlacement } from './three-word-placement';

describe('Three words created Objective', () => {
    let objective: ThreeWordsPlacement;

    beforeEach(() => {
        objective = new ThreeWordsPlacement();
    });

    describe('updateProgress', () => {
        let validationParameters: ObjectiveValidationParameters;

        it('should set progress to maxProgress if created 3 words', () => {
            validationParameters = {
                createdWords: [
                    [
                        [DEFAULT_SQUARE, { letter: 'X', value: 10 }],
                        [DEFAULT_SQUARE, { letter: 'D', value: 1 }],
                    ],
                    [
                        [DEFAULT_SQUARE, { letter: 'L', value: 10 }],
                        [DEFAULT_SQUARE, { letter: 'O', value: 1 }],
                    ],
                    [
                        [DEFAULT_SQUARE, { letter: 'H', value: 10 }],
                        [DEFAULT_SQUARE, { letter: 'A', value: 1 }],
                    ],
                ],
            } as ObjectiveValidationParameters;
            objective.updateProgress(validationParameters);
            expect(objective.progress).to.equal(objective['maxProgress']);
        });

        it('should keep same progress if created words less than 3 words', () => {
            validationParameters = {
                createdWords: [
                    [
                        [DEFAULT_SQUARE, { letter: 'L', value: 1 }],
                        [DEFAULT_SQUARE, { letter: 'O', value: 1 }],
                        [DEFAULT_SQUARE, { letter: 'L', value: 1 }],
                    ],
                ],
            } as ObjectiveValidationParameters;
            objective.updateProgress(validationParameters);
            expect(objective.progress).to.equal(objective.progress);
        });
    });

    it('clone should do deep copy of object', () => {
        const clone = objective.clone();
        expect(clone).to.deep.equal(objective);
        expect(clone).not.to.equal(objective);
    });
});
