import { AbstractObjective } from '@app/classes/objectives/abstract-objective/abstract-objective';
import { ObjectiveValidationParameters } from '@app/classes/objectives/validation-parameters';
import { StringConversion } from '@app/utils/string-conversion/string-conversion';

export const NAME = 'Placement ordonné';
export const DESCRIPTION = 'Former un mot de 4 lettres ou plus dont les lettres sont placées en ordre alphabétique';
export const BONUS_POINTS = 60;
export const SHOULD_RESET = false;
export const MAX_PROGRESS = 1;

export const REQUIRED_NUMBER_OF_LETTERS = 4;

export class AlphabeticOrderObjective extends AbstractObjective {
    constructor() {
        super(NAME, DESCRIPTION, BONUS_POINTS, SHOULD_RESET, MAX_PROGRESS);
    }

    updateProgress(validationParameters: ObjectiveValidationParameters): void {
        for (const createdWord of validationParameters.createdWords) {
            const wordLetters: string[] = createdWord.map(([, tile]) => StringConversion.tileToString(tile));
            if (wordLetters.length < REQUIRED_NUMBER_OF_LETTERS) continue;

            const sortedWordLetters = [...wordLetters].sort();

            if (sortedWordLetters.join('') === wordLetters.join('')) {
                this.progress = this.maxProgress;
                break;
            }
        }
    }

    clone(): AlphabeticOrderObjective {
        const clone = new AlphabeticOrderObjective();
        clone.progress = this.progress;
        clone.state = this.state;
        clone.isPublic = this.isPublic;
        return clone;
    }
}
