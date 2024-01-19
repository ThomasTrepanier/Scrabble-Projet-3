import { LetterValue as LetterValueCommon } from '@common/models/game';

export type LetterValue = LetterValueCommon;

export interface TileData {
    letter: LetterValue;
    amount: number;
    score: number;
}

export interface LetterDistributionData {
    tiles: TileData[];
}

export interface TileReserveData {
    letter: LetterValue;
    amount: number;
}
