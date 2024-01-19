/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Tile } from '@app/classes/tile';
import Player from '@app/classes/player/player';
import { ActionUtils } from './action-utils';
import { expect } from 'chai';
import { stub } from 'sinon';
import { ERROR_PLAYER_DOESNT_HAVE_TILE } from '@app/constants/classes-errors';
import * as sinon from 'sinon';
import { UNKOWN_USER } from '@common/models/user';

const DEFAULT_PLAYER_ID = '1';

describe('ActionUtils', () => {
    describe('getTilesFromPlayer', () => {
        let player: Player;

        beforeEach(() => {
            player = new Player(DEFAULT_PLAYER_ID, UNKOWN_USER);
        });

        afterEach(() => {
            sinon.restore();
        });

        it('should return tiles to place and unplayed tiles', () => {
            const playerTiles: Tile[] = [
                { letter: 'A', value: 0 },
                { letter: 'B', value: 0 },
            ];
            const tilesToPlay: Tile[] = [playerTiles[0]];
            const unplayedTilesExpected: Tile[] = [playerTiles[1]];

            player.tiles = playerTiles;

            const [resultTilesToPlace, resultUnplayedTiles] = ActionUtils.getTilesFromPlayer(tilesToPlay, player);

            expect(tilesToPlay.every((t) => resultTilesToPlace.some((t2) => t.letter === t2.letter && t.value === t2.value))).to.be.true;
            expect(unplayedTilesExpected.every((t) => resultUnplayedTiles.some((t2) => t.letter === t2.letter && t.value === t2.value))).to.be.true;
        });

        it("should throw if playing letter the player doesn't have", () => {
            const playerTiles: Tile[] = [
                { letter: 'A', value: 0 },
                { letter: 'B', value: 0 },
            ];
            const tilesToPlay: Tile[] = [{ letter: 'C', value: 0 }];

            player.tiles = playerTiles;

            const INVALID_INDEX = -1;
            const s = stub(ActionUtils, <any>'getIndexOfTile')
                .onFirstCall()
                .returns(INVALID_INDEX);

            expect(() => ActionUtils.getTilesFromPlayer(tilesToPlay, player)).to.throw(ERROR_PLAYER_DOESNT_HAVE_TILE);

            s.restore();
        });

        it('should return tile with isBlank and playedLetter if *', () => {
            const playerTiles: Tile[] = [
                { letter: 'A', value: 0 },
                { letter: '*', value: 0 },
            ];
            const tilesToPlay: Tile[] = [{ letter: 'B', value: 0 }];

            player.tiles = playerTiles;

            const [[tile]] = ActionUtils.getTilesFromPlayer(tilesToPlay, player);

            expect(tile.isBlank).to.be.true;
            expect(tile.playedLetter).to.equal(tilesToPlay[0].letter);
        });
    });

    describe('getIndexOfTile', () => {
        it('should return index of tile in array', () => {
            const tiles: Tile[] = [
                { letter: 'A', value: 0 },
                { letter: 'B', value: 0 },
                { letter: 'C', value: 0 },
            ];

            const expected = 1;
            const result = ActionUtils['getIndexOfTile'](tiles, tiles[expected]);

            expect(result).to.equal(expected);
        });

        it('should return index of wildcard when tile not in array', () => {
            const tiles: Tile[] = [
                { letter: 'A', value: 0 },
                { letter: 'B', value: 0 },
                { letter: '*', value: 0 },
            ];
            const tile: Tile = { letter: 'Z', value: 0 };

            const expected = 2;
            const result = ActionUtils['getIndexOfTile'](tiles, tile);

            expect(result).to.equal(expected);
        });

        it('should return -1 when tile not in array', () => {
            const tiles: Tile[] = [
                { letter: 'A', value: 0 },
                { letter: 'B', value: 0 },
                { letter: 'C', value: 0 },
            ];
            const tile: Tile = { letter: 'Z', value: 0 };

            const expected = -1;
            const result = ActionUtils['getIndexOfTile'](tiles, tile);

            expect(result).to.equal(expected);
        });

        it('should return -1 when allowWildcard is false', () => {
            const tiles: Tile[] = [
                { letter: 'A', value: 0 },
                { letter: 'B', value: 0 },
                { letter: '*', value: 0 },
            ];
            const tile: Tile = { letter: 'Z', value: 0 };

            const expected = -1;
            const result = ActionUtils['getIndexOfTile'](tiles, tile, false);

            expect(result).to.equal(expected);
        });
    });
});
