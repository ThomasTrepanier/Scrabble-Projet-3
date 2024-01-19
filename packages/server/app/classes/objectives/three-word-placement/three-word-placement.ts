import { AbstractObjective } from '@app/classes/objectives/abstract-objective/abstract-objective';
import { ObjectiveValidationParameters } from '@app/classes/objectives/validation-parameters';

export const NAME = 'Éloquent';
export const DESCRIPTION = 'Former 3 mots en un seul placement';
export const BONUS_POINTS = 30;
export const NUMBER_OF_WORDS_TO_CREATE = 3;

const SHOULD_RESET = false;

export class ThreeWordsPlacement extends AbstractObjective {
    constructor() {
        super(NAME, DESCRIPTION, BONUS_POINTS, SHOULD_RESET, 1);
    }

    updateProgress(validationParameters: ObjectiveValidationParameters): void {
        this.progress = validationParameters.createdWords.length >= NUMBER_OF_WORDS_TO_CREATE ? this.maxProgress : this.progress;
    }

    clone(): ThreeWordsPlacement {
        const clone = new ThreeWordsPlacement();
        clone.progress = this.progress;
        clone.state = this.state;
        clone.isPublic = this.isPublic;
        return clone;
    }
}
