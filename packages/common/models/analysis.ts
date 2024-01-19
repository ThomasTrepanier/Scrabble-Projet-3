import { Tile, Board } from "./game";
import { ScoredWordPlacement } from "./word-finding";
import { ActionType } from './action';
import { TypeOfId } from "../types/id";
import { User } from "./user";
import { GameHistory } from "./game-history";

export interface CriticalMomentBase {
    tiles: Tile[];
    actionType: ActionType;
    playedPlacement?: ScoredWordPlacement;
    bestPlacement: ScoredWordPlacement;
}

export interface CriticalMoment extends CriticalMomentBase {
    board: Board;
}

export interface Analysis {
    idGameHistory: TypeOfId<GameHistory>;
    idUser: TypeOfId<User>;
    criticalMoments: CriticalMoment[];
}

export interface AnalysisData {
    idGameHistory: TypeOfId<GameHistory>;
    idUser: TypeOfId<User>;
    idAnalysis: number;
}

export interface CriticalMomentData {
    idCriticalMoment: number;
    actionType: ActionType;
    tiles: string;
    board: string;
    idPlayedPlacement?: TypeOfId<PlacementData>;
    idBestPlacement: TypeOfId<PlacementData>;
    idAnalysis: TypeOfId<AnalysisData>;
}

export interface PlacementData {
    idPlacement: number;
    tilesToPlace: string;
    isHorizontal: boolean;
    score: number;
    row: number;
    column: number;
}

export enum AnalysisRequestInfoType {
    ID_GAME = 'idGameHistory',
    ID_ANALYSIS = 'idAnalysis',
}