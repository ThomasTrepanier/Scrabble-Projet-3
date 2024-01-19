import { Orientation } from '@app/classes/board';
import { Tile } from '@app/classes/tile';
import { ActionType } from '@common/models/action';

export interface ActionPlacePayload {
    startPosition: { column: number; row: number };
    orientation: Orientation;
    tiles: Tile[];
}

export interface ActionExchangePayload {
    tiles: Tile[];
}
export interface ActionData<T extends unknown = unknown> {
    type: ActionType;
    input: string;
    payload: T;
}
