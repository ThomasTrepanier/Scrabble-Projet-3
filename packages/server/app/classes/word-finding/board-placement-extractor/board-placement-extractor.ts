import { Board, BoardNavigator, Orientation, Position } from '@app/classes/board';
import Direction from '@app/classes/board/direction';
import { LetterValue } from '@app/classes/tile';
import { BoardPlacement, LetterPosition, LinePlacements, WithDistance } from '@app/classes/word-finding';
import { INITIAL_POSITION, MAX_TILES_PER_PLAYER } from '@app/constants/game-constants';
import { Random } from '@app/utils/random/random';
import * as seedrandom from 'seedrandom';

const HAS_TILE_IN_PREVIOUS_POSITION = -1;
const SHOULD_BE_FILLED = true;

export default class BoardPlacementsExtractor {
    private navigator: BoardNavigator;
    private board: Board;
    private readonly random: seedrandom.PRNG;

    constructor(board: Board, random = seedrandom()) {
        this.board = board;
        this.random = random;
        this.navigator = new BoardNavigator(board, new Position(0, 0), Orientation.Horizontal);
    }

    extractBoardPlacements(): BoardPlacement[] {
        let boardPlacements: BoardPlacement[] = [];

        for (const orientation of [Orientation.Horizontal, Orientation.Vertical]) {
            this.navigator.position = new Position(0, 0);
            this.navigator.orientation = orientation;

            do {
                const lineBoardPlacement = this.extractBoardPlacementsFromLine(this.navigator);
                boardPlacements = boardPlacements.concat(lineBoardPlacement);
                this.navigator.nextLine();
            } while (this.navigator.isWithinBounds());
        }

        if (boardPlacements.length === 0 && this.isBoardEmpty()) {
            boardPlacements.push({
                position: new Position(INITIAL_POSITION.x, INITIAL_POSITION.y),
                orientation: Orientation.Horizontal,
                letters: [],
                perpendicularLetters: [],
                minSize: 0,
                maxSize: MAX_TILES_PER_PLAYER,
            });
        }

        return boardPlacements;
    }

    *[Symbol.iterator](): Generator<BoardPlacement> {
        const boardPlacements = this.extractBoardPlacements();

        let currentBoardPlacement: BoardPlacement | undefined;
        while ((currentBoardPlacement = Random.popRandom(boardPlacements, this.random))) {
            yield currentBoardPlacement;
        }
    }

    private extractBoardPlacementsFromLine(navigator: BoardNavigator): BoardPlacement[] {
        const boardPlacements: BoardPlacement[] = [];

        navigator = navigator.clone();

        const linePlacements = this.extractLinePlacements(navigator);

        for (const distance of this.moveThroughLine(navigator)) {
            const adjustedLinePlacements = this.adjustLinePlacements(linePlacements, distance);

            if (!adjustedLinePlacements) continue;

            const boardPlacement: BoardPlacement = {
                letters: adjustedLinePlacements.letters,
                perpendicularLetters: adjustedLinePlacements.perpendicularLetters,
                position: navigator.position.copy(),
                orientation: navigator.orientation,
                maxSize: this.getSize(navigator.orientation) - distance,
                minSize: this.getMinSize(adjustedLinePlacements),
            };

            if (this.isValidBoardPlacement(boardPlacement)) boardPlacements.push(boardPlacement);
        }

        return boardPlacements;
    }

    private extractLinePlacements(navigator: BoardNavigator): LinePlacements {
        const linePlacements: LinePlacements = {
            letters: [],
            perpendicularLetters: [],
        };

        navigator = navigator.clone();

        for (const distance of this.moveThroughLine(navigator)) {
            if (navigator.square.tile) {
                linePlacements.letters.push({
                    letter: navigator.square.tile.letter,
                    distance,
                });
            } else if (navigator.verifyPerpendicularNeighbors(SHOULD_BE_FILLED)) {
                linePlacements.perpendicularLetters.push({
                    before: this.getPerpendicularLetters(navigator.clone().switchOrientation(), Direction.Backward).reverse(),
                    after: this.getPerpendicularLetters(navigator.clone().switchOrientation(), Direction.Forward),
                    distance,
                });
            }
        }

        return linePlacements;
    }

    private adjustLinePlacements(linePlacements: LinePlacements, distance: number): LinePlacements | undefined {
        let letters = this.adjustDistances(linePlacements.letters, distance);
        let perpendicularLetters = this.adjustDistances(linePlacements.perpendicularLetters, distance);

        if (this.hasTileJustBefore(letters)) return undefined;

        letters = letters.filter((letter) => letter.distance >= 0);
        perpendicularLetters = perpendicularLetters.filter((letter) => letter.distance >= 0);

        if (letters.length > 0 || perpendicularLetters.length > 0) return { letters, perpendicularLetters };

        return undefined;
    }

    private getPerpendicularLetters(navigator: BoardNavigator, direction: Direction): LetterValue[] {
        navigator = navigator.clone();
        const letters: LetterValue[] = [];
        while (navigator.move(direction) && navigator.isWithinBounds() && navigator.square.tile) letters.push(navigator.square.tile.letter);
        return letters;
    }

    private adjustDistances<T extends WithDistance>(placements: T[], distance: number): T[] {
        return placements.map((placement) => ({ ...placement, distance: placement.distance - distance }));
    }

    private getSize(orientation: Orientation): number {
        return orientation === Orientation.Horizontal ? this.board.getSize().x : this.board.getSize().y;
    }

    private getMinSize(linePlacement: LinePlacements): number {
        return Math.min(
            linePlacement.letters.find(() => true)?.distance ?? Number.POSITIVE_INFINITY,
            (linePlacement.perpendicularLetters.find(() => true)?.distance ?? Number.POSITIVE_INFINITY) + 1,
        );
    }

    private isValidBoardPlacement(boardPlacement: BoardPlacement): boolean {
        return boardPlacement.maxSize > boardPlacement.letters.length;
    }

    private hasTileJustBefore(letters: LetterPosition[]): boolean {
        return letters.some((letter) => letter.distance === HAS_TILE_IN_PREVIOUS_POSITION);
    }

    private *moveThroughLine(navigator: BoardNavigator): Generator<number> {
        let distance = 0;
        while (navigator.isWithinBounds()) {
            yield distance;
            distance++;
            navigator.forward();
        }
    }

    private isBoardEmpty(): boolean {
        return this.board.grid.every((line) => line.every((square) => square.tile === null));
    }
}
