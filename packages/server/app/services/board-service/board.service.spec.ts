/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Board, Position } from '@app/classes/board';
import { Vec2 } from '@app/classes/board/vec2';
import { Square } from '@app/classes/square';
import ScoreMultiplier, { MultiplierEffect } from '@app/classes/square/score-multiplier';
import { BOARD_CONFIG } from '@app/constants/board-config';
import { BOARD_SIZE } from '@app/constants/game-constants';
import { BOARD_CONFIG_UNDEFINED_AT, NO_MULTIPLIER_MAPPED_TO_INPUT } from '@app/constants/services-errors';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import BoardService from './board.service';

const expect = chai.expect;
chai.use(spies);
chai.use(chaiAsPromised);

describe('BoardService', () => {
    let service: BoardService;

    const boardConfigSize: Vec2 = {
        x: BOARD_CONFIG.length,
        y: BOARD_CONFIG[0] ? BOARD_CONFIG[0].length : 0,
    };

    /*
        If the board configuration size is smaller or equal to 0
        then the board configuration will not be defined no matter
        the square => isBoardDefined = false
        If it is bigger than 0, then it will be defined at the 
        different test cases below
    */
    const isBoardDefined = boardConfigSize.x > 0 && boardConfigSize.y > 0;
    const isBoardDefinedTestCases: Map<Position, boolean> = new Map([
        [new Position(-1, -1), false],
        [new Position(0, 0), isBoardDefined],
        [new Position(boardConfigSize.x / 2, boardConfigSize.y / 2), isBoardDefined],
        [new Position(boardConfigSize.x - 1, boardConfigSize.y - 1), isBoardDefined],
        [new Position(boardConfigSize.x, boardConfigSize.y), false],
        [new Position(boardConfigSize.x + 1, boardConfigSize.y + 1), false],
    ]);

    type MapTypes = ScoreMultiplier | null | undefined;
    const boardConfigTestCases: Map<string, MapTypes> = new Map([
        ['x', null],
        ['L2', { multiplier: 2, multiplierEffect: MultiplierEffect.LETTER }],
        ['L3', { multiplier: 3, multiplierEffect: MultiplierEffect.LETTER }],
        ['W2', { multiplier: 2, multiplierEffect: MultiplierEffect.WORD }],
        ['W3', { multiplier: 3, multiplierEffect: MultiplierEffect.WORD }],
        ['S', { multiplier: 2, multiplierEffect: MultiplierEffect.WORD }],
        ['?', undefined],
        ['undefined', undefined],
    ]);

    const boardInitializationTestCases: Map<Position, Square | undefined> = new Map([
        [
            new Position(0, 0),
            {
                tile: null,
                position: new Position(0, 0),
                scoreMultiplier: { multiplier: 3, multiplierEffect: MultiplierEffect.WORD },
                wasMultiplierUsed: false,
                isCenter: false,
            },
        ],
        [
            new Position(1, 1),
            {
                tile: null,
                position: new Position(1, 1),
                scoreMultiplier: { multiplier: 2, multiplierEffect: MultiplierEffect.WORD },
                wasMultiplierUsed: false,
                isCenter: false,
            },
        ],
        [
            new Position(BOARD_SIZE.x - 1, 0),
            {
                tile: null,
                position: new Position(BOARD_SIZE.x - 1, 0),
                scoreMultiplier: { multiplier: 3, multiplierEffect: MultiplierEffect.WORD },
                wasMultiplierUsed: false,
                isCenter: false,
            },
        ],
        [new Position(BOARD_SIZE.x, 0), undefined],
        [
            new Position(0, BOARD_SIZE.y - 1),
            {
                tile: null,
                position: new Position(0, BOARD_SIZE.y - 1),
                scoreMultiplier: { multiplier: 3, multiplierEffect: MultiplierEffect.WORD },
                wasMultiplierUsed: false,
                isCenter: false,
            },
        ],
        [new Position(0, BOARD_SIZE.y), undefined],
        [
            new Position(BOARD_SIZE.x - 1, BOARD_SIZE.y - 1),
            {
                tile: null,
                position: new Position(BOARD_SIZE.x - 1, BOARD_SIZE.y - 1),
                scoreMultiplier: { multiplier: 3, multiplierEffect: MultiplierEffect.WORD },
                wasMultiplierUsed: false,
                isCenter: false,
            },
        ],
        [new Position(BOARD_SIZE.x, BOARD_SIZE.y), undefined],
    ]);

    beforeEach(() => {
        service = new BoardService();
    });

    it('should be created', () => {
        expect(service).to.exist;
    });

    isBoardDefinedTestCases.forEach((isDefined: boolean, position: Position) => {
        const textToAdd: string = isDefined ? 'defined' : 'undefined';
        it('Board Configuration at ' + position.row + '/' + position.column + ' should be ' + textToAdd, () => {
            expect(service['isBoardConfigDefined'](position)).to.equal(isDefined);
        });
    });

    boardConfigTestCases.forEach((value: MapTypes, key: string) => {
        it('Parsing Square config for data ' + key + ' should return ' + value, () => {
            if (value === undefined) {
                expect(() => service['parseSquareConfig'](key)).to.throw(NO_MULTIPLIER_MAPPED_TO_INPUT(key));
            } else {
                expect(service['parseSquareConfig'](key)).to.deep.equal(value);
            }
        });
    });

    it('Reading board config at undefined position should throw error', () => {
        chai.spy.on(service, 'isBoardConfigDefined', () => false);
        const undefinedPosition: Position = new Position(-1, -1);
        expect(() => service['readScoreMultiplierConfig'](undefinedPosition)).to.throw(BOARD_CONFIG_UNDEFINED_AT(undefinedPosition));
    });

    it('Reading board config at valid position should return appropriate multiplier', () => {
        chai.spy.on(service, 'isBoardConfigDefined', () => true);
        chai.spy.on(service, 'parseSquareConfig', () => {
            return { multiplier: 2, multiplierEffect: MultiplierEffect.LETTER };
        });
        expect(service['readScoreMultiplierConfig'](new Position(5, 5))).to.deep.equal({
            multiplier: 2,
            multiplierEffect: MultiplierEffect.LETTER,
        });
    });

    it('Initializing board should put center at the center of the board', () => {
        chai.spy.on(service, 'readScoreMultiplierConfig', () => null);
        const board: Board = service.initializeBoard();

        const expectedCenter: Position = new Position(7, 7);
        expect(board.grid[expectedCenter.row][expectedCenter.column].isCenter).to.be.true;
    });

    it('Created board should be the size of size' + BOARD_SIZE.x + 'x' + BOARD_SIZE.y, () => {
        chai.spy.on(service, 'readScoreMultiplierConfig', () => null);
        const board: Board = service.initializeBoard();

        expect(board.grid.length).to.equal(BOARD_SIZE.x);
        expect(board.grid[0].length).to.equal(BOARD_SIZE.y);
    });

    boardInitializationTestCases.forEach((value: Square | undefined, position: Position) => {
        const testText = value ? '' : 'NOT';
        it('Created board should ' + testText + ' have a square at ' + position.row + '/' + position.column, () => {
            if (value) {
                chai.spy.on(service, 'readScoreMultiplierConfig', () => value.scoreMultiplier);
            }
            const board: Board = service.initializeBoard();

            if (value) {
                expect(board.grid[position.row][position.column]).to.deep.equal(value);
            } else {
                if (board.grid[position.row]) {
                    expect(board.grid[position.row][position.column]).to.not.exist;
                } else {
                    expect(board.grid[position.row]).to.not.exist;
                }
            }
        });
    });
});
