import { Square } from '@app/classes/square';
import { DEFAULT_DISTANCE } from '@app/constants/position-constants';
import { switchOrientation } from '@app/utils/switch-orientation/switch-orientation';
import { Board, Orientation, Position } from '.';
import Direction from './direction';

export default class BoardNavigator {
    orientation: Orientation;
    position: Position;

    constructor(private board: Board, position: Position, orientation: Orientation) {
        this.position = position.copy();
        this.orientation = orientation;
    }

    get square(): Square {
        return this.board.getSquare(this.position);
    }

    get row(): number {
        return this.position.row;
    }

    get column(): number {
        return this.position.column;
    }

    verify(shouldBeFilled: boolean): boolean {
        try {
            return this.board.verifySquare(this.position, shouldBeFilled);
        } catch (exception) {
            return false;
        }
    }

    verifyNeighbors(orientation: Orientation, shouldBeFilled: boolean): boolean {
        return this.board.verifyNeighbors(this.position, orientation, shouldBeFilled);
    }

    verifyPerpendicularNeighbors(shouldBeFilled: boolean): boolean {
        return this.verifyNeighbors(switchOrientation(this.orientation), shouldBeFilled);
    }

    move(direction: Direction, distance: number = DEFAULT_DISTANCE): BoardNavigator {
        this.position.move(this.orientation, direction, distance);
        return this;
    }

    forward(distance: number = 1): BoardNavigator {
        this.position.move(this.orientation, Direction.Forward, distance);
        return this;
    }

    backward(distance: number = 1): BoardNavigator {
        this.position.move(this.orientation, Direction.Backward, distance);
        return this;
    }

    nextLine(): void {
        if (this.orientation === Orientation.Horizontal) {
            this.position.row += 1;
            this.position.column = 0;
        } else {
            this.position.row = 0;
            this.position.column += 1;
        }
    }

    switchOrientation(): BoardNavigator {
        this.orientation = switchOrientation(this.orientation);
        return this;
    }

    isEmpty(): boolean {
        return this.square.tile === null;
    }

    isWithinBounds(): boolean {
        return this.position.isWithinBounds(this.board.getSize());
    }

    clone(): BoardNavigator {
        return new BoardNavigator(this.board, this.position, this.orientation);
    }
}
