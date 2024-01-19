import { AbstractObjective } from '@app/classes/objectives/abstract-objective/abstract-objective';
import { AllVowelsObjective } from '@app/classes/objectives/all-vowels/all-vowels';
import { AlphabeticOrderObjective } from '@app/classes/objectives/alphabetic-order/alphabetic-order';
import { ConsecutivePlaceOrientationObjective } from '@app/classes/objectives/consecutive-place-orientation/consecutive-place-orientation';
import { FourVowelsWordObjective } from '@app/classes/objectives/four-vowels-word/four-vowels-word';
import { PlaceFiveLettersFiveTimesObjective } from '@app/classes/objectives/place-five-letters-five-times/place-five-letters-five-times';
import { TenLetterWord } from '@app/classes/objectives/ten-letter-word/ten-letter-word';
import { ThreeWordsPlacement } from '@app/classes/objectives/three-word-placement/three-word-placement';
import { TwoTenLetter } from '@app/classes/objectives/two-ten-letter/two-ten-letter';
import { LetterValue } from '@app/classes/tile';

export const GENERATE_LIST_OF_ALL_OBJECTIVES = (): AbstractObjective[] => {
    return [
        new ThreeWordsPlacement(),
        new AllVowelsObjective(),
        new TenLetterWord(),
        new ConsecutivePlaceOrientationObjective(),
        new TwoTenLetter(),
        new PlaceFiveLettersFiveTimesObjective(),
        new FourVowelsWordObjective(),
        new AlphabeticOrderObjective(),
    ];
};

export const NUMBER_OF_OBJECTIVES_IN_GAME = 4;

export const OBJECTIVE_COMPLETE_MESSAGE = (name: string, bonusPoints: number) => ` complété l'objectif **${name}** pour ${bonusPoints} points`;

export const VOWELS = (): LetterValue[] => ['A', 'E', 'I', 'O', 'U', 'Y'];
