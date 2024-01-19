import { Multiplier as MultiplierCommon, Square as SquareCommon } from '@common/models/game';
import { Position } from '@app/classes/board';

export type Multiplier = MultiplierCommon;

export default interface Square extends SquareCommon {
    position: Position;
}
