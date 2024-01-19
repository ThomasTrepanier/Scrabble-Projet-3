/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-magic-numbers */
// Lint no unused expression must be disabled to use chai syntax
/* eslint-disable @typescript-eslint/no-unused-expressions, no-unused-expressions */
import { Orientation, Position } from '@app/classes/board';
import { LetterValue, Tile } from '@app/classes/tile';
import { WordPlacement } from '@app/classes/word-finding';
import { IN_UPPER_CASE } from '@app/constants/classes-constants';
import * as chai from 'chai';
import { expect } from 'chai';
import * as spies from 'chai-spies';
import { PlacementToString } from './placement-to-string';
chai.use(spies);

describe('WordPlacement utils', () => {
    afterEach(() => {
        chai.spy.restore();
    });

    describe('positionNumberToLetter', () => {
        it('should convert 0 to a', () => {
            expect(PlacementToString.positionNumberToLetter(0)).to.equal('a');
        });

        it('should convert 5 to f', () => {
            expect(PlacementToString.positionNumberToLetter(5)).to.equal('f');
        });
    });

    describe('orientationToLetter', () => {
        it('should convert horizontal to h', () => {
            expect(PlacementToString['orientationToLetter'](Orientation.Horizontal)).to.equal('h');
        });

        it('should convert vertical to v', () => {
            expect(PlacementToString['orientationToLetter'](Orientation.Vertical)).to.equal('v');
        });
    });

    describe('tilesToString', () => {
        it('should convert', () => {
            const tiles: Tile[] = [
                { letter: 'A', value: 0 },
                { letter: 'B', value: 0 },
                { letter: 'C', value: 0 },
            ];
            expect(PlacementToString.tilesToString(tiles)).to.equal('abc');
        });

        it('should convert', () => {
            const tiles: Tile[] = [
                { letter: 'A', value: 0 },
                { letter: 'B', value: 0 },
                { letter: 'C', value: 0 },
            ];
            expect(PlacementToString.tilesToString(tiles, IN_UPPER_CASE)).to.equal('ABC');
        });

        it('should convert blank tile to upper case', () => {
            const tiles: Tile[] = [
                { letter: 'A', value: 0 },
                { letter: 'B', value: 0, isBlank: true },
                { letter: 'C', value: 0 },
            ];
            expect(PlacementToString.tilesToString(tiles)).to.equal('aBc');
        });

        it('should convert', () => {
            const tiles: Tile[] = [];
            expect(PlacementToString.tilesToString(tiles)).to.equal('');
        });
    });

    describe('positionAndOrientationToString', () => {
        it('should convert', () => {
            const position = new Position(3, 4);
            const orientation = Orientation.Horizontal;
            expect(PlacementToString['positionAndOrientationToString'](position, orientation)).to.equal('d5h');
        });
    });

    describe('tileToLetterConversion', () => {
        it('should convert default', () => {
            const tile: Tile = { letter: 'A', value: 0 };
            expect(PlacementToString['tileToLetterConversion'](tile)).to.equal('a');
        });

        it('should convert blank', () => {
            const tile: Tile = { letter: 'B', value: 0, isBlank: true };
            const getLetterSpy = chai.spy.on(PlacementToString, 'getLetterFromBlankTile', (t: Tile) => t.letter.toUpperCase());
            expect(PlacementToString['tileToLetterConversion'](tile)).to.equal('B');
            expect(getLetterSpy).to.have.been.called();
        });
    });

    describe('getLetterFromBlankTile', () => {
        it('should return letter if not blank', () => {
            const tile: Tile = { letter: 'a' as LetterValue, value: 0 };
            expect(PlacementToString['getLetterFromBlankTile'](tile)).to.equal('a');
        });

        it('should return playedLetter to uppercase if defined', () => {
            const tile: Tile = { letter: '*', value: 0, isBlank: true, playedLetter: 'a' as LetterValue };
            expect(PlacementToString['getLetterFromBlankTile'](tile)).to.equal('A');
        });

        it('should return letter to uppercase if playedLetter is NOT defined', () => {
            const tile: Tile = { letter: 'a' as LetterValue, value: 0, isBlank: true };
            expect(PlacementToString['getLetterFromBlankTile'](tile)).to.equal('A');
        });
    });

    describe('wordPlacementToCommandString', () => {
        it('should convert', () => {
            const tiles: Tile[] = [
                { letter: 'X', value: 0 },
                { letter: 'Y', value: 0 },
                { letter: 'Z', value: 0 },
            ];
            const position = new Position(6, 2);
            const orientation = Orientation.Vertical;

            const placement: WordPlacement = {
                startPosition: position,
                tilesToPlace: tiles,
                orientation,
            };

            expect(PlacementToString.wordPlacementToCommandString(placement)).to.equal('!placer g3v xyz');
        });
    });
});
