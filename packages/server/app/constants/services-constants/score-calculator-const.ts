import { Position } from '@app/classes/board';
import { Square } from '@app/classes/square';
import { MultiplierEffect } from '@app/classes/square/score-multiplier';
import { Tile } from '@app/classes/tile';

export const USED_MULTIPLIER = true;
export const NOT_USED_MULTIPLIER = false;
export const DEFAULT_TILE_VALUE = 10;
export const DEFAULT_WORD_MULTIPLIER = 2;
export const DEFAULT_LETTER_MULTIPLIER = 2;
export const DEFAULT_MULTIPLIER = 1;
export const DEFAULT_SCORE = 0;
export const EMPTY_WORDS: [Square, Tile][][] = [];
export const EMPTY_WORD: [Square, Tile][] = [];
export const GENERIC_LETTER_1: [Square, Tile] = [
    {
        tile: null,
        position: new Position(0, 0),
        scoreMultiplier: { multiplier: 2, multiplierEffect: MultiplierEffect.WORD },
        wasMultiplierUsed: false,
        isCenter: false,
    },
    { letter: 'X', value: 10 },
];

export const GENERIC_LETTER_2: [Square, Tile] = [
    {
        tile: null,
        position: new Position(0, 0),
        scoreMultiplier: { multiplier: 2, multiplierEffect: MultiplierEffect.LETTER },
        wasMultiplierUsed: false,
        isCenter: false,
    },
    { letter: 'N', value: 1 },
];

export const GENERIC_LETTER_3: [Square, Tile] = [
    {
        tile: null,
        position: new Position(0, 0),
        scoreMultiplier: null,
        wasMultiplierUsed: false,
        isCenter: false,
    },
    { letter: 'C', value: 3 },
];

export const GENERIC_WORDS = [
    [GENERIC_LETTER_1, GENERIC_LETTER_3],
    [GENERIC_LETTER_1, GENERIC_LETTER_2],
];

export const MAX_LENGTH_TILES_TO_PLACE: Tile[] = [
    { letter: 'A', value: 1 },
    { letter: 'F', value: 0 },
    { letter: 'C', value: 1 },
    { letter: 'C', value: 1 },
    { letter: 'C', value: 1 },
    { letter: 'C', value: 1 },
    { letter: 'C', value: 1 },
];

export const GENERIC_WORDS_SCORE = 50;
