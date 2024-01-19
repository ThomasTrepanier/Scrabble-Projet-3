import { UserRequest } from '@app/types/user';
import { TilePlacement } from '@common/models/tile-placement';
import { VirtualPlayerLevel } from '@common/models/virtual-player-level';
import { Request } from 'express';

export interface GameRequestParams {
    gameId: string;
    playerId: string;
}

export type GameRequest = Request & { params: GameRequestParams };

export type CreateGameRequest = Request & { params: { playerId: string } };

export type HighScoresRequest = Request & { params: { playerId: string } };

export type DictionaryRequest = Request;

export type VirtualPlayerProfilesRequest = Request & { params: { level?: VirtualPlayerLevel } };

export type GameHistoriesRequest = Request & { params: { playerId: string } };

export type GroupsRequest = Request & { params: { playerId: string } };

export type PlaceRequest = UserRequest<{ tilePlacement: TilePlacement[] }> & { params: { gameId: string } };

export type TokenRequest = UserRequest<{ firebaseToken: string }>;
