/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable dot-notation */
import { Square } from '@app/classes/square';
import { LetterValue } from '@app/classes/tile';
import { Orientation, Position, BoardNavigator, Board } from '@app/classes/board';
import Direction from './direction';
import { expect } from 'chai';
import * as chai from 'chai';
import { SinonStub, stub } from 'sinon';
type LetterValues = (LetterValue | ' ')[][];

const GRID: LetterValues = [
    [' ', ' ', ' ', ' ', ' '],
    [' ', ' ', 'A', ' ', ' '],
    [' ', ' ', 'B', ' ', ' '],
    [' ', ' ', 'C', ' ', ' '],
    [' ', ' ', ' ', ' ', ' '],
];

const OUT_OF_BOUND_VALUE = 999;
const OUT_OF_BOUNDS_POSITION: Position = new Position(OUT_OF_BOUND_VALUE, OUT_OF_BOUND_VALUE);
const OUT_OF_BOUNDS_ROW: Position = new Position(OUT_OF_BOUND_VALUE, 0);
const OUT_OF_BOUNDS_COLUMN: Position = new Position(0, OUT_OF_BOUND_VALUE);
const SHOULD_BE_FILLED = true;
const DEFAULT_ORIENTATION = Orientation.Horizontal;

const boardFromLetterValues = (letterValues: LetterValues) => {
    const grid: Square[][] = [];

    letterValues.forEach((line, row) => {
        const boardRow: Square[] = [];

        line.forEach((letter, column) => {
            boardRow.push({
                tile: letter === ' ' ? null : { letter: letter as LetterValue, value: 0 },
                position: new Position(row, column),
                scoreMultiplier: null,
                wasMultiplierUsed: false,
                isCenter: false,
            });
        });

        grid.push(boardRow);
    });

    return new Board(grid);
};

describe('BoardNavigator', () => {
    let board: Board;
    let navigator: BoardNavigator;

    beforeEach(() => {
        board = boardFromLetterValues(GRID);
        navigator = new BoardNavigator(board, new Position(0, 0), DEFAULT_ORIENTATION);
    });

    describe('getSquare', () => {
        it('should return Square', () => {
            const pos: Position = new Position(2, 2);
            navigator = new BoardNavigator(board, pos, DEFAULT_ORIENTATION);

            const expected = board.grid[pos.row][pos.column];
            const result = navigator.square;

            expect(result).to.deep.equal(expected);
        });
    });

    describe('move', () => {
        it('should move horizontally', () => {
            const direction = Direction.Forward;
            const orientation = Orientation.Horizontal;
            navigator.orientation = orientation;

            const expected: number = navigator.column + direction;

            navigator.move(direction);

            expect(navigator.column).to.equal(expected);
        });

        it('should move horizontally with distance', () => {
            const distance = 2;
            const direction = Direction.Forward;
            const orientation = Orientation.Horizontal;
            navigator.orientation = orientation;

            const expected = navigator.column + distance * direction;

            navigator.move(direction, distance);

            expect(navigator.column).to.equal(expected);
        });

        it('should move vertically', () => {
            const direction = Direction.Forward;
            const orientation = Orientation.Vertical;
            navigator.orientation = orientation;

            const expected = navigator.row + direction;

            navigator.move(direction);

            expect(navigator.row).to.equal(expected);
        });

        it('should move vertically with distance', () => {
            const distance = 2;
            const direction = Direction.Forward;
            const orientation = Orientation.Vertical;
            navigator.orientation = orientation;

            const expected = navigator.row + distance * direction;

            navigator.move(direction, distance);

            expect(navigator.row).to.equal(expected);
        });
    });

    describe('verify', () => {
        it('should call board.verifySquare', () => {
            const spy = chai.spy.on(navigator['board'], 'verifySquare', () => {
                return true;
            });

            navigator.verify(SHOULD_BE_FILLED);
            expect(spy).to.have.been.called.with(navigator.position, SHOULD_BE_FILLED);
        });

        it('should return false if board.verifySquare throws', () => {
            chai.spy.on(navigator['board'], 'verifySquare', () => {
                throw new Error();
            });

            expect(navigator.verify(SHOULD_BE_FILLED)).to.be.false;
        });

        it('should return what board.verifySquare returns', () => {
            chai.spy.on(navigator['board'], 'verifySquare', () => {
                return true;
            });

            expect(navigator.verify(SHOULD_BE_FILLED)).to.be.true;
        });
    });

    describe('verifyNeighbors', () => {
        it('should call board.verifyNeighbors', () => {
            const spy = chai.spy.on(navigator['board'], 'verifyNeighbors');
            navigator.verifyNeighbors(navigator.orientation, SHOULD_BE_FILLED);
            expect(spy).to.have.been.called.with(navigator.position, navigator.orientation, SHOULD_BE_FILLED);
        });

        it('should return what board.verifyNeighbors returns', () => {
            chai.spy.on(navigator['board'], 'verifyNeighbors', () => {
                return true;
            });
            expect(navigator.verifyNeighbors(navigator.orientation, SHOULD_BE_FILLED)).to.be.true;
        });
    });

    describe('verifyPerpendicularNeighbors', () => {
        let verifyNeighborsStub: SinonStub;

        beforeEach(() => {
            verifyNeighborsStub = stub(navigator, 'verifyNeighbors');
        });

        it('should call verifyNeighbors with Vertical if Horizontal', () => {
            const calledOrientation = Orientation.Horizontal;
            const shouldBeFilled = false;

            navigator.orientation = Orientation.Vertical;
            navigator.verifyPerpendicularNeighbors(shouldBeFilled);

            expect(verifyNeighborsStub.calledWith(calledOrientation, shouldBeFilled)).to.be.true;
        });

        it('should call verifyNeighbors with Horizontal if Vertical', () => {
            const calledOrientation = Orientation.Vertical;
            const shouldBeFilled = true;

            navigator.orientation = Orientation.Horizontal;
            navigator.verifyPerpendicularNeighbors(shouldBeFilled);

            expect(verifyNeighborsStub.calledWith(calledOrientation, shouldBeFilled)).to.be.true;
        });

        for (const expected of [true, false]) {
            it(`should return verifyNeighbors result (${expected})`, () => {
                verifyNeighborsStub.returns(expected);

                const result = navigator.verifyPerpendicularNeighbors(false);

                expect(result).to.equal(expected);
            });
        }
    });

    describe('forward', () => {
        it('should call move', () => {
            const spy = chai.spy.on(navigator['position'], 'move');

            navigator.forward();
            expect(spy).to.have.been.called.with(Orientation.Horizontal, Direction.Forward, 1);
        });

        it('should call move with distance', () => {
            const spy = chai.spy.on(navigator['position'], 'move');

            const distance = 2;

            navigator.forward(distance);
            expect(spy).to.have.been.called.with(Orientation.Horizontal, Direction.Forward, distance);
        });
    });

    describe('backward', () => {
        it('should call move', () => {
            const spy = chai.spy.on(navigator['position'], 'move');
            const defaultDistance = 1;
            navigator.backward();
            expect(spy).to.have.been.called.with(Orientation.Horizontal, Direction.Backward, defaultDistance);
        });

        it('should call move with distance', () => {
            const spy = chai.spy.on(navigator['position'], 'move');
            const distance = 2;

            navigator.backward(distance);
            expect(spy).to.have.been.called.with(Orientation.Horizontal, Direction.Backward, distance);
        });
    });

    describe('nextLine', () => {
        const tests: [r0: number, c0: number, r1: number, c1: number, orientation: Orientation][] = [
            [0, 0, 1, 0, Orientation.Horizontal],
            [2, 4, 3, 0, Orientation.Horizontal],
            [0, 0, 0, 1, Orientation.Vertical],
            [6, 8, 0, 9, Orientation.Vertical],
        ];

        let index = 1;
        for (const [r0, c0, r1, c1, orientation] of tests) {
            it(`should go to next line (${index})`, () => {
                navigator.position = new Position(r0, c0);
                navigator.orientation = orientation;

                navigator.nextLine();

                expect(navigator.row).to.equal(r1);
                expect(navigator.column).to.equal(c1);
            });
            index++;
        }
    });

    describe('isWithinBounds', () => {
        it('should return true if is within bounds', () => {
            navigator = new BoardNavigator(board, new Position(0, 0), Orientation.Horizontal);
            expect(navigator.isWithinBounds()).to.be.true;
        });

        it('should return false if is not within bounds', () => {
            navigator = new BoardNavigator(board, OUT_OF_BOUNDS_POSITION, Orientation.Horizontal);
            expect(navigator.isWithinBounds()).to.be.false;
        });

        it('should return false if is row not within bounds', () => {
            navigator = new BoardNavigator(board, OUT_OF_BOUNDS_ROW, Orientation.Horizontal);
            expect(navigator.isWithinBounds()).to.be.false;
        });

        it('should return false if is column not within bounds', () => {
            navigator = new BoardNavigator(board, OUT_OF_BOUNDS_COLUMN, Orientation.Horizontal);
            expect(navigator.isWithinBounds()).to.be.false;
        });
    });

    describe('switchOrientation', () => {
        it('should go from horizontal to vertical', () => {
            navigator.orientation = Orientation.Horizontal;
            navigator.switchOrientation();
            expect(navigator.orientation as Orientation).to.equal(Orientation.Vertical);
        });

        it('should go from horizontal to vertical', () => {
            navigator.orientation = Orientation.Vertical;
            navigator.switchOrientation();
            expect(navigator.orientation as Orientation).to.equal(Orientation.Horizontal);
        });
    });

    describe('isEmpty', () => {
        it('should be true if no tile', () => {
            navigator = new BoardNavigator(board, new Position(0, 0), Orientation.Horizontal);
            expect(navigator.isEmpty()).to.be.true;
        });

        it('should be false if has tile', () => {
            navigator = new BoardNavigator(board, new Position(2, 2), Orientation.Horizontal);
            expect(navigator.isEmpty()).to.be.false;
        });
    });

    describe('clone', () => {
        it('should return different instance with same values', () => {
            const clone = navigator.clone();

            expect(clone['position']).to.deep.equal(clone['position']);
            expect(clone.orientation).to.equal(clone.orientation);
            expect(navigator).not.to.equal(clone);
        });
    });
});
