import { Position } from '@app/classes/board-navigator/position';
import { Tile, TilePlacement } from '@app/classes/tile';

export const comparePositions = (a: Position, b: Position): boolean => {
    return a.row === b.row && a.column === b.column;
};

export const compareTile = (a: Tile, b: Tile): boolean => {
    return a.letter === b.letter && a.value === b.value;
};

export const comparePlacements = (a: TilePlacement, b: TilePlacement): boolean => {
    return comparePositions(a.position, b.position) && compareTile(a.tile, b.tile);
};
