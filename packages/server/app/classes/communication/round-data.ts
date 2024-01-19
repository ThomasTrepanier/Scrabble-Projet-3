import { PlayerData } from './player-data';

export interface RoundData {
    playerData: PlayerData;
    startTime: Date;
    limitTime: Date;
}
