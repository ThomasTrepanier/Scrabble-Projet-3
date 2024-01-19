/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Orientation } from '@app/classes/board';
import { ObjectiveState } from '@app/classes/objectives/objective-utils';
import { ObjectiveValidationParameters } from '@app/classes/objectives/validation-parameters';
import * as chai from 'chai';
import { expect } from 'chai';
import * as spies from 'chai-spies';
import { ConsecutivePlaceOrientationObjective } from './consecutive-place-orientation';
chai.use(spies);

describe('Consecutive Place Orientation Objective', () => {
    let objective: ConsecutivePlaceOrientationObjective;

    beforeEach(() => {
        objective = new ConsecutivePlaceOrientationObjective();
        objective.progress = 2;
        objective.progressOrientation = Orientation.Vertical;
        objective.isPublic = true;
        objective.state = ObjectiveState.Completed;
    });

    describe('updateProgress', () => {
        it('should increment the progress if it is the same orientation', () => {
            const validationParameters = { wordPlacement: { orientation: Orientation.Vertical } } as unknown as ObjectiveValidationParameters;
            objective.updateProgress(validationParameters);
            expect(objective.progress).to.equal(3);
            expect(objective.progressOrientation).to.equal(Orientation.Vertical);
        });

        it('should set to 1 the progress if it is the other orientation', () => {
            const validationParameters = { wordPlacement: { orientation: Orientation.Horizontal } } as unknown as ObjectiveValidationParameters;
            objective.updateProgress(validationParameters);
            expect(objective.progress).to.equal(1);
            expect(objective.progressOrientation).to.equal(Orientation.Horizontal);
        });
    });

    describe('clone', () => {
        it('should return a ConsecutivePlaceOrientationObjective', () => {
            const clone = objective.clone();
            expect(clone).to.be.instanceOf(ConsecutivePlaceOrientationObjective);
        });

        it('should make a new instance of a ConsecutivePlaceOrientationObjective', () => {
            const clone = objective.clone();
            expect(clone).to.deep.equal(objective);
            expect(clone).not.to.equal(objective);
        });
    });
});
