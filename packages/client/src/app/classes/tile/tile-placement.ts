import { Position } from '@app/classes/board-navigator/position';
import Tile from './tile';

export interface TilePlacement {
    tile: Tile;
    position: Position;
}
