/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { Orientation } from '@app/classes/actions/orientation';
import { Position } from '@app/classes/board-navigator/position';
import { SquareView } from '@app/classes/square';
import { LetterValue, Tile } from '@app/classes/tile';
import { BoardNavigator } from './board-navigator';
import Direction from './direction';

type LetterValues = (LetterValue | ' ')[][];

const BOARD: LetterValues = [
    [' ', ' ', ' ', ' ', ' '],
    [' ', ' ', 'A', ' ', ' '],
    [' ', ' ', 'B', ' ', ' '],
    [' ', ' ', 'C', ' ', ' '],
    [' ', ' ', ' ', ' ', ' '],
];
const OUT_OF_BOUNDS_POSITION: Position = { row: 999, column: 999 };
const OUT_OF_BOUNDS_ROW: Position = { row: 999, column: 0 };
const OUT_OF_BOUNDS_COLUMN: Position = { row: 0, column: 999 };

const boardFromLetterValues = (letterValues: LetterValues) => {
    const board: SquareView[][] = [];

    letterValues.forEach((line, row) => {
        const boardRow: SquareView[] = [];

        line.forEach((letter, column) => {
            boardRow.push(
                new SquareView(
                    {
                        tile: letter === ' ' ? null : new Tile(letter, 0),
                        position: { row, column },
                        scoreMultiplier: null,
                        wasMultiplierUsed: false,
                        isCenter: false,
                    },
                    {
                        x: 1,
                        y: 1,
                    },
                ),
            );
        });

        board.push(boardRow);
    });

    return board;
};

describe('BoardNavigator', () => {
    let board: SquareView[][];
    let navigator: BoardNavigator;

    beforeEach(() => {
        board = boardFromLetterValues(BOARD);
        navigator = new BoardNavigator(board, { row: 0, column: 0 }, Orientation.Horizontal);
    });

    describe('getSquareView', () => {
        it('should return squareView', () => {
            const pos: Position = { row: 2, column: 2 };
            navigator.setPosition(pos);
            const expected = board[pos.row][pos.column];
            const result = navigator.currentSquareView;

            expect(result).toEqual(expected);
        });
    });

    describe('move', () => {
        it('should move horizontally', () => {
            const direction = Direction.Forward;
            const orientation = Orientation.Horizontal;
            navigator.orientation = orientation;

            const expected = navigator.column + direction;

            navigator['move'](direction);

            expect(navigator.column).toEqual(expected);
        });

        it('should move horizontally with distance', () => {
            const distance = 2;
            const direction = Direction.Forward;
            const orientation = Orientation.Horizontal;
            navigator.orientation = orientation;

            const expected = navigator.column + distance * direction;

            navigator['move'](direction, distance);

            expect(navigator.column).toEqual(expected);
        });

        it('should move vertically', () => {
            const distance = 2;
            const direction = Direction.Forward;
            const orientation = Orientation.Vertical;
            navigator.orientation = orientation;

            const expected = navigator.row + distance * direction;

            navigator['move'](direction, distance);

            expect(navigator.row).toEqual(expected);
        });
    });

    describe('nextEmpty', () => {
        it('should return next squareView if empty', () => {
            const expected = board[0][1];
            expect(navigator.nextEmpty(Direction.Forward, false)).toEqual(expected);
        });

        it('should return next empty squareView when neighbors is not empty', () => {
            navigator.setPosition({ row: 2, column: 1 });
            const expected = board[2][3];
            expect(navigator.nextEmpty(Direction.Forward, false)).toEqual(expected);
        });

        it('should return undefined when no next empty', () => {
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            navigator.setPosition({ row: 4, column: 4 });
            expect(navigator.nextEmpty(Direction.Forward, false)).toBeUndefined();
        });
    });

    describe('isWithinBounds', () => {
        it('should return true if is within bounds', () => {
            navigator.setPosition({ row: 0, column: 0 });
            expect(navigator['isWithinBounds']()).toBeTrue();
        });

        it('should return false if is not within bounds', () => {
            navigator.setPosition(OUT_OF_BOUNDS_POSITION);
            expect(navigator['isWithinBounds']()).toBeFalse();
        });

        it('should return false if is row not within bounds', () => {
            navigator.setPosition(OUT_OF_BOUNDS_ROW);
            expect(navigator['isWithinBounds']()).toBeFalse();
        });

        it('should return false if is column not within bounds', () => {
            navigator.setPosition(OUT_OF_BOUNDS_COLUMN);
            expect(navigator['isWithinBounds']()).toBeFalse();
        });
    });

    describe('switchOrientation', () => {
        it('should go from horizontal to vertical', () => {
            navigator.orientation = Orientation.Horizontal;
            navigator.switchOrientation();
            expect(navigator.orientation as Orientation).toEqual(Orientation.Vertical);
        });

        it('should go from horizontal to vertical', () => {
            navigator.orientation = Orientation.Vertical;
            navigator.switchOrientation();
            expect(navigator.orientation as Orientation).toEqual(Orientation.Horizontal);
        });
    });

    describe('isEmpty', () => {
        it('should be true if no tile', () => {
            navigator.setPosition({ row: 0, column: 0 });
            expect(navigator['isEmpty']()).toBeTrue();
        });

        it('should be false if has tile', () => {
            navigator.setPosition({ row: 2, column: 2 });
            expect(navigator['isEmpty']()).toBeFalse();
        });

        it('should return true if not applied', () => {
            board[2][2].applied = false;
            navigator.setPosition({ row: 2, column: 2 });
            expect(navigator['isEmpty'](true)).toBeTrue();
        });
    });

    describe('clone', () => {
        it('should return different instance with same values', () => {
            const clone = navigator.clone();

            expect(clone['position']).toEqual(clone['position']);
            expect(clone.orientation).toEqual(clone.orientation);
        });
    });
});
