import { HttpException } from '@app/classes/http-exception/http-exception';
import Player from '@app/classes/player/player';
import { Tile } from '@app/classes/tile';
import { ERROR_PLAYER_DOESNT_HAVE_TILE } from '@app/constants/classes-errors';
import { BLANK_TILE_LETTER_VALUE } from '@app/constants/game-constants';
import { StatusCodes } from 'http-status-codes';

export class ActionUtils {
    static getTilesFromPlayer(tilesToPlay: Tile[], player: Player, allowWildcard: boolean = true): [played: Tile[], unplayed: Tile[]] {
        const unplayedTiles: Tile[] = player.tiles.map((t) => ({ ...t }));
        const playedTiles: Tile[] = [];

        for (const tile of tilesToPlay) {
            const index = this.getIndexOfTile(unplayedTiles, tile, allowWildcard);
            if (index < 0) throw new HttpException(ERROR_PLAYER_DOESNT_HAVE_TILE, StatusCodes.FORBIDDEN);

            const playerTile = unplayedTiles.splice(index, 1)[0];
            if (this.isBlankTile(playerTile)) {
                playerTile.playedLetter = tile.letter;
                playerTile.isBlank = true;
            }
            playedTiles.push(playerTile);
        }

        return [playedTiles, unplayedTiles];
    }

    private static getIndexOfTile = (tiles: Tile[], tile: Tile, allowWildcard: boolean = true): number => {
        let index = tiles.findIndex((t) => t.letter === tile.letter && t.value === tile.value);

        if (index < 0 && allowWildcard) {
            index = tiles.findIndex((t) => t.letter === BLANK_TILE_LETTER_VALUE);
        }

        return index;
    };

    private static isBlankTile(tile: Tile): boolean {
        return tile.isBlank || tile.letter === BLANK_TILE_LETTER_VALUE;
    }
}
