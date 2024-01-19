/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { ObjectiveValidationParameters } from '@app/classes/objectives/validation-parameters';
import { DEFAULT_SQUARE } from '@app/classes/word-finding/helper.spec';
import { expect } from 'chai';
import { TenLetterWord } from './ten-letter-word';

describe('Ten letter word Objective', () => {
    let objective: TenLetterWord;

    beforeEach(() => {
        objective = new TenLetterWord();
    });

    describe('updateProgress', () => {
        let validationParameters: ObjectiveValidationParameters;

        it('should set progress to maxProgress if created words contain ten letter word', () => {
            validationParameters = {
                createdWords: [
                    [
                        [DEFAULT_SQUARE, { letter: 'O', value: 10 }],
                        [DEFAULT_SQUARE, { letter: 'O', value: 1 }],
                        [DEFAULT_SQUARE, { letter: 'O', value: 10 }],
                        [DEFAULT_SQUARE, { letter: 'O', value: 10 }],
                        [DEFAULT_SQUARE, { letter: 'O', value: 1 }],
                        [DEFAULT_SQUARE, { letter: 'O', value: 10 }],
                        [DEFAULT_SQUARE, { letter: 'O', value: 10 }],
                        [DEFAULT_SQUARE, { letter: 'O', value: 1 }],
                        [DEFAULT_SQUARE, { letter: 'O', value: 10 }],
                        [DEFAULT_SQUARE, { letter: 'O', value: 10 }],
                    ],
                ],
            } as ObjectiveValidationParameters;
            objective.updateProgress(validationParameters);
            expect(objective.progress).to.equal(objective['maxProgress']);
        });

        it('should set progress to 0 if if created words DO NOT contain ten letter word', () => {
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
            expect(objective.progress).to.equal(0);
        });
    });

    it('clone should do deep copy of object', () => {
        const clone = objective.clone();
        expect(clone).to.deep.equal(objective);
        expect(clone).not.to.equal(objective);
    });
});
