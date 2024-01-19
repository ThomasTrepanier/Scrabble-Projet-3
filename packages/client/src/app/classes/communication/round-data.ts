import { PlayerData } from '.';

export interface RoundData {
    playerData: PlayerData;
    startTime: Date;
    limitTime: Date;
    completedTime: Date | null;
}
