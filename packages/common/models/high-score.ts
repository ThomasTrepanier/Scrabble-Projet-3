import { NoId } from '../types/id';

export interface HighScore {
    idHighScore: number;
    score: number;
}

export interface SingleHighScore extends NoId<HighScore> {
    rank?: number;
    name: string;
}

export interface HighScorePlayer {
    idHighScore: number;
    name: string;
}

export interface HighScoreWithPlayers extends HighScore {
    names: string[];
}

export interface HighScoresData {
    highScores: NoId<HighScoreWithPlayers>[];
}
