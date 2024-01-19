/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable dot-notation */

import { Board, BoardNavigator, Orientation, Position } from '@app/classes/board';
import { Square } from '@app/classes/square';
import { LetterValue, Tile } from '@app/classes/tile';
import { expect } from 'chai';
import { EXTRACTION_SQUARE_ALREADY_FILLED, POSITION_OUT_OF_BOARD } from '@app/constants/classes-errors';
import { WordExtraction } from './word-extraction';
import Direction from '@app/classes/board/direction';
import { stub } from 'sinon';
import * as sinon from 'sinon';

type LetterOrEmpty = LetterValue | ' ';

const tileFromLetter = (letter: LetterValue) => ({ letter, value: 0 });
const tilesFromLetters = (letters: LetterValue[]) => letters.map(tileFromLetter);
const gridFromLetterArray = (letters: LetterOrEmpty[][]) => {
    return letters.map<Square[]>((row, i) =>
        row.map<Square>((letter, j) => ({
            position: new Position(i, j),
            scoreMultiplier: null,
            wasMultiplierUsed: false,
            isCenter: false,
            tile: letter === ' ' ? null : tileFromLetter(letter),
        })),
    );
};

const DEFAULT_LETTER_ARRAY: LetterOrEmpty[][] = [
    [' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', 'A', ' ', ' ', ' '],
    [' ', ' ', 'B', ' ', 'D', 'E'],
    [' ', ' ', 'C', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' '],
];
const HAS_TILE_POSITION: Position = new Position(1, 2);
const DEFAULT_ORIENTATION: Orientation = Orientation.Horizontal;

describe('WordExtract', () => {
    let board: Board;
    let grid: Square[][];
    let extraction: WordExtraction;

    beforeEach(() => {
        grid = gridFromLetterArray(DEFAULT_LETTER_ARRAY);
        board = new Board(grid);
        extraction = new WordExtraction(board);
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should create', () => {
        expect(extraction).to.exist;
    });

    describe('extract', () => {
        const testWords = (letters: LetterValue[], column: number, row: number, orientation: Orientation, expected: string[]) => {
            const tilesToPlace: Tile[] = tilesFromLetters(letters);
            const startPosition = new Position(row, column);

            const result = extraction.extract({ tilesToPlace, startPosition, orientation });
            const resultWords = result.map((word) => word.reduce((prev, [, t]) => (prev += t.letter), ''));

            for (const word of expected) {
                expect(resultWords).to.include(word);
                const index = resultWords.indexOf(word);
                if (index >= 0) resultWords.splice(index, 1);
            }
            expect(resultWords).to.be.empty;
        };

        it('should contains all words (1)', () => {
            testWords(['X', 'Y', 'Z'], 1, 3, Orientation.Horizontal, ['XCYZ', 'DZ']);
        });

        it('should contains all words (2)', () => {
            testWords(['X', 'Y', 'Z'], 0, 0, Orientation.Horizontal, ['XYZ', 'ZABC']);
        });

        it('should contains all words (3)', () => {
            testWords(['X', 'Y', 'Z'], 0, 2, Orientation.Horizontal, ['XYBZDE']);
        });

        it('should contains all words (4)', () => {
            testWords(['X', 'Y', 'Z'], 3, 1, Orientation.Vertical, ['XYZ', 'AX', 'CZ', 'BYDE']);
        });

        it('should contains all words (5)', () => {
            testWords(['X', 'Y', 'Z'], 2, 0, Orientation.Vertical, ['XABCYZ']);
        });

        it('should contains all words (6)', () => {
            testWords(['X', 'Y', 'Z'], 1, 3, Orientation.Vertical, ['XYZ', 'XC']);
        });

        it('should contains all words (7)', () => {
            testWords(['X', 'Y', 'Z'], 4, 3, Orientation.Vertical, ['DXYZ']);
        });

        it('should contains all words (8)', () => {
            testWords(['X', 'Y', 'Z'], 3, 3, Orientation.Horizontal, ['CXYZ', 'DY', 'EZ']);
        });

        it('should contains all words (9)', () => {
            testWords(['X'], 4, 1, Orientation.Horizontal, ['XD']);
        });

        it('should throw if square already has a tile', () => {
            expect(() => extraction.extract({ tilesToPlace: [], startPosition: HAS_TILE_POSITION, orientation: DEFAULT_ORIENTATION })).to.throw(
                EXTRACTION_SQUARE_ALREADY_FILLED,
            );
        });

        it('should throw if tiles go outside board', () => {
            const tilesToPlace = tilesFromLetters(['X', 'Y', 'Z']);
            const startPosition = new Position(0, 4);
            const orientation = Orientation.Horizontal;
            expect(() => extraction.extract({ tilesToPlace, startPosition, orientation })).to.throw(POSITION_OUT_OF_BOARD);
        });

        it("should throw if letters doesn't go over edge, but tiles are already there", () => {
            const tilesToPlace = tilesFromLetters(['V', 'W', 'X', 'Y', 'Z']);
            const startPosition = new Position(1, 1);
            const orientation = Orientation.Horizontal;

            expect(() => extraction.extract({ tilesToPlace, startPosition, orientation })).to.throw(POSITION_OUT_OF_BOARD);
        });

        it('should throw if letter is not adjacent', () => {
            const tilesToPlace = tilesFromLetters(['X']);
            const startPosition = new Position(4, 4);
            const orientation = Orientation.Horizontal;
            expect(() => extraction.extract({ tilesToPlace, startPosition, orientation })).to.throw();
        });

        it('should not push', () => {
            const tilesToPlace: Tile[] = tilesFromLetters(['X', 'Y', 'Z']);
            const startPosition = new Position(1, 3);

            const result = () => extraction.extract({ tilesToPlace, startPosition, orientation: Orientation.Vertical });
            const stubVerify = stub(BoardNavigator.prototype, 'verify');
            stubVerify.onCall(0).returns(false);
            stubVerify.onCall(1).returns(true);
            stubVerify.onCall(2).callsFake(() => {
                throw new Error();
            });
            expect(result).to.Throw();
            stubVerify.reset();
            stubVerify.restore();
        });
    });

    describe('extractWordInDirection', () => {
        it('should throw if tile is occupied', () => {
            const orientation = Orientation.Horizontal;
            const direction = Direction.Forward;
            const position = new Position(1, 2);
            expect(() => extraction['extractWordInDirection'](orientation, direction, position)).to.throw(EXTRACTION_SQUARE_ALREADY_FILLED);
        });

        it('should not push', () => {
            const stubVerify = stub(BoardNavigator.prototype, 'verify');
            stubVerify.onCall(0).returns(false);
            stubVerify.onCall(1).returns(true);
            stubVerify.onCall(2).returns(false);
            const orientation = Orientation.Horizontal;
            const direction = Direction.Forward;
            const position = new Position(0, 0);
            expect(extraction['extractWordInDirection'](orientation, direction, position).length).to.equal(0);
            stubVerify.reset();
            stubVerify.restore();
        });
    });
});
