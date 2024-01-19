import { LetterValue, TileData } from '@app/classes/tile/tile.types';

export const LETTER_DISTRIBUTION: TileData[] = [
    { letter: 'A', amount: 9, score: 1 },
    { letter: 'B', amount: 2, score: 3 },
    { letter: 'C', amount: 2, score: 3 },
    { letter: 'D', amount: 3, score: 2 },
    { letter: 'E', amount: 15, score: 1 },
    { letter: 'F', amount: 2, score: 4 },
    { letter: 'G', amount: 2, score: 2 },
    { letter: 'H', amount: 2, score: 4 },
    { letter: 'I', amount: 8, score: 1 },
    { letter: 'J', amount: 1, score: 8 },
    { letter: 'K', amount: 1, score: 10 },
    { letter: 'L', amount: 5, score: 1 },
    { letter: 'M', amount: 3, score: 2 },
    { letter: 'N', amount: 6, score: 1 },
    { letter: 'O', amount: 6, score: 1 },
    { letter: 'P', amount: 2, score: 3 },
    { letter: 'Q', amount: 1, score: 8 },
    { letter: 'R', amount: 6, score: 1 },
    { letter: 'S', amount: 6, score: 1 },
    { letter: 'T', amount: 6, score: 1 },
    { letter: 'U', amount: 6, score: 1 },
    { letter: 'V', amount: 2, score: 4 },
    { letter: 'W', amount: 1, score: 10 },
    { letter: 'X', amount: 1, score: 10 },
    { letter: 'Y', amount: 1, score: 10 },
    { letter: 'Z', amount: 1, score: 10 },
    { letter: '*', amount: 2, score: 0 },
];

export const letterDistributionMap: Map<LetterValue, TileData> = new Map(LETTER_DISTRIBUTION.map((dist) => [dist.letter, dist]));
