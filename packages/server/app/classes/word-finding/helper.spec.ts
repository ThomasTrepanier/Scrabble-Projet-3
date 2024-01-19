import { BoardPlacement, DictionarySearchResult, PerpendicularWord, ScoredWordPlacement } from '.';
import { LetterValue, Tile } from '@app/classes/tile';
import { Board, Orientation, Position } from '@app/classes/board';
import { Square } from '@app/classes/square';

export type LetterValues = (LetterValue | ' ')[][];

export const DEFAULT_BOARD_PLACEMENT: BoardPlacement = {
    letters: [],
    perpendicularLetters: [],
    position: new Position(0, 0),
    orientation: Orientation.Horizontal,
    minSize: 0,
    maxSize: 0,
};
export const DEFAULT_WORD_RESULT: DictionarySearchResult = {
    word: 'abc',
    perpendicularWords: [],
};
export const DEFAULT_WORD_PLACEMENT: ScoredWordPlacement = {
    tilesToPlace: [],
    orientation: Orientation.Horizontal,
    startPosition: new Position(0, 0),
    score: 0,
};
export const DEFAULT_SQUARE: Square = {
    tile: null,
    position: new Position(0, 0),
    scoreMultiplier: null,
    wasMultiplierUsed: false,
    isCenter: false,
};
export const DEFAULT_TILE: Tile = {
    letter: 'A',
    value: 0,
};
export const DEFAULT_PERPENDICULAR_WORD: PerpendicularWord = {
    word: 'abcd',
    distance: 1,
    junctionDistance: 1,
};

export const boardFromLetterValues = (letterValues: LetterValues) => {
    const grid: Square[][] = [];

    letterValues.forEach((line, row) => {
        const boardRow: Square[] = [];

        line.forEach((letter, column) => {
            boardRow.push({
                tile: letter === ' ' ? null : { letter: letter as LetterValue, value: 1 },
                position: new Position(row, column),
                scoreMultiplier: null,
                wasMultiplierUsed: false,
                isCenter: false,
            });
        });

        grid.push(boardRow);
    });

    return new Board(grid);
};

export const lettersToTiles = (letters: LetterValue[]) => letters.map<Tile>((letter) => ({ letter, value: 0 }));
