import { Player } from '@app/classes/player';

export interface Round {
    player: Player;
    startTime: Date;
    limitTime: Date;
    completedTime: Date | null;
}
