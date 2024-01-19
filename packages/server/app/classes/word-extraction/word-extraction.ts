import { Board, BoardNavigator, Orientation, Position } from '@app/classes/board';
import { SHOULD_HAVE_A_TILE as HAS_TILE } from '@app/classes/board/board';
import Direction from '@app/classes/board/direction';
import { HttpException } from '@app/classes/http-exception/http-exception';
import { Square } from '@app/classes/square';
import { Tile } from '@app/classes/tile';
import { WordPlacement } from '@app/classes/word-finding';
import { EXTRACTION_NO_WORDS_CREATED, EXTRACTION_SQUARE_ALREADY_FILLED, POSITION_OUT_OF_BOARD } from '@app/constants/classes-errors';
import { switchOrientation } from '@app/utils/switch-orientation/switch-orientation';
import { StatusCodes } from 'http-status-codes';

export class WordExtraction {
    constructor(private board: Board) {}

    extract(wordPlacement: WordPlacement): [Square, Tile][][] {
        const navigator = this.board.navigate(wordPlacement.startPosition, wordPlacement.orientation);

        if (navigator.verify(HAS_TILE)) throw new HttpException(EXTRACTION_SQUARE_ALREADY_FILLED, StatusCodes.BAD_REQUEST);
        if (this.isWordWithinBounds(navigator, wordPlacement.tilesToPlace)) throw new HttpException(POSITION_OUT_OF_BOARD, StatusCodes.NOT_FOUND);

        const wordsCreated: [Square, Tile][][] = new Array();
        const newWord: [Square, Tile][] = [];

        for (let i = 0; i < wordPlacement.tilesToPlace.length; ) {
            if (!navigator.isWithinBounds()) throw new HttpException(POSITION_OUT_OF_BOARD, StatusCodes.NOT_FOUND);

            if (navigator.square.tile) {
                newWord.push([navigator.square, navigator.square.tile]);
            } else {
                newWord.push([navigator.square, wordPlacement.tilesToPlace[i]]);

                // Add the words created in the opposite Orientation of the move
                const oppositeOrientation = switchOrientation(wordPlacement.orientation);
                if (navigator.verifyNeighbors(oppositeOrientation, HAS_TILE)) {
                    wordsCreated.push(this.extractWordAroundTile(oppositeOrientation, navigator.position, wordPlacement.tilesToPlace[i]));
                }

                i++;
            }

            navigator.forward();
        }
        navigator.backward();

        const beforeWord = this.extractWordInDirection(wordPlacement.orientation, Direction.Backward, wordPlacement.startPosition);
        const afterWord = this.extractWordInDirection(wordPlacement.orientation, Direction.Forward, navigator.position);
        const word = [...beforeWord, ...newWord, ...afterWord];

        if (word.length > 1) wordsCreated.push(word);

        if (wordsCreated.length < 1) throw Error(EXTRACTION_NO_WORDS_CREATED);

        return wordsCreated;
    }

    private extractWordAroundTile(orientation: Orientation, position: Position, tile: Tile): [Square, Tile][] {
        const previous = this.extractWordInDirection(orientation, Direction.Backward, position);
        const next = this.extractWordInDirection(orientation, Direction.Forward, position);
        const current = [[this.board.getSquare(position), tile]] as [Square, Tile][];

        return [...previous, ...current, ...next];
    }

    private extractWordInDirection(orientation: Orientation, direction: Direction, position: Position): [Square, Tile][] {
        const navigator = this.board.navigate(position, orientation);
        if (navigator.verify(HAS_TILE)) throw new HttpException(EXTRACTION_SQUARE_ALREADY_FILLED, StatusCodes.BAD_REQUEST);
        const word: [Square, Tile][] = [];

        while (navigator.move(direction).verify(HAS_TILE)) {
            if (navigator.square.tile) word.push([navigator.square, navigator.square.tile]);
        }

        if (direction === Direction.Backward) word.reverse();

        return word;
    }

    private isWordWithinBounds(navigator: BoardNavigator, tilesToPlace: Tile[]): boolean {
        return !navigator
            .clone()
            .forward(tilesToPlace.length - 1)
            .isWithinBounds();
    }
}
