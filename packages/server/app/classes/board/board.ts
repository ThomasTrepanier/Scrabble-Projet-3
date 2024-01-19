import { Vec2 } from '@app/classes/board/vec2';
import { HttpException } from '@app/classes/http-exception/http-exception';
import { Square } from '@app/classes/square';
import { Tile } from '@app/classes/tile';
import { POSITION_OUT_OF_BOARD } from '@app/constants/classes-errors';
import { StatusCodes } from 'http-status-codes';
import { BoardNavigator, Orientation, Position } from './';
import { Board as BoardInterface } from '@common/models/game';

export const SHOULD_HAVE_A_TILE = true;
export const SHOULD_HAVE_NO_TILE = false;
export default class Board implements BoardInterface {
    grid: Square[][];

    constructor(grid: Square[][]) {
        this.grid = grid;
    }

    getSquare(position: Position): Square {
        return this.grid[position.row][position.column];
    }

    navigate(position: Position, orientation: Orientation): BoardNavigator {
        return new BoardNavigator(this, position, orientation);
    }

    verifyNeighbors(position: Position, orientation: Orientation, shouldBeFilled: boolean = true): boolean {
        let backward: boolean;
        let forward: boolean;

        try {
            backward = this.verifySquare(position.copy().backward(orientation), shouldBeFilled);
        } catch (exception) {
            backward = !shouldBeFilled;
        }
        try {
            forward = this.verifySquare(position.copy().forward(orientation), shouldBeFilled);
        } catch (exception) {
            forward = !shouldBeFilled;
        }

        return backward || forward;
    }

    placeTile(tile: Tile, position: Position): boolean {
        if (!this.verifySquare(position, SHOULD_HAVE_NO_TILE)) return false;
        this.grid[position.row][position.column].tile = tile;
        return true;
    }

    getSize(): Vec2 {
        return { x: this.grid[0].length, y: this.grid.length };
    }

    verifySquare(position: Position, shouldBeFilled: boolean): boolean {
        if (this.isWithinBounds(position)) {
            return this.grid[position.row][position.column].tile ? shouldBeFilled : !shouldBeFilled;
        }
        throw new HttpException(POSITION_OUT_OF_BOARD, StatusCodes.NOT_FOUND);
    }

    private isWithinBounds(position: Position): boolean {
        return position.isWithinBounds(this.getSize());
    }
}
