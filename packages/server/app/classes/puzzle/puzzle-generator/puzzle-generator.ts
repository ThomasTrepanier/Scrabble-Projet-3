import { Board, BoardNavigator } from '@app/classes/board';
import { Dictionary } from '@app/classes/dictionary';
import BoardService from '@app/services/board-service/board.service';
import DictionaryService from '@app/services/dictionary-service/dictionary.service';
import { WordsVerificationService } from '@app/services/words-verification-service/words-verification.service';
import { Container } from 'typedi';
import { BoardPlacement, BoardPlacementsExtractor } from '@app/classes/word-finding';
import { WordExtraction } from '@app/classes/word-extraction/word-extraction';
import { LetterValue, Tile } from '@app/classes/tile';
import { StringConversion } from '@app/utils/string-conversion/string-conversion';
import { DictionarySearcherRandom } from '@app/classes/word-finding/dictionary-searcher/dictionary-searcher-random';
import { letterDistributionMap } from '@app/constants/letter-distributions';
import { Random } from '@app/utils/random/random';
import { PuzzleGeneratorParameters } from './puzzle-generator-parameters';
import {
    MAX_WORD_COUNT,
    MAX_WORD_SIZE,
    MIN_WORD_COUNT,
    MIN_WORD_SIZE,
    PUZZLE_GENERATOR_NO_PLACEMENT_POSSIBLE,
    SKIP_PLACEMENT_DISTANCE_CUTOFF,
} from '@app/constants/puzzle-constants';
import { MAX_TILES_PER_PLAYER } from '@app/constants/game-constants';
import { Puzzle } from '@app/classes/puzzle/puzzle';
import * as seedrandom from 'seedrandom';

type WordPlacementParams = Pick<BoardPlacement, 'maxSize' | 'minSize'>;

export class PuzzleGenerator {
    protected random: seedrandom.PRNG;
    private readonly dictionaryService: DictionaryService;
    private readonly boardService: BoardService;
    private readonly wordsVerificationService: WordsVerificationService;
    private board: Board;
    private dictionary: Dictionary;
    private parameters: PuzzleGeneratorParameters;

    constructor({
        minWordCount = MIN_WORD_COUNT,
        maxWordCount = MAX_WORD_COUNT,
        minWordSize = MIN_WORD_SIZE,
        maxWordSize = MAX_WORD_SIZE,
        skipPlacementDistanceCutoff = SKIP_PLACEMENT_DISTANCE_CUTOFF,
        bingoWordSize = MAX_TILES_PER_PLAYER,
    }: Partial<PuzzleGeneratorParameters> = {}) {
        this.random = seedrandom();
        this.dictionaryService = Container.get(DictionaryService);
        this.boardService = Container.get(BoardService);
        this.wordsVerificationService = Container.get(WordsVerificationService);

        this.board = this.boardService.initializeBoard();
        this.dictionary = this.dictionaryService.getDefaultDictionary();
        this.parameters = { minWordCount, maxWordCount, minWordSize, maxWordSize, skipPlacementDistanceCutoff, bingoWordSize };
    }

    generate(): Puzzle {
        this.generateBoard();
        const { letters } = this.getBingo();

        return {
            board: this.board,
            tiles: Random.shuffle(
                letters.map<Tile>((letter) => {
                    const letterValue = letter.toUpperCase() as LetterValue;
                    return { letter: letterValue, value: letterDistributionMap.get(letterValue)?.score ?? 0 };
                }),
                this.random,
            ),
        };
    }

    private getBingo(): { word: string; letters: string[] } {
        for (const placement of this.getPlacementIterator()) {
            const wordSizeForBingo = this.parameters.bingoWordSize + placement.letters.length;

            if (this.placementIsInvalid(placement, { minSize: wordSizeForBingo, maxSize: wordSizeForBingo })) continue;

            const word = this.generateWordForPlacement(placement, { minSize: wordSizeForBingo, maxSize: wordSizeForBingo });

            if (word) {
                return { word, letters: word.split('').filter((_, i) => !placement.letters.some(({ distance }) => distance === i)) };
            }
        }

        throw new Error(PUZZLE_GENERATOR_NO_PLACEMENT_POSSIBLE + ': bingo');
    }

    private generateBoard(): void {
        const wordsCount = Math.floor(this.random() * (this.parameters.maxWordCount - this.parameters.minWordCount)) + this.parameters.minWordCount;

        for (let i = 0; i < wordsCount; ++i) {
            let placedWord = false;

            for (const placement of this.getPlacementIterator()) {
                if (this.placementIsInvalid(placement)) continue;

                const word = this.generateWordForPlacement(placement, {});

                if (word) {
                    this.placeWord(this.board, word, placement);
                    placedWord = true;
                    break;
                }
            }

            if (!placedWord) throw new Error(PUZZLE_GENERATOR_NO_PLACEMENT_POSSIBLE + ': puzzle');
        }
    }

    private generateWordForPlacement(
        placement: BoardPlacement,
        { maxSize = this.parameters.maxWordSize, minSize = this.parameters.minWordSize }: Partial<WordPlacementParams> = {},
    ): string | undefined {
        const dictionarySearcher = new DictionarySearcherRandom(
            this.dictionary,
            this.convertPlacementForDictionarySearch(placement, { minSize, maxSize }),
            this.random,
        );

        for (const word of dictionarySearcher) {
            try {
                this.verifyWordForPlacement(word, placement);
                return word;
            } catch (e) {
                // nothing to do.
            }
        }

        return;
    }

    private convertPlacementForDictionarySearch(
        placement: BoardPlacement,
        { maxSize = this.parameters.maxWordSize, minSize = this.parameters.minWordSize }: Partial<WordPlacementParams> = {},
    ): BoardPlacement {
        return {
            ...placement,
            maxSize: Math.min(placement.maxSize, maxSize),
            minSize: Math.max(placement.minSize, minSize),
        };
    }

    private verifyWordForPlacement(word: string, placement: BoardPlacement): void {
        const wordExtraction = new WordExtraction(this.board);
        const letters = word.split('').filter((l, i) => !placement.letters.find(({ distance }) => i === distance));

        const createdWords = wordExtraction.extract({
            tilesToPlace: letters.map<Tile>((letter) => {
                const letterValue = letter.toUpperCase() as LetterValue;
                return {
                    letter: letterValue,
                    value: letterDistributionMap.get(letterValue)?.score ?? 0,
                };
            }),
            orientation: placement.orientation,
            startPosition: placement.position,
        });

        this.wordsVerificationService.verifyWords(StringConversion.wordsToString(createdWords), this.dictionary.summary.id);
    }

    private placeWord(board: Board, word: string, placement: BoardPlacement): void {
        const navigator = new BoardNavigator(board, placement.position, placement.orientation);
        for (const c of word.split('')) {
            const letter = c.toUpperCase() as LetterValue;
            navigator.square.tile = { letter, value: letterDistributionMap.get(letter)?.score ?? 0 };
            navigator.square.wasMultiplierUsed = true;
            navigator.forward();
        }
    }

    private *getPlacementIterator(): Generator<BoardPlacement> {
        const extractor = new BoardPlacementsExtractor(this.board, this.random);
        const placementQueue: BoardPlacement[] = [];

        for (const placement of extractor) {
            if (this.shouldSkipPlacement(placement)) {
                placementQueue.push(placement);
            } else {
                yield placement;
            }
        }

        for (const placement of placementQueue) {
            yield placement;
        }
    }

    private placementIsInvalid(
        placement: BoardPlacement,
        { maxSize = this.parameters.maxWordSize, minSize = this.parameters.minWordSize }: Partial<WordPlacementParams> = {},
    ): boolean {
        return (
            placement.letters.length > 2 ||
            placement.perpendicularLetters.length > 2 ||
            (placement.letters.length > 0 && placement.letters[0].distance === 0) ||
            placement.maxSize < minSize ||
            placement.minSize > maxSize ||
            (maxSize === minSize && placement.letters.some(({ distance }) => distance === minSize))
        );
    }

    private shouldSkipPlacement(placement: BoardPlacement): boolean {
        return (
            placement.letters.some(({ distance }) => distance > this.parameters.skipPlacementDistanceCutoff) ||
            placement.perpendicularLetters.some(({ distance }) => distance > this.parameters.skipPlacementDistanceCutoff) ||
            placement.letters.length + placement.perpendicularLetters.length > 1
        );
    }
}
