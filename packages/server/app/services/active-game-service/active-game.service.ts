import { GameUpdateData } from '@app/classes/communication/game-update-data';
import Game from '@app/classes/game/game';
import { ReadyGameConfig, StartGameData } from '@app/classes/game/game-config';
import { HttpException } from '@app/classes/http-exception/http-exception';
import Player from '@app/classes/player/player';
import { AbstractVirtualPlayer } from '@app/classes/virtual-player/abstract-virtual-player/abstract-virtual-player';
import { PLAYER_LEFT_GAME } from '@app/constants/controllers-errors';
import { INVALID_PLAYER_ID_FOR_GAME, NO_GAME_FOUND_WITH_ID } from '@app/constants/services-errors';
import { ChatService } from '@app/services/chat-service/chat.service';
import { SocketService } from '@app/services/socket-service/socket.service';
import { UserStatisticsService } from '@app/services/user-statistics-service/user-statistics-service';
import { Channel } from '@common/models/chat/channel';
import { Observer } from '@common/models/observer';
import { TypeOfId } from '@common/types/id';
import { EventEmitter } from 'events';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

export const EXPERT_PLAYER_RATING = 1400;
export const BEGINNER_PLAYER_RATING = 1100;
@Service()
export class ActiveGameService {
    playerLeftEvent: EventEmitter;
    virtualPlayerReplacedEvent: EventEmitter;
    private activeGames: Game[];

    constructor(
        private readonly socketService: SocketService,
        private readonly chatService: ChatService,
        private userStatisticService: UserStatisticsService,
    ) {
        this.playerLeftEvent = new EventEmitter();
        this.virtualPlayerReplacedEvent = new EventEmitter();
        this.activeGames = [];
        Game.injectServices();
    }

    async beginGame(id: string, groupChannelId: TypeOfId<Channel>, config: ReadyGameConfig, joinedObservers: Observer[]): Promise<StartGameData> {
        const game = await Game.createGame(id, groupChannelId, config, joinedObservers);
        this.activeGames.push(game);
        game.getPlayers().forEach(async (player) => await this.setPlayerElo(player));
        return game.createStartGameData();
    }

    async setPlayerElo(player: Player) {
        if (player instanceof AbstractVirtualPlayer) {
            return;
        }
        const rating = (await this.userStatisticService.getStatistics(player.idUser)).rating;
        player.initialRating = rating;
        player.adjustedRating = rating;
    }

    getGame(id: string, playerId: string): Game {
        const filteredGames = this.activeGames.filter((g) => g.getId() === id);

        if (filteredGames.length === 0) throw new HttpException(NO_GAME_FOUND_WITH_ID, StatusCodes.NOT_FOUND);

        const game = filteredGames[0];

        if (game.player1.id === playerId || game.player2.id === playerId || game.player3.id === playerId || game.player4.id === playerId) return game;
        const filteredObservers = game.observers.filter((observer) => observer.id === playerId);
        if (filteredObservers.length > 0) return game;

        throw new HttpException(INVALID_PLAYER_ID_FOR_GAME, StatusCodes.NOT_FOUND);
    }

    removeGame(id: string, playerId: string): void {
        let game: Game;
        try {
            game = this.getGame(id, playerId);
        } catch (exception) {
            return;
        }

        const index = this.activeGames.indexOf(game);
        this.activeGames.splice(index, 1);
    }

    isGameOver(gameId: string, playerId: string): boolean {
        return this.getGame(gameId, playerId).gameIsOver;
    }

    async handlePlayerLeaves(gameId: string, playerId: string, shouldQuit: boolean = true): Promise<void> {
        const game: Game = this.getGame(gameId, playerId);
        if (shouldQuit) await this.chatService.quitChannel(game.getGroupChannelId(), playerId);

        // Check if there is no player left --> cleanup server and client
        try {
            this.socketService.removeFromRoom(playerId, gameId);
            this.socketService.emitToSocket(playerId, 'cleanup');
        } catch (exception) {
            // catch errors caused by inexistent socket after client closed application
        }
        let disconnectedPlayer;
        // Try to get the name of the player. If it is an observer remove from observers and return
        try {
            disconnectedPlayer = game.getPlayer(playerId);
        } catch (exception) {
            const matchingObservers = game.observers.filter((obs) => obs.id === playerId);
            if (matchingObservers.length < 1) {
                throw new HttpException(INVALID_PLAYER_ID_FOR_GAME, StatusCodes.NOT_FOUND);
            }

            const index = game.observers.indexOf(matchingObservers[0]);
            game.observers.splice(index, 1);
            return;
        }
        disconnectedPlayer.isConnected = false;

        this.socketService.emitToRoom(gameId, 'newMessage', {
            content: `${disconnectedPlayer.publicUser.username} ${PLAYER_LEFT_GAME(this.isGameOver(gameId, playerId))}`,
            senderId: 'system',
            gameId,
        });

        if (this.isGameOver(gameId, playerId)) return;

        this.playerLeftEvent.emit('playerLeftGame', gameId, playerId);
    }
    async handleReplaceVirtualPlayer(gameId: string, observerId: string, playerNumber: number): Promise<GameUpdateData> {
        const game: Game = this.getGame(gameId, observerId);

        const replacedVirtualPlayer = game.getPlayerByNumber(playerNumber);
        const observer: Observer = game.observers.filter((_observer) => _observer.id === observerId)[0];
        const newPlayer: Player = this.observerToPlayer(observer);
        await this.setPlayerElo(newPlayer);
        return game.replacePlayer(replacedVirtualPlayer.id, newPlayer);
    }
    private observerToPlayer(observer: Observer): Player {
        return new Player(observer.id, observer.publicUser);
    }
}
