import { PuzzleGenerator } from '@app/classes/puzzle/puzzle-generator/puzzle-generator';
import { WordFindingUseCase, WordPlacement } from '@app/classes/word-finding';
import WordFindingPuzzle from '@app/classes/word-finding/word-finding-puzzle/word-finding-puzzle';
import {
    DAILY_PUZZLE_ALREADY_COMPLETED,
    MAX_PLACEMENTS_IN_RESULT,
    PUZZLE_COMPLETE_NO_ACTIVE_PUZZLE,
    PUZZLE_HAS_NO_SOLUTION,
    PUZZLE_LEADERBOARD_SIZE,
} from '@app/constants/puzzle-constants';
import { User } from '@common/models/user';
import { TypeOfId } from '@common/types/id';
import { Service } from 'typedi';
import DictionaryService from '@app/services/dictionary-service/dictionary.service';
import { ScoreCalculatorService } from '@app/services/score-calculator-service/score-calculator.service';
import { WordExtraction } from '@app/classes/word-extraction/word-extraction';
import { Square } from '@app/classes/square';
import { Tile } from '@app/classes/tile';
import { StringConversion } from '@app/utils/string-conversion/string-conversion';
import { WordsVerificationService } from '@app/services/words-verification-service/words-verification.service';
import { MAX_TILES_PER_PLAYER } from '@app/constants/game-constants';
import {
    DailyPuzzleLeaderboard,
    DailyPuzzleResult,
    PUZZLE_ABANDONED_OR_FAILED,
    PUZZLE_NOT_COMPLETED,
    PuzzleResult,
    PuzzleResultSolution,
    PuzzleResultStatus,
} from '@common/models/puzzle';
import { ActivePuzzle, CachedPuzzle, DailyPuzzle, Puzzle } from '@app/classes/puzzle/puzzle';
import { DailyPuzzleGenerator } from '@app/classes/puzzle/daily-puzzle-generator/daily-puzzle-generator';
import { DAILY_PUZZLE_TABLE, USER_TABLE } from '@app/constants/services-constants/database-const';
import DatabaseService from '@app/services/database-service/database.service';
import { HttpException } from '@app/classes/http-exception/http-exception';
import { StatusCodes } from 'http-status-codes';

@Service()
export class PuzzleService {
    tilesToPlaceForBingo = MAX_TILES_PER_PLAYER;
    private activePuzzle = new Map<TypeOfId<User>, ActivePuzzle>();
    private cachedDailyPuzzle: CachedPuzzle | undefined;

    constructor(
        private readonly dictionaryService: DictionaryService,
        private readonly scoreCalculatorService: ScoreCalculatorService,
        private readonly wordValidatorService: WordsVerificationService,
        private readonly databaseService: DatabaseService,
    ) {}

    private get table() {
        return this.databaseService.knex<DailyPuzzle>(DAILY_PUZZLE_TABLE);
    }

    startPuzzle(idUser: TypeOfId<User>): Puzzle {
        let puzzle: Puzzle | undefined;

        do {
            try {
                const generator = new PuzzleGenerator();
                puzzle = generator.generate();

                if (puzzle.tiles.length !== this.tilesToPlaceForBingo) throw new Error();
            } catch {
                // nothing to do.
            }
        } while (!puzzle);

        this.activePuzzle.set(idUser, { puzzle, isDaily: false });

        return puzzle;
    }

    async startDailyPuzzle(idUser: TypeOfId<User>): Promise<Puzzle> {
        if (!(await this.canDoDailyPuzzle(idUser))) throw new HttpException(DAILY_PUZZLE_ALREADY_COMPLETED, StatusCodes.BAD_REQUEST);

        let puzzle = this.getCachedDailyPuzzle();
        if (!puzzle) {
            const generator = new DailyPuzzleGenerator();
            do {
                try {
                    puzzle = generator.generate();
                } catch {
                    generator.nextSeed();
                }
            } while (puzzle === undefined);

            this.cachedDailyPuzzle = {
                puzzle,
                date: this.getDateForDailyPuzzle(),
            };
        }

        this.activePuzzle.set(idUser, { puzzle, isDaily: true });
        await this.table.insert({ idUser, date: this.getDateForDailyPuzzle(), score: PUZZLE_NOT_COMPLETED });

        return puzzle;
    }

    async canDoDailyPuzzle(idUser: TypeOfId<User>): Promise<boolean> {
        return !(await this.table.where({ idUser, date: this.getDateForDailyPuzzle() }).first());
    }

    async getDailyPuzzleLeaderboard(idUser: TypeOfId<User>): Promise<DailyPuzzleLeaderboard> {
        const date = this.getDateForDailyPuzzle();
        const leaderboard: DailyPuzzleResult[] = await this.table
            .select('score', `${USER_TABLE}.username`, `${USER_TABLE}.avatar`)
            .where({ date })
            .andWhere('score', '>', 0)
            .leftJoin<User>(USER_TABLE, `${USER_TABLE}.idUser`, '=', `${DAILY_PUZZLE_TABLE}.idUser`)
            .orderBy('score', 'desc')
            .limit(PUZZLE_LEADERBOARD_SIZE);

        const userScore = await this.table.where({ idUser, date }).first();
        const userRank = await this.table
            .where('score', '<', userScore?.score ?? 0)
            .andWhere({ date })
            .count()
            .first();
        const totalPlayers = await this.table.where({ date }).count().first();

        return {
            leaderboard,
            userScore: userScore?.score ?? PUZZLE_NOT_COMPLETED,
            userRank: userScore ? Number(userRank?.count) : PUZZLE_NOT_COMPLETED,
            totalPlayers: Number(totalPlayers?.count ?? 0),
        };
    }

    async completePuzzle(idUser: TypeOfId<User>, wordPlacement: WordPlacement): Promise<PuzzleResult> {
        const activePuzzle = this.activePuzzle.get(idUser);

        if (!activePuzzle) throw new Error(PUZZLE_COMPLETE_NO_ACTIVE_PUZZLE);

        const wordExtraction = new WordExtraction(activePuzzle.puzzle.board);
        const createdWords = wordExtraction.extract(wordPlacement);
        if (!this.isLegalPlacement(createdWords, wordPlacement)) return this.abandonPuzzle(idUser, PuzzleResultStatus.Invalid);

        try {
            this.wordValidatorService.verifyWords(
                StringConversion.wordsToString(createdWords),
                this.dictionaryService.getDefaultDictionary().summary.id,
            );
        } catch {
            return this.abandonPuzzle(idUser, PuzzleResultStatus.Invalid);
        }

        const scoredPoints =
            this.scoreCalculatorService.calculatePoints(createdWords) + this.scoreCalculatorService.bonusPoints(wordPlacement.tilesToPlace);

        const { targetPlacement, allPlacements } = this.getSolution(activePuzzle.puzzle);

        this.activePuzzle.delete(idUser);

        if (activePuzzle.isDaily) {
            await this.table.update({ score: scoredPoints }).where({ idUser, date: this.getDateForDailyPuzzle() });
        }

        return {
            userPoints: scoredPoints,
            result: wordPlacement.tilesToPlace.length >= this.tilesToPlaceForBingo ? PuzzleResultStatus.Won : PuzzleResultStatus.Valid,
            targetPlacement,
            allPlacements,
        };
    }

    async abandonPuzzle(idUser: TypeOfId<User>, result: PuzzleResultStatus = PuzzleResultStatus.Abandoned): Promise<PuzzleResult> {
        const activePuzzle = this.activePuzzle.get(idUser);

        if (!activePuzzle) throw new Error(PUZZLE_COMPLETE_NO_ACTIVE_PUZZLE);

        this.activePuzzle.delete(idUser);

        const { targetPlacement, allPlacements } = this.getSolution(activePuzzle.puzzle);

        if (activePuzzle.isDaily) {
            await this.table.update({ score: PUZZLE_ABANDONED_OR_FAILED }).where({ idUser, date: this.getDateForDailyPuzzle() });
        }

        return {
            userPoints: PUZZLE_ABANDONED_OR_FAILED,
            result,
            targetPlacement,
            allPlacements,
        };
    }

    private getSolution(puzzle: Puzzle): PuzzleResultSolution {
        const wordFinding = new WordFindingPuzzle(
            puzzle.board,
            puzzle.tiles,
            { useCase: WordFindingUseCase.Puzzle },
            this.dictionaryService.getDefaultDictionary(),
            this.scoreCalculatorService,
        );

        wordFinding.findWords();

        if (!wordFinding.easiestWordPlacement) throw new Error(PUZZLE_HAS_NO_SOLUTION);

        let allPlacements = wordFinding.wordPlacements;

        if (allPlacements.length > MAX_PLACEMENTS_IN_RESULT) {
            const allPlacementsWords = new Set<string>();
            allPlacements = wordFinding.wordPlacements
                .sort((a, b) => (a.score < b.score ? 1 : -1))
                .filter((placement) => {
                    const word = placement.tilesToPlace.reduce((w, tile) => w + tile.letter, '');
                    const alreadyExists = allPlacementsWords.has(word);

                    allPlacementsWords.add(word);

                    return !alreadyExists;
                });
            allPlacements = allPlacements.slice(0, MAX_PLACEMENTS_IN_RESULT);
        }

        return { targetPlacement: wordFinding.easiestWordPlacement, allPlacements };
    }

    private isLegalPlacement(words: [Square, Tile][][], wordPlacement: WordPlacement): boolean {
        const isAdjacentToPlacedTile = this.amountOfLettersInWords(words) !== wordPlacement.tilesToPlace.length;
        return isAdjacentToPlacedTile ? true : this.containsCenterSquare(words);
    }

    private amountOfLettersInWords(words: [Square, Tile][][]): number {
        return words.reduce((lettersInWords, word) => lettersInWords + word.length, 0);
    }

    private containsCenterSquare(words: [Square, Tile][][]): boolean {
        return words.some((word) => word.some(([square]) => square.isCenter));
    }

    private getCachedDailyPuzzle(): Puzzle | undefined {
        if (!this.cachedDailyPuzzle) return undefined;

        // check is puzzle is same day
        const today = this.getDateForDailyPuzzle();
        const cachedDate = new Date(this.cachedDailyPuzzle.date);
        return today.getDate() === cachedDate.getDate() &&
            today.getMonth() === cachedDate.getMonth() &&
            today.getFullYear() === cachedDate.getFullYear()
            ? this.cachedDailyPuzzle.puzzle
            : undefined;
    }

    private getDateForDailyPuzzle(): Date {
        const today = new Date();
        return new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    }
}
