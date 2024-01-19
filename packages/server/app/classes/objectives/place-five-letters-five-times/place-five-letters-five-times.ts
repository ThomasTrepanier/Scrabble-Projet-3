import { AbstractObjective } from '@app/classes/objectives/abstract-objective/abstract-objective';
import { ObjectiveValidationParameters } from '@app/classes/objectives/validation-parameters';

export const NAME = '5 X 5';
export const DESCRIPTION = 'Placer exactement 5 lettres sur le plateau à 5 tours différents';
export const BONUS_POINTS = 50;
export const SHOULD_RESET = false;
export const MAX_PROGRESS = 5;
export const NUMBER_OF_LETTERS_TO_PLACE = 5;

export class PlaceFiveLettersFiveTimesObjective extends AbstractObjective {
    constructor() {
        super(NAME, DESCRIPTION, BONUS_POINTS, SHOULD_RESET, MAX_PROGRESS);
    }

    updateProgress(validationParameters: ObjectiveValidationParameters): void {
        if (validationParameters.wordPlacement.tilesToPlace.length === NUMBER_OF_LETTERS_TO_PLACE) this.progress++;
    }

    clone(): AbstractObjective {
        const clone = new PlaceFiveLettersFiveTimesObjective();
        clone.progress = this.progress;
        clone.state = this.state;
        clone.isPublic = this.isPublic;
        return clone;
    }
}
