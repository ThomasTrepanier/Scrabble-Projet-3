/* eslint-disable @typescript-eslint/no-magic-numbers */
import Game from '@app/classes/game/game';
import { AbstractObjective } from '@app/classes/objectives/abstract-objective/abstract-objective';
import { ObjectiveValidationParameters } from '@app/classes/objectives/validation-parameters';
import { WordPlacement } from '@app/classes/word-finding';

export const TEST_OBJECTIVE_MAX_PROGRESS = 3;

export const EMPTY_VALIDATION_PARAMETERS: ObjectiveValidationParameters = {
    game: undefined as unknown as Game,
    wordPlacement: undefined as unknown as WordPlacement,
    scoredPoints: 0,
    createdWords: [],
};

export class TestObjective extends AbstractObjective {
    constructor(name: string, shouldReset: boolean = false) {
        super(name, '', 0, shouldReset, TEST_OBJECTIVE_MAX_PROGRESS);
    }
    // eslint-disable-next-line no-unused-vars
    updateProgress(validationParameters: ObjectiveValidationParameters): void {
        this.progress = this.maxProgress;
    }
    clone(): AbstractObjective {
        const clone = new TestObjective(this.name, this.shouldResetOnInvalidWord);
        clone.description = this.description;
        clone.bonusPoints = this.bonusPoints;
        clone.progress = this.progress;
        clone.state = this.state;
        clone.isPublic = this.isPublic;
        return clone;
    }
}

export const generateTestObjective = (index: number) => {
    const objective = new TestObjective(String(index));
    return objective;
};

export const generateResetableTestObjective = (index: number) => {
    const objective = new TestObjective(String(index), true);
    return objective;
};

export const generateGameObjectives = () => {
    const publicObjectives = new Set([generateTestObjective(1), generateTestObjective(2)]);
    const player1Objective = generateTestObjective(3);
    const player2Objective = generateTestObjective(4);

    return { publicObjectives, player1Objective, player2Objective };
};
