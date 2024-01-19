/* eslint-disable max-lines */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
import { Board, BoardNavigator, Orientation, Position } from '@app/classes/board';
import Direction from '@app/classes/board/direction';
import { Vec2 } from '@app/classes/board/vec2';
import Player from '@app/classes/player/player';
import { Square } from '@app/classes/square';
import { LetterValue, Tile } from '@app/classes/tile';
import { BoardPlacement, LinePlacements, WithDistance } from '@app/classes/word-finding';
import { INITIAL_POSITION, MAX_TILES_PER_PLAYER } from '@app/constants/game-constants';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { SinonStub, stub } from 'sinon';
import BoardPlacementsExtractor from './board-placement-extractor';

const DEFAULT_BOARD: (LetterValue | ' ')[][] = [
    [' ', ' ', 'X', ' ', 'O', 'P'],
    [' ', ' ', ' ', 'Y', ' ', ' '],
    [' ', 'Z', 'N', ' ', ' ', ' '],
    [' ', ' ', 'M', 'L', 'Q', 'R'],
    [' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' '],
];
const DEFAULT_TILES: LetterValue[] = ['A', 'B', 'C'];

const letterToSquare = (letter: LetterValue | ' '): Square =>
    ({
        tile: letter === ' ' ? null : ({ letter } as Tile),
    } as Square);
const USER1 = { username: 'user1', email: 'email1', avatar: 'avatar1' };

describe('WordFindingPositionExtractor', () => {
    let board: Board;
    let player: Player;
    let extractor: BoardPlacementsExtractor;
    let navigator: BoardNavigator;

    beforeEach(() => {
        board = new Board(
            DEFAULT_BOARD.map((line, row) =>
                line.map<Square>((value, column) => ({
                    ...letterToSquare(value),
                    position: new Position(row, column),
                })),
            ),
        );

        player = new Player('', USER1);
        player.tiles = DEFAULT_TILES.map((letter) => ({ letter } as Tile));

        extractor = new BoardPlacementsExtractor(board);
        navigator = extractor['navigator'];
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('extractBoardPlacements', () => {
        let extractBoardPlacementsFromLineStub: SinonStub;

        beforeEach(() => {
            extractBoardPlacementsFromLineStub = stub(extractor, 'extractBoardPlacementsFromLine' as any).returns([]);
        });

        it('should call extractBoardPlacementsFromLine # rows + # cols times', () => {
            const expected = board.getSize().x + board.getSize().y;
            extractor.extractBoardPlacements();
            expect(extractBoardPlacementsFromLineStub.callCount).to.equal(expected);
        });

        it('should concat all of extractBoardPlacementsFromLine results', () => {
            const call0: BoardPlacement[] = [1, 2, 3] as unknown as BoardPlacement[];
            const call1: BoardPlacement[] = [4, 5, 6, 7] as unknown as BoardPlacement[];
            const expected = [...call0, ...call1];

            extractBoardPlacementsFromLineStub.onCall(0).returns(call0);
            extractBoardPlacementsFromLineStub.onCall(1).returns(call1);

            const result = extractor.extractBoardPlacements();

            expect(result).to.deep.equal(expected);
        });

        it('should add center position if board is empty', () => {
            stub(extractor, 'isBoardEmpty' as any).returns(true);

            const result = extractor.extractBoardPlacements();

            expect(result).to.have.length(1);
            expect(result[0].position.row).to.equal(INITIAL_POSITION.x);
            expect(result[0].position.column).to.equal(INITIAL_POSITION.y);
            expect(result[0].orientation).to.equal(Orientation.Horizontal);
            expect(result[0].letters).to.deep.equal([]);
            expect(result[0].perpendicularLetters).to.deep.equal([]);
            expect(result[0].minSize).to.equal(0);
            expect(result[0].maxSize).to.equal(MAX_TILES_PER_PLAYER);
        });
    });

    describe('extractBoardPlacementsFromLine', () => {
        let extractLinePlacementsStub: SinonStub;
        let adjustLinePlacementsStub: SinonStub;
        let isValidBoardPlacementStub: SinonStub;

        beforeEach(() => {
            extractLinePlacementsStub = stub(extractor, 'extractLinePlacements' as any).returns({
                letters: [],
                perpendicularLetters: [],
            });
            adjustLinePlacementsStub = stub(extractor, 'adjustLinePlacements' as any).returns({
                letters: [],
                perpendicularLetters: [],
            });
            isValidBoardPlacementStub = stub(extractor, 'isValidBoardPlacement' as any).returns(true);
            stub(extractor, 'getSize' as any).returns(DEFAULT_BOARD.length);
        });

        it('should call extractLinePlacements with navigator', () => {
            extractor['extractBoardPlacementsFromLine'](navigator);
            expect(extractLinePlacementsStub.called).to.be.true;
        });

        it('should call extractPosition n times', () => {
            const n = board.getSize().x;
            extractor['extractBoardPlacementsFromLine'](navigator);
            expect(adjustLinePlacementsStub.callCount).to.equal(n);
        });

        it('should return as many items as extractPosition returns', () => {
            adjustLinePlacementsStub.returns(undefined);

            const n = 2;
            for (let i = 0; i < n; ++i) {
                adjustLinePlacementsStub.onCall(i).returns({
                    letters: [],
                    perpendicularLetters: [],
                });
            }

            const result = extractor['extractBoardPlacementsFromLine'](navigator);
            expect(result).to.have.length(n);
        });

        it('should return nothing if not valid board placements', () => {
            adjustLinePlacementsStub.returns({
                letters: [],
                perpendicularLetters: [],
            });
            isValidBoardPlacementStub.returns(false);

            const result = extractor['extractBoardPlacementsFromLine'](navigator);
            expect(result).to.be.empty;
        });

        const tests: [linePlacement: LinePlacements, position: Position, distance: number][] = [
            [{ letters: [{ letter: 'A', distance: 3 }], perpendicularLetters: [] }, new Position(3, 0), 1],
            [{ letters: [{ letter: 'B', distance: 1 }], perpendicularLetters: [] }, new Position(4, 3), 2],
            [{ letters: [{ letter: 'C', distance: 0 }], perpendicularLetters: [] }, new Position(0, 1), 3],
        ];

        let index = 1;
        for (const [extractedPositions, position, distance] of tests) {
            it(`should create BoardPlacement from extractedPosition (${index})`, () => {
                const size = DEFAULT_BOARD.length;

                adjustLinePlacementsStub.returns(undefined);
                adjustLinePlacementsStub.onCall(distance).returns(extractedPositions);
                navigator.position = position;
                navigator.orientation = Orientation.Horizontal;

                const result = extractor['extractBoardPlacementsFromLine'](navigator);

                expect(result).to.have.length(1);
                expect(result[0].letters).to.equal(extractedPositions.letters);
                expect(result[0].perpendicularLetters).to.equal(extractedPositions.perpendicularLetters);
                expect(result[0].position).to.deep.equal(new Position(position.row, position.column + distance));
                expect(result[0].orientation).to.equal(navigator.orientation);
                expect(result[0].maxSize).to.equal(size - distance);
            });
            index++;
        }
    });

    describe('extractLinePlacements', () => {
        let size: number;
        let moveThroughLineStub: SinonStub;
        let verifyPerpendicularNeighborsStub: SinonStub;
        let getPerpendicularLettersStub: SinonStub;

        beforeEach(() => {
            moveThroughLineStub = stub(extractor, 'moveThroughLine' as any).returns([0, 1, 2, 3]);
            verifyPerpendicularNeighborsStub = stub(navigator, 'verifyPerpendicularNeighbors').returns(false);
            getPerpendicularLettersStub = stub(extractor, 'getPerpendicularLetters' as any).returns([]);
            stub(navigator, 'clone').returns(navigator);
            size = moveThroughLineStub().length;
        });

        it('should call moveThroughLine', () => {
            moveThroughLineStub.returns([]);
            extractor['extractLinePlacements'](navigator);
            expect(moveThroughLineStub.called).to.be.true;
        });

        it('should call verifyPerpendicularNeighbors for every positions if navigator square has no tile', () => {
            extractor['extractLinePlacements'](navigator);
            navigator.square.tile = null;
            expect(verifyPerpendicularNeighborsStub.callCount).to.equal(size);
        });

        it('should call getPerpendicularLetters twice for every verifyPerpendicularNeighbors at true if navigator square has no tile', () => {
            const n = 2;

            verifyPerpendicularNeighborsStub.returns(false);
            for (let i = 0; i < n; ++i) verifyPerpendicularNeighborsStub.onCall(i).returns(true);

            navigator.square.tile = null;
            extractor['extractLinePlacements'](navigator);

            expect(getPerpendicularLettersStub.callCount).to.equal(n * 2);
        });

        it('should return result with letters length equals to iteration with tile not null', () => {
            navigator.square.tile = {} as Tile;
            const result = extractor['extractLinePlacements'](navigator);
            expect(result.letters).to.have.length(size);
        });

        it('should return result with perpendicularLetters length equals to iteration with tile null and verifyPerpendicularNeighbors true', () => {
            const n = 2;

            verifyPerpendicularNeighborsStub.returns(false);
            for (let i = 0; i < n; ++i) verifyPerpendicularNeighborsStub.onCall(i).returns(true);

            navigator.square.tile = null;
            const result = extractor['extractLinePlacements'](navigator);

            expect(result.perpendicularLetters).to.have.length(n);
        });

        it('should return result with letters with tile letter', () => {
            navigator.square.tile = { letter: 'Z' } as Tile;
            const result = extractor['extractLinePlacements'](navigator);

            expect(result.letters[0].letter).to.equal(navigator.square.tile.letter);
        });

        it('should return result with perpendicularLetters from getPerpendicularLetters', () => {
            const before: LetterValue[] = ['A', 'B', 'C'];
            const after: LetterValue[] = ['Y', 'Z'];

            getPerpendicularLettersStub.onCall(0).returns(before.reverse());
            getPerpendicularLettersStub.onCall(1).returns(after);
            verifyPerpendicularNeighborsStub.returns(true);
            navigator.square.tile = null;

            const result = extractor['extractLinePlacements'](navigator);

            expect(result.perpendicularLetters[0].before).to.deep.equal(before);
            expect(result.perpendicularLetters[0].after).to.deep.equal(after);
        });
    });

    describe('adjustLinePlacements', () => {
        let adjustDistancesStub: SinonStub;
        let linePlacement: LinePlacements;
        let distance: number;

        beforeEach(() => {
            adjustDistancesStub = stub(extractor, 'adjustDistances' as any).callsFake((a) => a);
            linePlacement = {
                letters: [],
                perpendicularLetters: [],
            };
            distance = 3;
        });

        it('should call adjustDistances with letters', () => {
            extractor['adjustLinePlacements'](linePlacement, distance);

            expect(adjustDistancesStub.calledWith(linePlacement.letters, distance)).to.be.true;
            expect(adjustDistancesStub.calledWith(linePlacement.perpendicularLetters, distance)).to.be.true;
        });

        it('should return undefined if letter just before', () => {
            linePlacement.letters = [{ letter: 'A', distance: -1 }];

            const result = extractor['adjustLinePlacements'](linePlacement, distance);

            expect(result).to.be.undefined;
        });

        it('should return undefined if no letters or perpendicular letters', () => {
            const result = extractor['adjustLinePlacements'](linePlacement, distance);

            expect(result).to.be.undefined;
        });

        it('should return undefined if all placements are before', () => {
            linePlacement.letters = [
                { letter: 'A', distance: -2 },
                { letter: 'B', distance: -4 },
            ];

            const result = extractor['adjustLinePlacements'](linePlacement, distance);

            expect(result).to.be.undefined;
        });

        it('should return if letters have values (no perpendicular)', () => {
            linePlacement.letters = [{ letter: 'A', distance: 1 }];

            const result = extractor['adjustLinePlacements'](linePlacement, distance);

            expect(result).to.not.be.undefined;
        });

        it('should return if perpendicular letters have values (no letters in line)', () => {
            linePlacement.perpendicularLetters = [{ before: [], after: [], distance: 2 }];

            const result = extractor['adjustLinePlacements'](linePlacement, distance);

            expect(result).to.not.be.undefined;
        });

        it('should return all letters if distance >= 0', () => {
            linePlacement.letters = [
                { letter: 'A', distance: 2 },
                { letter: 'B', distance: 4 },
            ];

            const result = extractor['adjustLinePlacements'](linePlacement, distance);

            expect(result?.letters).to.deep.equal(linePlacement.letters);
        });

        it('should return all perpendicular letters if distance >= 0', () => {
            linePlacement.perpendicularLetters = [
                { before: ['A', 'B'], after: [], distance: 2 },
                { before: ['C'], after: ['D'], distance: 4 },
            ];

            const result = extractor['adjustLinePlacements'](linePlacement, distance);

            expect(result?.perpendicularLetters).to.deep.equal(linePlacement.perpendicularLetters);
        });
    });

    describe('getPerpendicularLetters', () => {
        const tests: [row: number, column: number, direction: Direction, orientation: Orientation, expected: LetterValue[]][] = [
            [0, 0, Direction.Forward, Orientation.Vertical, []],
            [0, 3, Direction.Forward, Orientation.Vertical, ['Y']],
            [1, 2, Direction.Backward, Orientation.Vertical, ['X']],
            [1, 2, Direction.Forward, Orientation.Vertical, ['N', 'M']],
            [3, 1, Direction.Forward, Orientation.Horizontal, ['M', 'L', 'Q', 'R']],
        ];

        beforeEach(() => {
            stub(navigator, 'clone').returns(navigator);
        });

        let index = 0;
        for (const [row, column, direction, orientation, expected] of tests) {
            // eslint-disable-next-line max-len
            it(`should return ${expected} for position (${row}, ${column}) with direction=${direction} and orientation=${orientation} (${index})`, () => {
                navigator.position = new Position(row, column);
                navigator.orientation = orientation;

                const result = extractor['getPerpendicularLetters'](navigator, direction);

                expect(result).to.deep.equal(expected);
            });
            index++;
        }
    });

    describe('adjustDistances', () => {
        const tests: [initials: number[], distance: number][] = [
            [[4, 7, 33], 5],
            [[12], 7],
            [[4, 43], 4],
            [[9999, 8888], 9999],
            [[69], 420],
        ];

        let index = 0;
        for (const [initials, distance] of tests) {
            it(`should adjust the distance (${index})`, () => {
                const obj: WithDistance[] = initials.map((i) => ({ distance: i }));

                const results = extractor['adjustDistances'](obj, distance);

                for (let i = 0; i < results.length; ++i) {
                    expect(results[i].distance).to.equal(initials[i] - distance);
                }
            });
            index++;
        }
    });

    describe('getMinSize', () => {
        let linePlacements: LinePlacements;

        beforeEach(() => {
            linePlacements = {
                letters: [],
                perpendicularLetters: [],
            };
        });

        it('should return first letters distance if no perpendicular letters', () => {
            const expected = 4;
            linePlacements.letters = [{ letter: 'A', distance: expected }];

            const result = extractor['getMinSize'](linePlacements);

            expect(result).to.equal(expected);
        });

        it('should return first perpendicular letter distance if no letters', () => {
            const expected = 2;
            linePlacements.perpendicularLetters = [{ before: [], after: [], distance: expected }];

            const result = extractor['getMinSize'](linePlacements);

            expect(result).to.equal(expected + 1);
        });

        it('should return first letters distance if smaller than first perpendicular letter distance', () => {
            const letterDistance = 3;
            const perpendicularLettersDistance = 6;

            linePlacements.letters = [{ letter: 'A', distance: letterDistance }];
            linePlacements.perpendicularLetters = [{ before: [], after: [], distance: perpendicularLettersDistance }];

            const result = extractor['getMinSize'](linePlacements);

            expect(result).to.equal(letterDistance);
        });

        it('should return first perpendicular letters distance if smaller than first letter distance', () => {
            const letterDistance = 8;
            const perpendicularLettersDistance = 4;

            linePlacements.letters = [{ letter: 'A', distance: letterDistance }];
            linePlacements.perpendicularLetters = [{ before: [], after: [], distance: perpendicularLettersDistance }];

            const result = extractor['getMinSize'](linePlacements);

            expect(result).to.equal(perpendicularLettersDistance + 1);
        });

        it('should return infinity if none', () => {
            const result = extractor['getMinSize'](linePlacements);

            expect(result).to.not.be.finite;
        });
    });

    describe('getSize', () => {
        const tests: [orientation: Orientation, axis: keyof Vec2][] = [
            [Orientation.Horizontal, 'x'],
            [Orientation.Vertical, 'y'],
        ];
        let size: Vec2;

        beforeEach(() => {
            size = { x: 3, y: 5 };
            stub(board, 'getSize').returns(size);
        });

        for (const [orientation, axis] of tests) {
            it(`should return ${axis} axis when orientation is ${orientation}`, () => {
                expect(extractor['getSize'](orientation)).to.equal(size[axis]);
            });
        }
    });

    describe('isValidBoardPlacement', () => {
        const tests: [maxSize: number, letterLength: number, expected: boolean][] = [
            [3, 1, true],
            [3, 5, false],
            [1, 1, false],
        ];

        let index = 0;
        for (const [maxSize, letterLength, expected] of tests) {
            it(`should validate board placement (${index})`, () => {
                const boardPlacement: BoardPlacement = {
                    maxSize,
                    letters: new Array(letterLength),
                } as BoardPlacement;

                const result = extractor['isValidBoardPlacement'](boardPlacement);

                expect(result).to.equal(expected);
            });
            index++;
        }
    });
});
