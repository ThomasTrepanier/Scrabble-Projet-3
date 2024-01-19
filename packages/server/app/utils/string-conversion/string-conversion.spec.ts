/* eslint-disable dot-notation */
// Lint no unused expression must be disabled to use chai syntax
/* eslint-disable @typescript-eslint/no-unused-expressions, no-unused-expressions */
import { Square } from '@app/classes/square';
import { Tile } from '@app/classes/tile';
import * as chai from 'chai';
import { expect } from 'chai';
import * as spies from 'chai-spies';
import { StringConversion } from './string-conversion';
chai.use(spies);

describe('StringConversion', () => {
    afterEach(() => {
        chai.spy.restore();
    });

    describe('wordsToString', () => {
        it('should return the word', () => {
            const tiles: [Square, Tile][][] = [
                [
                    [{} as unknown as Square, { letter: 'A', value: 0 }],
                    [{} as unknown as Square, { letter: 'C', value: 0 }],
                ],
            ];
            const conversionSpy = chai.spy.on(StringConversion, 'tileToString', (tile: Tile) => tile.letter);
            expect(StringConversion.wordsToString(tiles)).to.deep.equal(['AC']);
            expect(conversionSpy).to.have.been.called.twice;
        });
    });

    describe('tileToString', () => {
        it('should return playedLetter if defined', () => {
            const tile: Tile = { letter: '*', value: 0, isBlank: true, playedLetter: 'B' };
            expect(StringConversion['tileToString'](tile)).to.deep.equal('B');
        });

        it('should return letter if playedLetter is not defined', () => {
            const tile: Tile = { letter: 'A', value: 0, isBlank: false };
            expect(StringConversion['tileToString'](tile)).to.deep.equal('A');
        });
    });

    describe('convertTileToStringDatabase', () => {
        it('should return lowercase playedLetter if isBlank', () => {
            const tile: Tile = { letter: '*', value: 0, isBlank: true, playedLetter: 'B' };
            expect(StringConversion['convertTileToStringDatabase'](tile)).to.deep.equal('b');
        });

        it('should return * if not played', () => {
            const tile: Tile = { letter: '*', isBlank: true, value: 0 };
            expect(StringConversion['convertTileToStringDatabase'](tile)).to.deep.equal('*');
        });

        it('should return uppercase letter if normal tile', () => {
            const tile: Tile = { letter: 'A', value: 0, isBlank: false };
            expect(StringConversion['convertTileToStringDatabase'](tile)).to.deep.equal('A');
        });
    });

    describe('convertStringToTile', () => {
        it('should return played blank tile if lowercase string', () => {
            const tile: Tile = { letter: '*', value: 0, isBlank: true, playedLetter: 'B' };
            expect(StringConversion['convertStringToTile']('b')).to.deep.equal(tile);
        });

        it('should return Blank tile if * received', () => {
            const tile: Tile = { letter: '*', isBlank: true, value: 0, playedLetter: undefined };
            expect(StringConversion['convertStringToTile']('*')).to.deep.equal(tile);
        });

        it('should return normal tile if uppercase letter ', () => {
            const tile: Tile = { letter: 'A', isBlank: false, value: 1 };
            expect(StringConversion['convertStringToTile']('A')).to.deep.equal(tile);
        });

        it('should return uppercase letter if normal tile', () => {
            const tile: Tile = { letter: 'Z', isBlank: false, value: 10 };
            expect(StringConversion['convertStringToTile']('Z')).to.deep.equal(tile);
        });
    });
});
