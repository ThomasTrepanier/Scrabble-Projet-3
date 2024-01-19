import Player from '@app/classes/player/player';
import { Action } from '@app/classes/actions';
import { Tile } from '@app/classes/tile';
import { Board } from '@app/classes/board';

export interface Round {
    player: Player;
    startTime: Date;
    limitTime: Date;
    tiles: Tile[];
    board: Board;
}

export interface CompletedRound extends Round {
    completedTime: Date;
    actionPlayed: Action;
}
