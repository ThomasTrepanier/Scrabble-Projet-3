import Player from '@app/classes/player/player';
import { Analysis } from '@common/models/analysis';

export interface PlayerAnalysis {
    player: Player;
    analysis: Analysis;
}
