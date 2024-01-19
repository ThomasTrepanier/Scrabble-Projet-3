import { Square } from '@app/classes/square';
import { TileReserveData } from '@app/classes/tile/tile.types';
import { GameHistory } from '@common/models/game-history';
import { TypeOfId } from '@common/types/id';
import { PlayerData } from './player-data';
import { RoundData } from './round-data';

export interface GameUpdateData {
    player1?: PlayerData;
    player2?: PlayerData;
    player3?: PlayerData;
    player4?: PlayerData;
    isGameOver?: boolean;
    idGameHistory?: TypeOfId<GameHistory>;
    winners?: string[];
    board?: Square[];
    round?: RoundData;
    tileReserve?: TileReserveData[];
}
