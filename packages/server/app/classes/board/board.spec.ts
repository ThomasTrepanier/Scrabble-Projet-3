/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Square } from '@app/classes/square';
import { Tile } from '@app/classes/tile';
import { POSITION_OUT_OF_BOARD } from '@app/constants/classes-errors';
import { BOARD_SIZE } from '@app/constants/game-constants';
import { expect } from 'chai';
import { createStubInstance } from 'sinon';
import { Board, BoardNavigator, Orientation, Position } from '.';
import { SHOULD_HAVE_A_TILE, SHOULD_HAVE_NO_TILE } from './board';

const DEFAULT_TILE_A: Tile = { letter: 'A', value: 1 };
const DEFAULT_TILE_B: Tile = { letter: 'B', value: 2 };

describe('Board', () => {
    let board: Board;
    let grid: Square[][];

    beforeEach(() => {
        grid = [];
        for (let i = 0; i < BOARD_SIZE.y; i++) {
            grid[i] = [];
            for (let j = 0; j < BOARD_SIZE.x; j++) {
                const square: Square = {
                    tile: null,
                    position: new Position(i, j),
                    scoreMultiplier: null,
                    wasMultiplierUsed: false,
                    isCenter: false,
                };
                grid[i][j] = square;
            }
        }
        board = new Board(grid);
    });

    /* eslint-disable @typescript-eslint/no-unused-expressions */
    /* eslint-disable no-unused-expressions */
    it('should create', () => {
        expect(board).to.exist;
    });

    describe('placeTile', () => {
        it('place Tile should place a Tile and return true at the desired Square', () => {
            const targetPosition = new Position(5, 3);
            expect(board.placeTile(DEFAULT_TILE_A, targetPosition)).to.be.true;
            expect(board.grid[targetPosition.row][targetPosition.column].tile === DEFAULT_TILE_A).to.be.true;
        });

        it('place Tile should not place a Tile and return false if it is outside of the board', () => {
            const targetPosition = new Position(board.grid.length + 1, 3);
            const result = () => board.placeTile(DEFAULT_TILE_A, targetPosition);
            expect(result).to.throw(POSITION_OUT_OF_BOARD);
        });

        it('place Tile should not place a Tile and return false if it is already occupied', () => {
            const targetPosition = new Position(2, 2);
            board.grid[targetPosition.row][targetPosition.column].tile = DEFAULT_TILE_B;
            expect(board.placeTile(DEFAULT_TILE_A, targetPosition)).to.be.false;
            expect(board.grid[targetPosition.row][targetPosition.column].tile === DEFAULT_TILE_A).to.be.false;
            expect(board.grid[targetPosition.row][targetPosition.column].tile === DEFAULT_TILE_B).to.be.true;
        });
    });

    it('verifySquare should throw an EXTRACTION_POSITION_OUT_OF_BOARD when the position is outside the array no matter if a tile is expected', () => {
        const position: Position = new Position(1, board.grid[0].length + 1);
        const result1 = () => board.verifySquare(position, SHOULD_HAVE_A_TILE);
        expect(result1).to.throw(POSITION_OUT_OF_BOARD);
        const result2 = () => board.verifySquare(position, SHOULD_HAVE_NO_TILE);
        expect(result2).to.throw(POSITION_OUT_OF_BOARD);
    });

    it('verifySquare should return true when the position is valid and there is no tile as expected', () => {
        const position: Position = new Position(1, 7);
        expect(board.verifySquare(position, SHOULD_HAVE_NO_TILE)).to.be.true;
    });

    it('verifySquare should return false when the position is valid but there a tile which was not expected', () => {
        const position: Position = new Position(1, 7);
        board.grid[position.row][position.column].tile = DEFAULT_TILE_A;
        expect(board.verifySquare(position, SHOULD_HAVE_NO_TILE)).to.be.false;
    });

    it('verifySquare should return true when the position is valid and there a tile as expected', () => {
        const position: Position = new Position(1, 7);
        board.grid[position.row][position.column].tile = DEFAULT_TILE_A;
        expect(board.verifySquare(position, SHOULD_HAVE_A_TILE)).to.be.true;
    });

    it('verifySquare should return false when the position is valid but there are no tile when one was expected', () => {
        const position: Position = new Position(1, 7);
        expect(board.verifySquare(position, SHOULD_HAVE_A_TILE)).to.be.false;
    });

    describe('verifySquare', () => {
        it('should call isWinthinBounds', () => {
            const positionSub = createStubInstance(Position, {
                isWithinBounds: true,
            });
            positionSub.row = 0;
            positionSub.column = 0;
            board.verifySquare(positionSub as Position, true);
            expect(positionSub.isWithinBounds.called).to.be.true;
        });
    });

    describe('verifyNeighbors', () => {
        it('should be false when forward is out of bounds', () => {
            expect(board.verifyNeighbors(new Position(grid.length, grid[0].length), Orientation.Horizontal)).to.be.false;
        });
        it('should be true when there is a neighbour horizontally', () => {
            grid[1][1].tile = DEFAULT_TILE_A;
            expect(board.verifyNeighbors(new Position(2, 1), Orientation.Vertical)).to.be.true;
        });
        it('should be true when there is a neighbour vertically', () => {
            grid[1][1].tile = DEFAULT_TILE_A;
            expect(board.verifyNeighbors(new Position(1, 2), Orientation.Horizontal)).to.be.true;
        });
    });

    describe('getSize', () => {
        it('should return correctSize', () => {
            expect(board.getSize()).to.deep.equal(BOARD_SIZE);
        });
    });

    describe('navigate', () => {
        it('should return a BoardNavigator', () => {
            const position = new Position(2, 4);
            expect(board.navigate(position, Orientation.Horizontal)).to.be.instanceOf(BoardNavigator);
        });
    });

    describe('getSquare', () => {
        it('should return square from grid', () => {
            const position = new Position(2, 4);
            expect(board.getSquare(position)).to.equal(board.grid[position.row][position.column]);
        });
    });
});
