import { HttpException } from '@app/classes/http-exception/http-exception';
import { LetterValue, Tile } from '@app/classes/tile';
import {
    AMOUNT_MUST_BE_GREATER_THAN_1,
    NOT_ENOUGH_TILES,
    TILE_NOT_IN_RESERVE,
    TILE_RESERVE_MUST_BE_INITIALIZED,
} from '@app/constants/classes-errors';
import { BLANK_TILE_LETTER_VALUE, LETTER_VALUES } from '@app/constants/game-constants';
import { LETTER_DISTRIBUTION } from '@app/constants/letter-distributions';
import { StatusCodes } from 'http-status-codes';
import 'mock-fs'; // required when running test. Otherwise compiler cannot resolve fs, path and __dirname

export default class TileReserve {
    private tiles: Tile[];
    private initialized: boolean;
    constructor() {
        this.tiles = [];
        this.initialized = false;
    }

    async init(): Promise<void> {
        LETTER_DISTRIBUTION.forEach((tile) => {
            for (let i = 0; i < tile.amount; ++i) {
                this.tiles.push({ letter: tile.letter as LetterValue, value: tile.score, isBlank: tile.letter === BLANK_TILE_LETTER_VALUE });
            }
        });
        this.initialized = true;
    }

    getTiles(amount: number): Tile[] {
        if (!this.initialized) throw new HttpException(TILE_RESERVE_MUST_BE_INITIALIZED, StatusCodes.INTERNAL_SERVER_ERROR);
        if (amount < 1) throw new HttpException(AMOUNT_MUST_BE_GREATER_THAN_1, StatusCodes.FORBIDDEN);
        const tilesToReturn: Tile[] = [];
        const tileToGive = Math.min(this.tiles.length, amount);
        for (let i = 0; i < tileToGive; ++i) {
            const tile = this.tiles[Math.floor(Math.random() * this.tiles.length)];
            tilesToReturn.push(tile);
            this.removeTile(tile);
        }
        return tilesToReturn;
    }

    swapTiles(tilesToSwap: Tile[]): Tile[] {
        if (!this.initialized) throw new HttpException(TILE_RESERVE_MUST_BE_INITIALIZED, StatusCodes.INTERNAL_SERVER_ERROR);
        if (this.tiles.length < tilesToSwap.length) throw new HttpException(NOT_ENOUGH_TILES, StatusCodes.FORBIDDEN);

        const tilesToReturn: Tile[] = this.getTiles(tilesToSwap.length);
        this.tiles = this.tiles.concat(tilesToSwap);

        return tilesToReturn;
    }

    getTilesLeftPerLetter(): Map<LetterValue, number> {
        if (!this.initialized) throw new HttpException(TILE_RESERVE_MUST_BE_INITIALIZED, StatusCodes.INTERNAL_SERVER_ERROR);
        const map = new Map<LetterValue, number>();

        LETTER_VALUES.forEach((letter) => {
            map.set(letter, this.tiles.filter((t) => t.letter === letter).length);
        });

        return map;
    }

    getTotalTilesLeft(): number {
        let totalTilesLeft = 0;
        this.getTilesLeftPerLetter().forEach((value: number) => {
            totalTilesLeft += value;
        });
        return totalTilesLeft;
    }

    isInitialized(): boolean {
        return this.initialized;
    }

    private removeTile(tile: Tile): void {
        const index = this.tiles.indexOf(tile);
        if (index < 0) throw new HttpException(TILE_NOT_IN_RESERVE, StatusCodes.NOT_FOUND);
        this.tiles.splice(index, 1);
    }
}
