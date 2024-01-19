import { Tile } from './game';
import { Orientation, Position } from './position';

export interface WordPlacement {
    tilesToPlace: Tile[];
    orientation: Orientation;
    startPosition: Position;
}

export interface ScoredWordPlacement extends WordPlacement {
    score: number;
}
