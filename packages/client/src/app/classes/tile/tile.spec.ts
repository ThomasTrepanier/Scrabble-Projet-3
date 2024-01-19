import { Tile } from '.';

describe('Tile', () => {
    it('constructor should return expected tile with normal tile', () => {
        const tileLetter = 'A';
        const tileValue = 1;
        const tile = new Tile(tileLetter, tileValue);

        expect(tile.letter).toEqual(tileLetter);
        expect(tile.value).toEqual(tileValue);
    });

    it('constructor should return expected tile with blank tile', () => {
        const tileLetter = 'A';
        const tileValue = 1;
        const tileBlank = true;
        const tile = new Tile(tileLetter, tileValue, tileBlank);

        expect(tile.letter).toEqual(tileLetter);
        expect(tile.value).toEqual(tileValue);
        expect(tile.isBlank).toEqual(tileBlank);
    });
});
