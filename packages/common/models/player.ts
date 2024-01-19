import { Tile } from "./game";
import { PublicUser } from "./user";

export interface PlayerData {
    id: string;
    newId?: string;
    publicUser?: PublicUser;
    score?: number;
    tiles?: Tile[];
    isConnected?: boolean;
    ratingVariation?: number;
    adjustedRating?: number;
}