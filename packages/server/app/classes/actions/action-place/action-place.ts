import ActionPlay from '@app/classes/actions/abstract-actions/action-play';
import { ActionUtils } from '@app/classes/actions/action-utils/action-utils';
import { ActionData, ActionPlacePayload } from '@app/classes/communication/action-data';
import { FeedbackMessage } from '@app/classes/communication/feedback-messages';
import { GameUpdateData } from '@app/classes/communication/game-update-data';
import { PlayerData } from '@app/classes/communication/player-data';
import Game from '@app/classes/game/game';
import { HttpException } from '@app/classes/http-exception/http-exception';
import Player from '@app/classes/player/player';
import { Square } from '@app/classes/square';
import { Tile } from '@app/classes/tile';
import { WordExtraction } from '@app/classes/word-extraction/word-extraction';
import { ScoredWordPlacement, WordPlacement } from '@app/classes/word-finding';
import { IN_UPPER_CASE } from '@app/constants/classes-constants';
import { ScoreCalculatorService } from '@app/services/score-calculator-service/score-calculator.service';
import { WordsVerificationService } from '@app/services/words-verification-service/words-verification.service';
import { fillPlayerData } from '@app/utils/fill-player-data/fill-player-data';
import { PlacementToString } from '@app/utils/placement-to-string/placement-to-string';
import { StringConversion } from '@app/utils/string-conversion/string-conversion';
import { StatusCodes } from 'http-status-codes';
import { Container } from 'typedi';
import { IMPOSSIBLE_ACTION } from './action-errors';
import { ActionType } from '@common/models/action';
import { MAX_TILES_PER_PLAYER } from '@app/constants/game-constants';
import { AbstractVirtualPlayer } from '@app/classes/virtual-player/abstract-virtual-player/abstract-virtual-player';
import { UserStatisticsService } from '@app/services/user-statistics-service/user-statistics-service';

export default class ActionPlace extends ActionPlay {
    wordPlacement: WordPlacement;
    scoredPoints: number;
    private scoreCalculator: ScoreCalculatorService;
    private wordValidator: WordsVerificationService;
    private objectivesCompletedMessages: string[];

    constructor(player: Player, game: Game, wordPlacement: WordPlacement) {
        super(player, game);
        this.wordPlacement = wordPlacement;
        this.scoreCalculator = Container.get(ScoreCalculatorService);
        this.wordValidator = Container.get(WordsVerificationService);
        this.objectivesCompletedMessages = [];
        this.scoredPoints = 0;
    }

    static createActionData(scoredWordPlacement: ScoredWordPlacement): ActionData {
        return {
            type: ActionType.PLACE,
            payload: this.createActionPlacePayload(scoredWordPlacement),
            input: '',
        };
    }

    private static createActionPlacePayload(scoredWordPlacement: ScoredWordPlacement): ActionPlacePayload {
        return {
            tiles: scoredWordPlacement.tilesToPlace,
            orientation: scoredWordPlacement.orientation,
            startPosition: scoredWordPlacement.startPosition,
        };
    }

    execute(): void | GameUpdateData {
        const [tilesToPlace, unplayedTiles] = ActionUtils.getTilesFromPlayer(this.wordPlacement.tilesToPlace, this.player);

        const wordExtraction = new WordExtraction(this.game.board);
        const createdWords: [Square, Tile][][] = wordExtraction.extract(this.wordPlacement);
        if (!this.isLegalPlacement(createdWords)) throw new HttpException(IMPOSSIBLE_ACTION, StatusCodes.FORBIDDEN);

        this.wordValidator.verifyWords(StringConversion.wordsToString(createdWords), this.game.dictionarySummary.id);

        this.updateBingoStatistic(tilesToPlace);

        this.scoredPoints = this.scoreCalculator.calculatePoints(createdWords) + this.scoreCalculator.bonusPoints(tilesToPlace);
        const updatedSquares = this.updateBoard(createdWords);

        this.player.tiles = unplayedTiles.concat(this.game.getTilesFromReserve(tilesToPlace.length));
        this.player.score += this.scoredPoints;

        const playerData: PlayerData = { id: this.player.id, tiles: this.player.tiles, score: this.player.score };

        const response: GameUpdateData = {
            board: updatedSquares,
        };

        fillPlayerData(response, this.game.getPlayerNumber(this.player), playerData);

        return response;
    }

    getMessage(): FeedbackMessage {
        let placeMessage = `Vous avez placé ${PlacementToString.tilesToString(this.wordPlacement.tilesToPlace, IN_UPPER_CASE)} pour ${
            this.scoredPoints
        } points`;
        this.objectivesCompletedMessages.forEach((message: string) => {
            placeMessage += `<br><br>Vous avez${message}`;
        });
        return { message: placeMessage };
    }

    getOpponentMessage(): FeedbackMessage {
        let placeMessage = `${this.player.publicUser.username} a placé ${PlacementToString.tilesToString(
            this.wordPlacement.tilesToPlace,
            IN_UPPER_CASE,
        )} pour ${this.scoredPoints} points`;
        this.objectivesCompletedMessages.forEach((message: string) => {
            placeMessage += `<br><br>${this.player.publicUser.username} a${message}`;
        });
        return { message: placeMessage };
    }

    private updateBingoStatistic(tilesToPlace: Tile[]): void {
        if (this.player instanceof AbstractVirtualPlayer) return;

        if (tilesToPlace.length === MAX_TILES_PER_PLAYER) {
            Container.get(UserStatisticsService)
                .addBingoToStatistics(this.player.idUser)
                .catch((error) => {
                    // eslint-disable-next-line no-console
                    console.error('An error occurred while updating the bingo statistic: ', error);
                });
        }
    }

    private isLegalPlacement(words: [Square, Tile][][]): boolean {
        const isAdjacentToPlacedTile = this.amountOfLettersInWords(words) !== this.wordPlacement.tilesToPlace.length;
        return isAdjacentToPlacedTile ? true : this.containsCenterSquare(words);
    }

    private amountOfLettersInWords(words: [Square, Tile][][]): number {
        return words.reduce((lettersInWords, word) => lettersInWords + word.length, 0);
    }

    private containsCenterSquare(words: [Square, Tile][][]): boolean {
        return words.some((word) => word.some(([square]) => square.isCenter));
    }

    private updateBoard(words: [Square, Tile][][]): Square[] {
        const updatedSquares: Square[] = [];
        for (const word of words) {
            for (const [square, tile] of word) {
                if (square.tile) continue;

                square.tile = tile;
                square.wasMultiplierUsed = true;
                const position = square.position;
                updatedSquares.push(square);
                this.game.board.placeTile(tile, position);
            }
        }

        return updatedSquares;
    }
}
