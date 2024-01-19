import { AbstractObjective } from '@app/classes/objectives/abstract-objective/abstract-objective';
import { ObjectiveValidationParameters } from '@app/classes/objectives/validation-parameters';
import { LetterValue } from '@app/classes/tile';
import { VOWELS } from '@app/constants/services-constants/objective-const';
import { StringConversion } from '@app/utils/string-conversion/string-conversion';

export const NAME = 'Les bases';
export const DESCRIPTION = 'Jouer chaque voyelle au moins une fois (inclue les lettres blanches)';
export const BONUS_POINTS = 30;

const SHOULD_RESET = false;

export class AllVowelsObjective extends AbstractObjective {
    private vowelsLeftToPlay: LetterValue[];

    constructor() {
        super(NAME, DESCRIPTION, BONUS_POINTS, SHOULD_RESET, VOWELS().length);
        this.vowelsLeftToPlay = VOWELS();
    }
    updateProgress(validationParameters: ObjectiveValidationParameters): void {
        const letterPlayed: LetterValue[] = validationParameters.wordPlacement.tilesToPlace.map(
            (t) => StringConversion.tileToString(t) as LetterValue,
        );
        letterPlayed.forEach((letter: LetterValue) => {
            if (this.vowelsLeftToPlay.includes(letter)) {
                this.progress++;
                this.vowelsLeftToPlay.splice(this.vowelsLeftToPlay.indexOf(letter), 1);
            }
        });
    }

    clone(): AllVowelsObjective {
        const clone = new AllVowelsObjective();
        clone.progress = this.progress;
        clone.state = this.state;
        clone.isPublic = this.isPublic;
        clone.vowelsLeftToPlay = [...this.vowelsLeftToPlay.copyWithin(0, 0)];
        return clone;
    }
}
