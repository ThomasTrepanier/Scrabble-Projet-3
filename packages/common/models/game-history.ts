import { IdOf, NoId, TypeOfId } from '../types/id';
import { AnalysisData } from './analysis';
import { User } from './user';

export interface GameHistoryPlayer {
    idUser?: TypeOfId<User>;
    idGameHistory: number;
    score: number;
    isVirtualPlayer: boolean;
    isWinner: boolean;
    ratingVariation: number;
    hasAbandoned: boolean;
}

export interface GameHistory {
    idGameHistory: number;
    startTime: Date;
    endTime: Date;
}

export type GameHistoryPlayerCreation = Omit<GameHistoryPlayer, IdOf<GameHistory>>;

export type GameHistoryCreation = { gameHistory: NoId<GameHistory>; players: GameHistoryPlayerCreation[] };

export type GameHistoryForUser = NoId<GameHistory> & Pick<GameHistoryPlayer, 'score' | 'isWinner' | 'ratingVariation' | 'hasAbandoned'> & Pick<AnalysisData, 'idAnalysis'>;
