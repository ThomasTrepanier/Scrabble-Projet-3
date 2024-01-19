import { Action, ActionExchange, ActionHelp, ActionPass, ActionPlace, ActionReserve } from '@app/classes/actions';
import ActionHint from '@app/classes/actions/action-hint/action-hint';
import { Position } from '@app/classes/board';
import { ActionData, ActionExchangePayload, ActionPlacePayload } from '@app/classes/communication/action-data';
import { FeedbackMessage, FeedbackMessages } from '@app/classes/communication/feedback-messages';
import { GameUpdateData } from '@app/classes/communication/game-update-data';
import { RoundData } from '@app/classes/communication/round-data';
import Game from '@app/classes/game/game';
import { HttpException } from '@app/classes/http-exception/http-exception';
import Player from '@app/classes/player/player';
import { ExpertVirtualPlayer } from '@app/classes/virtual-player/expert-virtual-player/expert-virtual-player';
import { AVATARS } from '@app/constants/avatar';
import { MUST_HAVE_7_TILES_TO_SWAP } from '@app/constants/classes-errors';
import { SECONDS_TO_MILLISECONDS } from '@app/constants/controllers-constants';
import { INVALID_COMMAND, INVALID_PAYLOAD, NOT_PLAYER_TURN } from '@app/constants/services-errors';
import { MINIMUM_TILES_LEFT_FOR_EXCHANGE } from '@app/constants/virtual-player-constants';
import { VirtualPlayerFactory } from '@app/factories/virtual-player-factory/virtual-player-factory';
import { ActiveGameService } from '@app/services/active-game-service/active-game.service';
import { AnalysisService } from '@app/services/analysis-service/analysis.service';
import { AuthentificationService } from '@app/services/authentification-service/authentification.service';
import DictionaryService from '@app/services/dictionary-service/dictionary.service';
import GameHistoriesService from '@app/services/game-history-service/game-history.service';
import { RatingService } from '@app/services/rating-service/rating.service';
import { UserStatisticsService } from '@app/services/user-statistics-service/user-statistics-service';
import { VirtualPlayerService } from '@app/services/virtual-player-service/virtual-player.service';
import { isIdVirtualPlayer } from '@app/utils/is-id-virtual-player/is-id-virtual-player';
import { Random } from '@app/utils/random/random';
import { ActionType } from '@common/models/action';
import { GameHistoryPlayerCreation } from '@common/models/game-history';
import { PlayerData } from '@common/models/player';
import { PublicUserStatistics, UserGameStatisticInfo } from '@common/models/user-statistics';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';
@Service()
export class GamePlayService {
    constructor(
        private readonly activeGameService: ActiveGameService,
        private readonly dictionaryService: DictionaryService,
        private readonly gameHistoriesService: GameHistoriesService,
        private readonly virtualPlayerService: VirtualPlayerService,
        private readonly virtualPlayerFactory: VirtualPlayerFactory,
        private readonly userStatisticsService: UserStatisticsService,
        private readonly authenticationService: AuthentificationService,
        private readonly analysisService: AnalysisService,
    ) {
        this.activeGameService.playerLeftEvent.on('playerLeftGame', async (gameId, playerWhoLeftId) => {
            await this.handlePlayerLeftEvent(gameId, playerWhoLeftId);
        });
    }

    async playAction(gameId: string, playerId: string, actionData: ActionData): Promise<[void | GameUpdateData, void | FeedbackMessages]> {
        const game = this.activeGameService.getGame(gameId, playerId);
        const player = game.getPlayer(playerId);
        if (player.id !== playerId) throw new HttpException(NOT_PLAYER_TURN, StatusCodes.FORBIDDEN);
        if (game.gameIsOver) return [undefined, undefined];

        const board = game.board;
        const action: Action = this.getAction(player, game, actionData);

        let updatedData: void | GameUpdateData = action.execute();

        const localPlayerFeedback: FeedbackMessage = action.getMessage();
        const opponentFeedback: FeedbackMessage = action.getOpponentMessage();
        let endGameFeedback: FeedbackMessage[] = [];

        if (updatedData) {
            updatedData = this.addMissingPlayerId(gameId, playerId, updatedData);
            updatedData.tileReserve = Array.from(game.getTilesLeftPerLetter(), ([letter, amount]) => ({ letter, amount }));
        }

        if (action.willEndTurn()) {
            const nextRound = game.roundManager.nextRound(action, board);
            const nextRoundData: RoundData = game.roundManager.convertRoundToRoundData(nextRound);
            if (updatedData) updatedData.round = nextRoundData;
            else updatedData = { round: nextRoundData };
            if (game.areGameOverConditionsMet()) {
                endGameFeedback = await this.handleGameOver(game, updatedData);
            }
        }
        return [updatedData, { localPlayerFeedback, opponentFeedback, endGameFeedback }];
    }

    getAction(player: Player, game: Game, actionData: ActionData): Action {
        switch (actionData.type) {
            case ActionType.PLACE: {
                const payload = this.getActionPlacePayload(actionData);
                const startPosition = new Position(payload.startPosition.row, payload.startPosition.column);
                return new ActionPlace(player, game, { tilesToPlace: payload.tiles, startPosition, orientation: payload.orientation });
            }
            case ActionType.EXCHANGE: {
                const totalTilesLeft = this.activeGameService.getGame(game.getId(), player.id).getTotalTilesLeft();
                if (!this.isExchangeLegal(player, totalTilesLeft)) throw new HttpException(MUST_HAVE_7_TILES_TO_SWAP, StatusCodes.FORBIDDEN);

                const payload = this.getActionExchangePayload(actionData);
                return new ActionExchange(player, game, payload.tiles ?? []);
            }
            case ActionType.PASS: {
                return new ActionPass(player, game);
            }
            case ActionType.HELP: {
                return new ActionHelp(player, game);
            }
            case ActionType.RESERVE: {
                return new ActionReserve(player, game);
            }
            case ActionType.HINT: {
                return new ActionHint(player, game);
            }
            default: {
                throw Error(INVALID_COMMAND);
            }
        }
    }

    getActionPlacePayload(actionData: ActionData): ActionPlacePayload {
        const payload = actionData.payload as ActionPlacePayload;
        if (payload.tiles.length <= 0) throw new HttpException(INVALID_PAYLOAD, StatusCodes.BAD_REQUEST);
        if (payload.startPosition === undefined) throw new HttpException(INVALID_PAYLOAD, StatusCodes.BAD_REQUEST);
        if (payload.orientation === undefined) throw new HttpException(INVALID_PAYLOAD, StatusCodes.BAD_REQUEST);
        return payload;
    }

    getActionExchangePayload(actionData: ActionData): ActionExchangePayload {
        const payload = actionData.payload as ActionExchangePayload;
        if (payload.tiles.length <= 0) throw new HttpException(INVALID_PAYLOAD, StatusCodes.BAD_REQUEST);
        return payload;
    }

    isGameOver(gameId: string, playerId: string): boolean {
        return this.activeGameService.getGame(gameId, playerId).gameIsOver;
    }

    private isExchangeLegal(player: Player, totalTilesLeft: number): boolean {
        return player instanceof ExpertVirtualPlayer || totalTilesLeft >= MINIMUM_TILES_LEFT_FOR_EXCHANGE;
    }

    private async handleGameOver(game: Game, updatedData: GameUpdateData): Promise<FeedbackMessage[]> {
        const [updatedScorePlayer1, updatedScorePlayer2, updatedScorePlayer3, updatedScorePlayer4] = game.endOfGame();
        RatingService.adjustRatings(game.getPlayers());
        game.completeGameHistory();
        const idGameHistory = await this.gameHistoriesService.addGameHistory(game.gameHistory, game.idGameHistory);
        game.idGameHistory = idGameHistory;
        this.analysisService.addAnalysis(game, idGameHistory);
        updatedData.idGameHistory = idGameHistory;

        this.dictionaryService.stopUsingDictionary(game.dictionarySummary.id, true);

        updatedData.isGameOver = true;
        updatedData.winners = game.computeWinners();

        updatedData.player1 = this.fillGameUpdateData(game.player1, updatedScorePlayer1, updatedData.player1);
        updatedData.player2 = this.fillGameUpdateData(game.player2, updatedScorePlayer2, updatedData.player2);
        updatedData.player3 = this.fillGameUpdateData(game.player3, updatedScorePlayer3, updatedData.player3);
        updatedData.player4 = this.fillGameUpdateData(game.player4, updatedScorePlayer4, updatedData.player4);
        await this.updateUserStatistics(game, updatedData);

        return game.endGameMessage();
    }

    private fillGameUpdateData(player: Player, updatedScore: number, playerData?: PlayerData) {
        if (playerData) {
            playerData.score = updatedScore;
            playerData.adjustedRating = player.adjustedRating;
            playerData.ratingVariation = player.adjustedRating - player.initialRating;
            return playerData;
        } else
            return {
                id: player.id,
                score: updatedScore,
                ratingVariation: player.adjustedRating - player.initialRating,
                adjustedRating: player.adjustedRating,
            };
    }

    private async updateLeaverStatistics(game: Game, player: Player) {
        const time = (Date.now() - game.roundManager.getGameStartTime().getTime()) / SECONDS_TO_MILLISECONDS;

        if (!isIdVirtualPlayer(player.id))
            await this.userStatisticsService.addGameToStatistics(player.idUser, {
                hasWon: false,
                points: player.score,
                time,
                ratingDifference: player.adjustedRating - player.initialRating,
            });
    }

    private createGameStatisticsInfo(player: Player, updatedData: GameUpdateData, time: number, index: number): UserGameStatisticInfo {
        return {
            hasWon: updatedData.winners?.includes(player.publicUser.username) ?? false,
            points: this.getUpdataDataPlayer(updatedData, index)?.score ?? 0,
            time,
            ratingDifference: player.adjustedRating - player.initialRating,
        };
    }

    private getUpdataDataPlayer(updatedData: GameUpdateData, index: number): PlayerData | undefined {
        switch (index) {
            case 1:
                return updatedData.player1;
            case 2:
                return updatedData.player2;
            case 3:
                return updatedData.player3;
            case 4:
                return updatedData.player4;
            default:
                return undefined;
        }
    }

    private async updateUserStatistics(game: Game, updatedData: GameUpdateData): Promise<void> {
        const time = (game.gameHistory.gameHistory.endTime.getTime() - game.roundManager.getGameStartTime().getTime()) / SECONDS_TO_MILLISECONDS;

        const addGameToStatistics: Promise<PublicUserStatistics>[] = [];

        game.getPlayers().forEach((player, index) => {
            if (!isIdVirtualPlayer(player.id) && player.isConnected) {
                addGameToStatistics.push(
                    this.userStatisticsService.addGameToStatistics(
                        this.authenticationService.connectedUsers.getUserId(player.id),
                        this.createGameStatisticsInfo(player, updatedData, time, index + 1),
                    ),
                );
            }
        });
        await Promise.all(addGameToStatistics);
    }

    private async handlePlayerLeftEvent(gameId: string, playerWhoLeftId: string): Promise<void> {
        const game = this.activeGameService.getGame(gameId, playerWhoLeftId);
        const playersStillInGame = game.getOpponentPlayers(playerWhoLeftId);
        const playerWhoLeft = game.getPlayer(playerWhoLeftId);

        RatingService.adjustAbandoningUserRating(playerWhoLeft, playersStillInGame);
        this.updateLeaverStatistics(game, playerWhoLeft);

        game.idGameHistory = await this.gameHistoriesService.addGameHistory({
            gameHistory: {
                startTime: game.roundManager.getGameStartTime(),
                endTime: new Date(),
            },
            players: [this.createGameHistoryPlayerAbandon(playerWhoLeft)],
        });

        if (playersStillInGame.every((playerStillInGame) => isIdVirtualPlayer(playerStillInGame.id))) {
            game.getPlayer(playerWhoLeftId).isConnected = false;
            const endOfGameData: GameUpdateData = {};
            await this.handleGameOver(game, endOfGameData);
            this.activeGameService.playerLeftEvent.emit('playerLeftFeedback', gameId, endOfGameData.winners, endOfGameData);

            this.activeGameService.removeGame(gameId, playerWhoLeftId);
            return;
        }

        const avatars = Random.shuffle([...AVATARS]);
        const usedAvatars = game.getPlayers().map((player) => player.publicUser.avatar);
        const unusedAvatars = avatars.filter((avatar) => !usedAvatars.includes(avatar));
        const updatedData: GameUpdateData = game.replacePlayer(
            playerWhoLeftId,
            this.virtualPlayerFactory.generateVirtualPlayer(gameId, game.virtualPlayerLevel, playersStillInGame, unusedAvatars[0]),
        );

        if (this.isVirtualPlayerTurn(game)) {
            this.virtualPlayerService.triggerVirtualPlayerTurn(
                { round: game.roundManager.convertRoundToRoundData(game.roundManager.getCurrentRound()) },
                game,
            );
        }

        this.activeGameService.playerLeftEvent.emit('playerLeftFeedback', gameId, [], updatedData);
    }

    private createGameHistoryPlayerAbandon(player: Player): GameHistoryPlayerCreation {
        return {
            idUser: isIdVirtualPlayer(player.id) ? undefined : player.idUser,
            score: player.score,
            isVirtualPlayer: isIdVirtualPlayer(player.id),
            isWinner: false,
            ratingVariation: player.adjustedRating - player.initialRating,
            hasAbandoned: true,
        };
    }

    private addMissingPlayerId(gameId: string, playerId: string, gameUpdateData: GameUpdateData): GameUpdateData {
        const game: Game = this.activeGameService.getGame(gameId, playerId);
        const newGameUpdateData: GameUpdateData = { ...gameUpdateData };
        if (newGameUpdateData.player1) {
            newGameUpdateData.player1.id = game.player1.id;
        }
        if (newGameUpdateData.player2) {
            newGameUpdateData.player2.id = game.player2.id;
        }
        if (newGameUpdateData.player3) {
            newGameUpdateData.player3.id = game.player3.id;
        }
        if (newGameUpdateData.player4) {
            newGameUpdateData.player4.id = game.player4.id;
        }

        return newGameUpdateData;
    }

    private isVirtualPlayerTurn(game: Game): boolean {
        return isIdVirtualPlayer(game.roundManager.getCurrentRound().player.id);
    }
}
