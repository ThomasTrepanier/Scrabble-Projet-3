import { PlayerData } from '@app/classes/communication/';
import { Tile } from '@app/classes/tile';
import { PublicUser } from '@common/models/user';
import { DEFAULT_PLAYER_RATING } from '@common/models/constants';
export default class Player {
    id: string;
    publicUser: PublicUser;
    score: number;
    adjustedRating: number;
    ratingVariation: number;
    private tiles: Tile[];

    constructor(id: string, publicUser: PublicUser, tiles: Tile[]) {
        this.id = id;
        this.publicUser = publicUser;
        this.score = 0;
        this.adjustedRating = DEFAULT_PLAYER_RATING;
        this.ratingVariation = 0;
        this.tiles = [...tiles];
    }

    getTiles(): Tile[] {
        return [...this.tiles];
    }

    updatePlayerData(playerData: PlayerData): void {
        this.id = playerData.newId ? playerData.newId : this.id;
        this.publicUser = playerData.publicUser ? playerData.publicUser : this.publicUser;
        this.score = playerData.score ? playerData.score : this.score;
        this.adjustedRating = playerData.adjustedRating ? playerData.adjustedRating : this.adjustedRating;
        this.ratingVariation = playerData.ratingVariation ? playerData.ratingVariation : this.ratingVariation;
        this.tiles = playerData.tiles ? [...playerData.tiles] : this.tiles;
    }
}
