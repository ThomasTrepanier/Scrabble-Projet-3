/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
import { LETTER_DISTRIBUTION_RELATIVE_PATH } from '@app/constants/classes-constants';
import { AMOUNT_MUST_BE_GREATER_THAN_1, TILE_NOT_IN_RESERVE, TILE_RESERVE_MUST_BE_INITIALIZED } from '@app/constants/classes-errors';
import { LETTER_VALUES } from '@app/constants/game-constants';
import { LETTER_DISTRIBUTION } from '@app/constants/letter-distributions';
import { expect, spy } from 'chai';
import * as mock from 'mock-fs'; // required when running test. Otherwise compiler cannot resolve fs, path and __dirname
import { join } from 'path';
import Tile from './tile';
import TileReserve from './tile-reserve';
import { LetterDistributionData, LetterValue } from './tile.types';

const mockLetterDistribution: LetterDistributionData = {
    tiles: [
        { letter: 'A', amount: 5, score: 1 },
        { letter: 'B', amount: 5, score: 1 },
        { letter: 'C', amount: 5, score: 1 },
    ],
};

// mockPaths must be of type any because keys must be dynamic
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockPaths: any = [];
mockPaths[join(__dirname, LETTER_DISTRIBUTION_RELATIVE_PATH)] = JSON.stringify(mockLetterDistribution);

describe('TileReserve', () => {
    let tileReserve: TileReserve;

    beforeEach(async () => {
        mock(mockPaths);

        tileReserve = new TileReserve();
        await tileReserve.init();
    });

    afterEach(() => {
        mock.restore();
    });

    it('should initialize', () => {
        expect(tileReserve.isInitialized()).to.equal(true);
    });

    describe('getTilesLeftPerLetter', () => {
        it('should have a specific amount of tiles for each letters', async () => {
            const letterMap = tileReserve.getTilesLeftPerLetter();
            const tilesData = LETTER_DISTRIBUTION;
            tilesData.forEach((tile) => {
                expect(letterMap.get(tile.letter as LetterValue)).to.equal(tile.amount);
            });
        });

        it('should have 0 for each when no letters are left', () => {
            tileReserve.getTiles(tileReserve['tiles'].length);
            const letterMap = tileReserve.getTilesLeftPerLetter();
            LETTER_VALUES.forEach((letter) => expect(letterMap.get(letter)).to.equal(0));
        });
    });

    describe('getTotalTilesLeft', () => {
        it('should call getTilesLeftPerLetter', () => {
            const getTilesLeftPerLetterSpy = spy.on(tileReserve, 'getTilesLeftPerLetter', () => {
                return new Map<LetterValue, number>([
                    ['A', 4],
                    ['B', 2],
                    ['C', 6],
                ]);
            });
            tileReserve.getTotalTilesLeft();
            expect(getTilesLeftPerLetterSpy).to.have.been.called();
        });

        it('should return expected value', () => {
            spy.on(tileReserve, 'getTilesLeftPerLetter', () => {
                return new Map<LetterValue, number>([
                    ['A', 4],
                    ['B', 2],
                    ['C', 6],
                ]);
            });
            expect(tileReserve.getTotalTilesLeft()).to.equal(12);
        });
    });

    describe('getTiles', () => {
        it('should throw error when get 0 tiles', () => {
            const amountToRemove = 0;
            expect(() => tileReserve.getTiles(amountToRemove)).to.throw(AMOUNT_MUST_BE_GREATER_THAN_1);
        });

        it('should remove tiles when getTiles (1)', () => {
            const amountToRemove = 1;
            const totalTiles = tileReserve['tiles'].length;
            testGetTilesOnSuccess(amountToRemove, totalTiles);
        });

        it('should remove tiles when getTiles (2)', () => {
            const amountToRemove = 2;
            const totalTiles = tileReserve['tiles'].length;
            testGetTilesOnSuccess(amountToRemove, totalTiles);
        });

        it('should remove tiles when getTiles (7)', () => {
            const amountToRemove = 7;
            const totalTiles = tileReserve['tiles'].length;
            testGetTilesOnSuccess(amountToRemove, totalTiles);
        });

        it('should remove tiles when getTiles (max - 1)', () => {
            const totalTiles = tileReserve['tiles'].length;
            const amountToRemove = totalTiles - 1;
            testGetTilesOnSuccess(amountToRemove, totalTiles);
        });

        it('should remove tiles when getTiles (max)', () => {
            const totalTiles = tileReserve['tiles'].length;
            const amountToRemove = totalTiles;
            testGetTilesOnSuccess(amountToRemove, totalTiles);
        });

        it('should return every tile left when trying to get more than amount in reserve.', () => {
            const totalTiles = tileReserve['tiles'].length;
            const amountToRemove = totalTiles + 1;
            const result = tileReserve.getTiles(amountToRemove);
            expect(result.length).to.equal(totalTiles);
            expect(tileReserve['tiles'].length).to.equal(0);
        });
    });

    describe('swapTiles', () => {
        it('should throw error when swapping no tiles', () => {
            const tiles: Tile[] = [];
            expect(() => tileReserve.swapTiles(tiles)).to.throw(AMOUNT_MUST_BE_GREATER_THAN_1);
        });

        it('should contain the same amount of tiles, but not the same instances (1)', () => {
            const amount = 1;
            testSwapTilesOnSuccess(amount);
        });

        it('should contain the same amount of tiles, but not the same instances (2)', () => {
            const amount = 2;
            testSwapTilesOnSuccess(amount);
        });

        it('should contain the same amount of tiles, but not the same instances (7)', () => {
            const amount = 7;
            testSwapTilesOnSuccess(amount);
        });

        it('should contain the same amount of tiles, but not the same instances (max - 1)', () => {
            const amount = tileReserve['tiles'].length / 2 - 2;
            testSwapTilesOnSuccess(amount);
        });

        it('should contain the same amount of tiles, but not the same instances (max)', () => {
            const amount = tileReserve['tiles'].length / 2 - 1;
            testSwapTilesOnSuccess(amount);
        });

        it('should throw error when swap more than amount in reserve', () => {
            const amount = tileReserve['tiles'].length / 2 + 1;
            const tiles: Tile[] = tileReserve.getTiles(amount);

            expect(() => tileReserve.swapTiles(tiles)).to.throw();
        });
    });

    describe('removeTiles', () => {
        it('should throw error when tile is not in reserve', () => {
            const tile = tileReserve.getTiles(1);

            // eslint-disable-next-line dot-notation
            expect(() => tileReserve['removeTile'](tile[0])).to.throw(TILE_NOT_IN_RESERVE);
        });
    });

    const testGetTilesOnSuccess = (amount: number, total: number) => {
        const removedTiles = tileReserve.getTiles(amount);
        // eslint-disable-next-line dot-notation
        const removedTilesStillInReserve = removedTiles.every((tile) => tileReserve['tiles'].includes(tile));

        expect(removedTiles.length).to.equal(amount);
        expect(tileReserve['tiles'].length).to.equal(total - amount);
        expect(removedTilesStillInReserve).to.equal(false);
    };

    const testSwapTilesOnSuccess = (amount: number) => {
        const tiles: Tile[] = tileReserve.getTiles(amount);
        const expectedNumberTiles = tileReserve['tiles'].length;

        const newTiles = tileReserve.swapTiles(tiles);
        const haveTilesChanged = newTiles.every((tile) => !tiles.includes(tile));

        expect(haveTilesChanged).to.equal(true);
        expect(tileReserve['tiles'].length).to.equal(expectedNumberTiles);
    };
});

describe('TileReserve: uninitialized', () => {
    let tileReserve: TileReserve;

    beforeEach(() => {
        tileReserve = new TileReserve();
    });

    it('should have attribute initialized to false', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions, no-unused-expressions
        expect(tileReserve.isInitialized()).to.be.false;
    });

    it('should throw error when getTile while uninitialized', () => {
        expect(() => tileReserve.getTiles(0)).to.throw(TILE_RESERVE_MUST_BE_INITIALIZED);
    });

    it('should throw error when swapTile while uninitialized', () => {
        expect(() => tileReserve.swapTiles([])).to.throw(TILE_RESERVE_MUST_BE_INITIALIZED);
    });

    it('should throw error when getTilesLeftPerLetter while uninitialized', () => {
        expect(() => tileReserve.getTilesLeftPerLetter()).to.throw(TILE_RESERVE_MUST_BE_INITIALIZED);
    });
});
