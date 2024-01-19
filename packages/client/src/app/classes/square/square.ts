import { Position } from '@app/classes/board-navigator/position';
import { Tile } from '@app/classes/tile';
import { Multiplier } from '@common/models/game';

export default interface Square {
    tile: Tile | null;
    position: Position;
    scoreMultiplier: Multiplier;
    wasMultiplierUsed: boolean;
    isCenter: boolean;
}
