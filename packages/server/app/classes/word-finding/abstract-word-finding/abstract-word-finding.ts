import { Board, BoardNavigator, Orientation, Position } from '@app/classes/board';
import { Dictionary } from '@app/classes/dictionary';
import { HttpException } from '@app/classes/http-exception/http-exception';
import { Square } from '@app/classes/square';
import { LetterValue, Tile } from '@app/classes/tile';
import {
    BoardPlacement,
    BoardPlacementsExtractor,
    DictionarySearcher,
    DictionarySearchResult,
    ScoredWordPlacement,
    WordFindingRequest,
} from '@app/classes/word-finding';
import { ERROR_PLAYER_DOESNT_HAVE_TILE } from '@app/constants/classes-errors';
import { BLANK_TILE_LETTER_VALUE, NOT_FOUND } from '@app/constants/game-constants';
import { ScoreCalculatorService } from '@app/services/score-calculator-service/score-calculator.service';
import { arrayDeepCopy } from '@app/utils/deep-copy/deep-copy';
import { Random } from '@app/utils/random/random';
import { switchOrientation } from '@app/utils/switch-orientation/switch-orientation';
import { StatusCodes } from 'http-status-codes';

export default abstract class AbstractWordFinding {
    wordPlacements: ScoredWordPlacement[] = [];

    constructor(
        private board: Board,
        private tiles: Tile[],
        protected request: WordFindingRequest,
        private dictionary: Dictionary,
        private scoreCalculatorService: ScoreCalculatorService,
    ) {
        this.tiles = arrayDeepCopy(this.tiles);
    }

    findWords(): ScoredWordPlacement[] {
        const playerLetters = this.convertTilesToLetters(this.tiles);

        for (const boardPlacement of this.randomBoardPlacements()) {
            const searcher = new DictionarySearcher(this.dictionary, playerLetters, boardPlacement);

            for (const wordResult of searcher.getAllWords()) {
                const wordPlacement = this.getWordPlacement(wordResult, boardPlacement);

                if (this.validateWordPlacement(wordPlacement)) {
                    this.handleWordPlacement(wordPlacement);

                    if (this.isSearchCompleted()) return this.wordPlacements;
                }
            }
        }

        return this.wordPlacements;
    }

    protected isWithinPointRange(score: number): boolean {
        return this.request.pointRange ? this.request.pointRange.isWithinRange(score) : true;
    }

    private *randomBoardPlacements(): Generator<BoardPlacement> {
        const extractor = new BoardPlacementsExtractor(this.board);
        const boardPlacements = extractor.extractBoardPlacements();

        let currentBoardPlacement: BoardPlacement | undefined;
        while ((currentBoardPlacement = Random.popRandom(boardPlacements))) {
            yield currentBoardPlacement;
        }
    }

    private getWordPlacement(wordResult: DictionarySearchResult, boardPlacement: BoardPlacement): ScoredWordPlacement {
        const wordSquareTiles = this.extractWordSquareTiles(wordResult, boardPlacement);
        const perpendicularWordsSquareTiles = this.extractPerpendicularWordsSquareTiles(wordResult, boardPlacement);

        const squareTilesToPlace = wordSquareTiles.filter(([square]) => !square.tile);
        const tilesToPlace = squareTilesToPlace.map(([, tile]) => tile);

        const score =
            this.scoreCalculatorService.calculatePoints([wordSquareTiles, ...perpendicularWordsSquareTiles]) +
            this.scoreCalculatorService.bonusPoints(tilesToPlace);

        return {
            tilesToPlace,
            orientation: boardPlacement.orientation,
            startPosition: squareTilesToPlace[0][0].position,
            score,
        };
    }

    private validateWordPlacement(wordPlacement: ScoredWordPlacement): boolean {
        return this.isWithinPointRange(wordPlacement.score);
    }

    private extractWordSquareTiles(wordResult: DictionarySearchResult, boardPlacement: BoardPlacement): [Square, Tile][] {
        return this.extractSquareTiles(boardPlacement.position, boardPlacement.orientation, wordResult.word);
    }

    private extractPerpendicularWordsSquareTiles(wordResult: DictionarySearchResult, boardPlacement: BoardPlacement): [Square, Tile][][] {
        const squareTiles: [Square, Tile][][] = [];
        for (const { word, distance, junctionDistance } of wordResult.perpendicularWords) {
            squareTiles.push(
                this.extractSquareTiles(
                    this.getPerpendicularWordPosition(boardPlacement, distance, junctionDistance),
                    switchOrientation(boardPlacement.orientation),
                    word,
                ),
            );
        }
        return squareTiles;
    }

    private extractSquareTiles(position: Position, orientation: Orientation, word: string): [Square, Tile][] {
        const navigator = new BoardNavigator(this.board, position, orientation);
        const playerTiles = [...this.tiles];
        const squareTiles: [Square, Tile][] = [];

        for (let i = 0; i < word.length; ++i) {
            const tile: Tile = !navigator.square.tile ? this.getTileFromLetter(playerTiles, word.charAt(i)) : navigator.square.tile;

            squareTiles.push([navigator.square, tile]);

            navigator.forward();
        }

        return squareTiles;
    }

    private getTileFromLetter(tiles: Tile[], letter: string): Tile {
        let index = tiles.findIndex((tile) => tile.letter === letter.toUpperCase());

        if (index === NOT_FOUND) {
            index = tiles.findIndex((tile) => tile.letter === BLANK_TILE_LETTER_VALUE);
            if (index === NOT_FOUND) throw new HttpException(ERROR_PLAYER_DOESNT_HAVE_TILE, StatusCodes.FORBIDDEN);
            const foundBlankTile = tiles.splice(index, 1)[0];
            return { ...foundBlankTile, letter: letter.toUpperCase() as LetterValue, isBlank: true };
        }

        return tiles.splice(index, 1)[0];
    }

    private convertTilesToLetters(tiles: Tile[]): LetterValue[] {
        return tiles.map((tile) => tile.letter);
    }

    private getPerpendicularWordPosition(boardPlacement: BoardPlacement, distance: number, junctionDistance: number): Position {
        return new BoardNavigator(this.board, boardPlacement.position, boardPlacement.orientation)
            .forward(distance)
            .switchOrientation()
            .backward(junctionDistance).position;
    }

    protected abstract handleWordPlacement(wordPlacement: ScoredWordPlacement): void;

    protected abstract isSearchCompleted(): boolean;
}
