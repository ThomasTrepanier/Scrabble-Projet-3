import { Vec2 } from '@app/classes/board/vec2';
import { LetterValue } from '@app/classes/tile';

export const LETTER_VALUES: LetterValue[] = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
    '*',
];

export const ALPHABET: string[] = [
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z',
];

export const BLANK_TILE_LETTER_VALUE: LetterValue = '*';

export const BOARD_SIZE: Vec2 = { x: 15, y: 15 };
export const UNDEFINED_BOARD_SIZE: Vec2 = { x: -1, y: -1 };
export const VALID_MULTIPLIERS: number[] = [2, 3];
export const INITIAL_POSITION: Vec2 = { x: 7, y: 7 };

export const INVALID_WORD_TIMEOUT = 3000;

export const SYSTEM_ID = 'system';
export const SYSTEM_ERROR_ID = 'system-error';

export const WINNER_MESSAGE = (winnerName: string) => `**Félicitations à ${winnerName} pour votre victoire!**`;
export const IS_REQUESTING = true;
export const IS_OPPONENT = false;

export const NOT_FOUND = -1;

export const GOOD_LUCK_MESSAGE = 'Bonne chance!';

export const MAX_TILES_PER_PLAYER = 7;
export const BINGO_BONUS_POINTS = 50;

export const HIGH_SCORE_COUNT = 5;

export const USER_STATS_PRECISION = 2;

export const OBSERVER_REPLACE_JV_MESSAGE = ' Un observateur a remplacé un joueur virtuel';
