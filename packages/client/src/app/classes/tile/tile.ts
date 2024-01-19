import { LetterValue } from './tile.types';

export default class Tile {
    letter: LetterValue;
    value: number;
    isBlank?: boolean;
    playedLetter?: LetterValue; // Used when letter is *

    constructor(letter: LetterValue, value: number, isBlank?: boolean) {
        this.letter = letter;
        this.value = value;
        this.isBlank = isBlank ?? false;
    }
}
