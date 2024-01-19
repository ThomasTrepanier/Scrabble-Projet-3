import { AbstractObjective } from '@app/classes/objectives/abstract-objective/abstract-objective';
import { ObjectiveValidationParameters } from '@app/classes/objectives/validation-parameters';
import { Square } from '@app/classes/square';
import { Tile } from '@app/classes/tile';

export const NAME = 'Longuement attendu';
export const DESCRIPTION = 'Former un mot de 10 lettres ou plus';
export const BONUS_POINTS = 50;
export const NUMBER_OF_LETTERS_TO_COMPLETE = 10;

export class TenLetterWord extends AbstractObjective {
    constructor() {
        super(NAME, DESCRIPTION, BONUS_POINTS, false, 1);
    }

    updateProgress(validationParameters: ObjectiveValidationParameters): void {
        this.progress = validationParameters.createdWords.find((createdWord: [Square, Tile][]) => createdWord.length >= NUMBER_OF_LETTERS_TO_COMPLETE)
            ? this.maxProgress
            : this.progress;
    }

    clone(): TenLetterWord {
        const clone = new TenLetterWord();
        clone.progress = this.progress;
        clone.state = this.state;
        clone.isPublic = this.isPublic;
        return clone;
    }
}
