/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Position } from './position';

export type MultiplierValue = 2 | 3;
export enum MultiplierEffect {
    LETTER = 'Lettre',
    WORD = 'Mot',
}

export interface ScoreMultiplier {
    multiplierEffect: MultiplierEffect;
    multiplier: MultiplierValue;
}

export type Multiplier = ScoreMultiplier | null;

export interface Square {
    tile: Tile | null;
    position: Position;
    scoreMultiplier: Multiplier;
    wasMultiplierUsed: boolean;
    isCenter: boolean;
}

export interface Board {
    grid: Square[][];
}

export interface Tile {
    letter: LetterValue;
    value: number;
    isBlank?: boolean;
    playedLetter?: LetterValue; // Used when letter is *
}

export type LetterValue =
    | 'A'
    | 'B'
    | 'C'
    | 'D'
    | 'E'
    | 'F'
    | 'G'
    | 'H'
    | 'I'
    | 'J'
    | 'K'
    | 'L'
    | 'M'
    | 'N'
    | 'O'
    | 'P'
    | 'Q'
    | 'R'
    | 'S'
    | 'T'
    | 'U'
    | 'V'
    | 'W'
    | 'X'
    | 'Y'
    | 'Z'
    | '*';
