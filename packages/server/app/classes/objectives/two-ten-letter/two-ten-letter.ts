import { AbstractObjective } from '@app/classes/objectives/abstract-objective/abstract-objective';
import { ObjectiveValidationParameters } from '@app/classes/objectives/validation-parameters';
import { Square } from '@app/classes/square';
import { LetterValue, Tile } from '@app/classes/tile';
import { StringConversion } from '@app/utils/string-conversion/string-conversion';

export const NAME = 'Extravagant';
export const DESCRIPTION = 'Former un mot contenant 2 lettres ou plus de 10 points';
export const BONUS_POINTS = 50;
export const LETTERS_WITH_TEN_POINTS_VALUE: LetterValue[] = ['K', 'W', 'X', 'Y', 'Z'];
export const NUMBER_OF_LETTERS_TO_USE = 2;

export class TwoTenLetter extends AbstractObjective {
    constructor() {
        super(NAME, DESCRIPTION, BONUS_POINTS, false, 1);
    }

    updateProgress(validationParameters: ObjectiveValidationParameters): void {
        this.progress = validationParameters.createdWords.find((createdWord: [Square, Tile][]) => {
            return createdWord.map(([, tile]) => tile).filter((tile: Tile) => this.isTileValueTenPoints(tile)).length >= NUMBER_OF_LETTERS_TO_USE;
        })
            ? this.maxProgress
            : this.progress;
    }

    clone(): TwoTenLetter {
        const clone: TwoTenLetter = new TwoTenLetter();
        clone.isPublic = this.isPublic;
        clone.state = this.state;
        clone.progress = this.progress;
        return clone;
    }

    private isTileValueTenPoints(tile: Tile): boolean {
        return LETTERS_WITH_TEN_POINTS_VALUE.includes(StringConversion.tileToString(tile) as LetterValue);
    }
}
