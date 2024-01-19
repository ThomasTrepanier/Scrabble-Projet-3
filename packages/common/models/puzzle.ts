import { Tile, Board } from './game';
import { ScoredWordPlacement } from './word-finding';

export interface Puzzle {
    board: Board;
    tiles: Tile[];
}

export enum PuzzleResultStatus {
    Won = 'Gagné',
    Valid = 'Valide',
    Invalid = 'Invalide',
    Abandoned = 'Abandonné',
    Timeout = 'Temps écoulé',
}

export interface PuzzleResult {
    userPoints: number;
    result: PuzzleResultStatus;
    targetPlacement: ScoredWordPlacement;
    allPlacements: ScoredWordPlacement[];
}

export type PuzzleResultSolution = Pick<PuzzleResult, 'targetPlacement' | 'allPlacements'>;


export interface DailyPuzzleResult {
    username: string;
    avatar: string;
    score: number;
}

export interface DailyPuzzleLeaderboard {
    leaderboard: DailyPuzzleResult[];
    userScore: number;
    userRank: number;
    totalPlayers: number;
}

export const PUZZLE_ABANDONED_OR_FAILED = -1;
export const PUZZLE_NOT_COMPLETED = -2;
