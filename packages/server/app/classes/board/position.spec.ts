/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai';
import { Orientation, Position } from '.';
import Direction from './direction';

const DEFAULT_COLUMN = 0;
const DEFAULT_ROW = 0;
const DEFAULT_DISTANCE = 3;

const testMoveHorizontal = (position: Position, distance: number, direction: Direction) => {
    const initialColumn = position.column;
    position.move(Orientation.Horizontal, direction, distance);
    expect(position.column).to.equal(initialColumn + distance * direction);
};
const testMoveVertical = (position: Position, distance: number, direction: Direction) => {
    const initialRow = position.row;
    position.move(Orientation.Vertical, direction, distance);
    expect(position.row).to.equal(initialRow + distance * direction);
};

describe('position', () => {
    let position: Position;

    beforeEach(() => {
        position = new Position(DEFAULT_ROW, DEFAULT_COLUMN);
    });

    describe('move', () => {
        it('should move horizontal forward', () => {
            const direction = Direction.Forward;
            testMoveHorizontal(position, DEFAULT_DISTANCE, direction);
        });

        it('should move horizontal backward', () => {
            const direction = Direction.Forward;
            testMoveHorizontal(position, DEFAULT_DISTANCE, direction);
        });

        it('should move vertical forward', () => {
            const direction = Direction.Forward;
            testMoveVertical(position, DEFAULT_DISTANCE, direction);
        });

        it('should move vertical backward', () => {
            const direction = Direction.Forward;
            testMoveVertical(position, DEFAULT_DISTANCE, direction);
        });

        it('should move by 1 if no distance', () => {
            position.move(Orientation.Horizontal, Direction.Forward);
            expect(position.column).to.equal(DEFAULT_COLUMN + 1);
        });
    });

    describe('forward', () => {
        it('should move horizontal', () => {
            position.forward(Orientation.Horizontal, DEFAULT_DISTANCE);
            expect(position.column).to.equal(DEFAULT_COLUMN + DEFAULT_DISTANCE);
        });

        it('should move vertical', () => {
            position.forward(Orientation.Vertical, DEFAULT_DISTANCE);
            expect(position.row).to.equal(DEFAULT_ROW + DEFAULT_DISTANCE);
        });
    });

    describe('backward', () => {
        it('should move horizontal', () => {
            position.backward(Orientation.Horizontal, DEFAULT_DISTANCE);
            expect(position.column).to.equal(DEFAULT_COLUMN - DEFAULT_DISTANCE);
        });

        it('should move vertical', () => {
            position.backward(Orientation.Vertical, DEFAULT_DISTANCE);
            expect(position.row).to.equal(DEFAULT_ROW - DEFAULT_DISTANCE);
        });
    });

    describe('copy', () => {
        it('should not be the same instance', () => {
            expect(position.copy()).to.not.equal(position);
        });

        it('should have the same values', () => {
            expect(position.copy().column).to.equal(position.column);
            expect(position.copy().row).to.equal(position.row);
        });
    });

    describe('isWithinBound', () => {
        it('should return true if in bounds', () => {
            position.forward(Orientation.Horizontal);
            position.forward(Orientation.Vertical);
            expect(position.isWithinBounds({ x: 2, y: 2 })).to.be.true;
        });

        it('should return false if not in bounds', () => {
            position.forward(Orientation.Horizontal, DEFAULT_DISTANCE);
            position.forward(Orientation.Vertical, DEFAULT_DISTANCE);
            expect(position.isWithinBounds({ x: 2, y: 2 })).to.be.false;
        });
    });
});
