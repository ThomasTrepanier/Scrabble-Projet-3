/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { ObjectiveData } from '@app/classes/communication/objective-data';
import { ObjectiveState } from '@app/classes/objectives/objective-utils';
import { ObjectiveValidationParameters } from '@app/classes/objectives/validation-parameters';
import { TestObjective } from '@app/classes/objectives/objectives-test-helper.spec';
import * as chai from 'chai';
import { expect } from 'chai';
import * as spies from 'chai-spies';
import { SinonStub, stub } from 'sinon';
import { AbstractObjective } from './abstract-objective';
chai.use(spies);

describe('Abstract Objective', () => {
    let objective: AbstractObjective;

    beforeEach(() => {
        objective = new TestObjective('Test');
    });

    it('constructor should set state to NotCompleted', () => {
        expect(objective.state).to.equal(ObjectiveState.NotCompleted);
    });

    describe('isCompleted', () => {
        it('should return true if State is ObjectiveState.Completed', () => {
            objective.state = ObjectiveState.Completed;
            expect(objective.isCompleted()).to.be.true;
        });

        it('should return true if State is ObjectiveState.CompletedByOpponent', () => {
            objective.state = ObjectiveState.CompletedByOpponent;
            expect(objective.isCompleted()).to.be.true;
        });

        it('should return false if state is ObjectiveState.NotCompleted', () => {
            objective.state = ObjectiveState.NotCompleted;
            expect(objective.isCompleted()).to.be.false;
        });
    });

    it('convertToData should return ObjectiveData with right values', () => {
        const expected: ObjectiveData = {
            name: objective.name,
            description: objective.description,
            bonusPoints: objective.bonusPoints,
            state: objective.state,
            isPublic: objective.isPublic,
            progress: objective.progress,
            maxProgress: objective['maxProgress'],
        };
        const actual: ObjectiveData = objective.convertToData();
        expect(actual).to.deep.equal(expected);
    });

    describe('updateObjective', () => {
        let isCompletedStub: SinonStub;
        let updateProgressSpy: unknown;
        let validationParameters: ObjectiveValidationParameters;

        beforeEach(() => {
            isCompletedStub = stub(objective, 'isCompleted').returns(false);
            validationParameters = {} as unknown as ObjectiveValidationParameters;
            updateProgressSpy = chai.spy.on(objective, 'updateProgress', () => {});
        });

        afterEach(() => {
            isCompletedStub.restore();
        });

        it('should call updateProgress', () => {
            objective.updateObjective(validationParameters);
            expect(updateProgressSpy).to.have.been.called.with(validationParameters);
        });

        it('if progress exceeded maxProgress, should set state to Completed', () => {
            objective.progress = objective['maxProgress'] + 1;
            objective.updateObjective(validationParameters);
            expect(objective.state).to.equal(ObjectiveState.Completed);
        });

        it('if progress is maxProgress, should set state to Completed', () => {
            objective.progress = objective['maxProgress'];
            objective.updateObjective(validationParameters);
            expect(objective.state).to.equal(ObjectiveState.Completed);
        });

        it('if progress does NOT exceed maxProgress, should NOT set state to Completed', () => {
            objective.progress = objective['maxProgress'] - 1;
            objective.updateObjective(validationParameters);
            expect(objective.state).to.equal(ObjectiveState.NotCompleted);
        });

        it('should return false if objective is already completed', () => {
            isCompletedStub.returns(true);
            expect(objective.updateObjective(validationParameters)).to.be.false;
        });

        it('should return true if objective is NOT completed', () => {
            isCompletedStub.returns(false);
            expect(objective.updateObjective(validationParameters)).to.be.true;
        });
    });
});
