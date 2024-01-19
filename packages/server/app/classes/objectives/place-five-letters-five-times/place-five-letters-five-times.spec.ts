/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { ObjectiveState } from '@app/classes/objectives/objective-utils';
import { ObjectiveValidationParameters } from '@app/classes/objectives/validation-parameters';
import { LetterValue } from '@app/classes/tile';
import Tile from '@app/classes/tile/tile';
import * as chai from 'chai';
import { expect } from 'chai';
import * as spies from 'chai-spies';
import { PlaceFiveLettersFiveTimesObjective } from './place-five-letters-five-times';

chai.use(spies);

const DEFAULT_TILE: Tile = {
    letter: 'B' as LetterValue,
    value: 3,
};

describe('PlaceFiveLettersFiveTimes Objective', () => {
    let objective: PlaceFiveLettersFiveTimesObjective;

    beforeEach(() => {
        objective = new PlaceFiveLettersFiveTimesObjective();
        objective.progress = 2;
        objective.isPublic = true;
        objective.state = ObjectiveState.NotCompleted;
    });

    describe('updateProgress', () => {
        it('should increment the progress if 5 tiles were placed', () => {
            const validationParameters = {
                wordPlacement: { tilesToPlace: [DEFAULT_TILE, DEFAULT_TILE, DEFAULT_TILE, DEFAULT_TILE, DEFAULT_TILE] },
            } as unknown as ObjectiveValidationParameters;
            objective.updateProgress(validationParameters);
            expect(objective.progress).to.equal(3);
        });

        it('should not increment the progress if more than 5 tiles were placed', () => {
            const validationParameters = {
                wordPlacement: { tilesToPlace: [DEFAULT_TILE, DEFAULT_TILE, DEFAULT_TILE, DEFAULT_TILE, DEFAULT_TILE, DEFAULT_TILE] },
            } as unknown as ObjectiveValidationParameters;
            objective.updateProgress(validationParameters);
            expect(objective.progress).to.equal(2);
        });

        it('should not increment the progress if less than 5 tiles were placed', () => {
            const validationParameters = {
                wordPlacement: { tilesToPlace: [DEFAULT_TILE, DEFAULT_TILE, DEFAULT_TILE, DEFAULT_TILE, DEFAULT_TILE, DEFAULT_TILE] },
            } as unknown as ObjectiveValidationParameters;
            objective.updateProgress(validationParameters);
            expect(objective.progress).to.equal(2);
        });
    });

    describe('clone', () => {
        it('should return a PlaceFiveLettersFiveTimesObjective', () => {
            const clone = objective.clone();
            expect(clone).to.be.instanceOf(PlaceFiveLettersFiveTimesObjective);
        });

        it('should make a new instance of a PlaceFiveLettersFiveTimesObjective', () => {
            const clone = objective.clone();
            expect(clone).to.deep.equal(objective);
            expect(clone).not.to.equal(objective);
        });
    });
});
