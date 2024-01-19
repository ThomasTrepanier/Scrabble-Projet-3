import { ReadyGameConfig, ReadyGameConfigWithChannelId } from '@app/classes/game/game-config';
import Room from '@app/classes/game/room';
import WaitingRoom from '@app/classes/game/waiting-room';
import { HttpException } from '@app/classes/http-exception/http-exception';
import { UserId } from '@app/classes/user/connected-user-types';
import { AVATARS } from '@app/constants/avatar';
import {
    CANT_START_GAME_WITH_NO_REAL_OPPONENT,
    INVALID_PASSWORD,
    INVALID_PLAYER_ID_FOR_GAME,
    NO_DICTIONARY_INITIALIZED,
    NO_GAME_FOUND_WITH_ID,
} from '@app/constants/services-errors';
import { VirtualPlayerFactory } from '@app/factories/virtual-player-factory/virtual-player-factory';
import { ChatService } from '@app/services/chat-service/chat.service';
import { CreateGameService } from '@app/services/create-game-service/create-game.service';
import DictionaryService from '@app/services/dictionary-service/dictionary.service';
import { SocketService } from '@app/services/socket-service/socket.service';
import { VirtualPlayerService } from '@app/services/virtual-player-service/virtual-player.service';
import { Random } from '@app/utils/random/random';
import { GameVisibility } from '@common/models/game-visibility';
import { Group, GroupData } from '@common/models/group';
import { Observer } from '@common/models/observer';
import { PublicUser } from '@common/models/user';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';
@Service()
export class GameDispatcherService {
    private waitingRooms: WaitingRoom[];
    private groupsRoom: Room;

    constructor(
        private socketService: SocketService,
        private createGameService: CreateGameService,
        private dictionaryService: DictionaryService,
        private virtualPlayerService: VirtualPlayerService,
        private readonly virtualPlayerFactory: VirtualPlayerFactory,
        private readonly chatService: ChatService,
    ) {
        this.waitingRooms = [];
        this.groupsRoom = new Room();
    }

    getGroupsRoom(): Room {
        return this.groupsRoom;
    }

    getVirtualPlayerService(): VirtualPlayerService {
        return this.virtualPlayerService;
    }

    async createMultiplayerGame(groupData: GroupData, userId: UserId, playerId: string): Promise<Group> {
        const waitingRoom = await this.createGameService.createMultiplayerGame(groupData, userId, playerId);
        const dictionaries = this.dictionaryService.getAllDictionarySummaries();
        if (dictionaries.length < 1) {
            throw new HttpException(NO_DICTIONARY_INITIALIZED, StatusCodes.INTERNAL_SERVER_ERROR);
        }
        waitingRoom.dictionarySummary = dictionaries[0];
        this.dictionaryService.useDictionary(waitingRoom.dictionarySummary.id);

        this.addToWaitingRoom(waitingRoom);
        this.socketService.addToRoom(playerId, waitingRoom.getId());
        return waitingRoom.convertToGroup();
    }

    async requestJoinGame(
        waitingRoomId: string,
        playerId: string,
        publicUser: PublicUser,
        password: string,
        isObserver: boolean,
    ): Promise<WaitingRoom> {
        const waitingRoom = this.getMultiplayerGameFromId(waitingRoomId);
        const gameVisibility = waitingRoom.getConfig().gameVisibility;
        if (gameVisibility === GameVisibility.Private) {
            waitingRoom.addToRequesting(publicUser, playerId, isObserver);
        } else if (gameVisibility === GameVisibility.Protected && password === waitingRoom.getConfig().password) {
            waitingRoom.changeRequestingToJoined(playerId, isObserver);
            await this.chatService.joinChannel(waitingRoom.getGroupChannelId(), playerId);
        } else if (gameVisibility === GameVisibility.Public) {
            waitingRoom.addToJoined(publicUser, playerId, isObserver);
            await this.chatService.joinChannel(waitingRoom.getGroupChannelId(), playerId);
        } else {
            throw new HttpException(INVALID_PASSWORD, StatusCodes.FORBIDDEN);
        }

        return waitingRoom;
    }

    // TODO : Refactor to use player id instead of name
    async handleJoinRequest(waitingRoomId: string, playerId: string, requestingPlayerName: string, isAccepted: boolean): Promise<[Observer, Group]> {
        const waitingRoom = this.getMultiplayerGameFromId(waitingRoomId);
        if (waitingRoom.getConfig().player1.id !== playerId) {
            throw new HttpException(INVALID_PLAYER_ID_FOR_GAME, StatusCodes.FORBIDDEN);
        }
        const [requestingPlayer, isObserver] = waitingRoom.getUserFromRequestingUsers((user) => user.publicUser.username === requestingPlayerName);

        if (isAccepted) {
            waitingRoom.changeRequestingToJoined(requestingPlayer.id, isObserver);
            await this.chatService.joinChannel(waitingRoom.getGroupChannelId(), requestingPlayer.id);
        } else {
            waitingRoom.removeRequesting(requestingPlayer.id);
        }
        return [requestingPlayer, waitingRoom.convertToGroup()];
    }

    startRequest(waitingRoomId: string, playerId: string): ReadyGameConfigWithChannelId {
        const waitingRoom = this.getMultiplayerGameFromId(waitingRoomId);
        if (waitingRoom.getConfig().player1.id !== playerId) {
            throw new HttpException(INVALID_PLAYER_ID_FOR_GAME, StatusCodes.FORBIDDEN);
        }
        if (waitingRoom.joinedPlayer2 === undefined && waitingRoom.joinedPlayer3 === undefined && waitingRoom.joinedPlayer4 === undefined) {
            throw new HttpException(CANT_START_GAME_WITH_NO_REAL_OPPONENT, StatusCodes.FORBIDDEN);
        }

        const index = this.waitingRooms.indexOf(waitingRoom);
        this.waitingRooms.splice(index, 1);

        const avatars = Random.shuffle([...AVATARS]);

        const player2 = waitingRoom.joinedPlayer2
            ? waitingRoom.joinedPlayer2
            : this.virtualPlayerFactory.generateVirtualPlayer(
                  waitingRoomId,
                  waitingRoom.getConfig().virtualPlayerLevel,
                  waitingRoom.getPlayers(),
                  avatars[0],
              );
        const player3 = waitingRoom.joinedPlayer3
            ? waitingRoom.joinedPlayer3
            : this.virtualPlayerFactory.generateVirtualPlayer(
                  waitingRoomId,
                  waitingRoom.getConfig().virtualPlayerLevel,
                  [...waitingRoom.getPlayers(), player2],
                  avatars[1],
              );
        const player4 = waitingRoom.joinedPlayer4
            ? waitingRoom.joinedPlayer4
            : this.virtualPlayerFactory.generateVirtualPlayer(
                  waitingRoomId,
                  waitingRoom.getConfig().virtualPlayerLevel,
                  [...waitingRoom.getPlayers(), player2, player3],
                  avatars[2],
              );
        const config: ReadyGameConfig = {
            ...waitingRoom.getConfig(),
            player2,
            player3,
            player4,
            dictionarySummary: waitingRoom.dictionarySummary,
        };

        return { ...config, idChannel: waitingRoom.getGroupChannelId() };
    }

    isPlayerFromAcceptedUsers(waitingRoomId: string, playerId: string): boolean {
        const waitingRoom = this.getMultiplayerGameFromId(waitingRoomId);

        return (
            playerId === waitingRoom.joinedPlayer2?.id ||
            playerId === waitingRoom.joinedPlayer3?.id ||
            playerId === waitingRoom.joinedPlayer4?.id ||
            waitingRoom.joinedObservers.some((user) => user.id === playerId)
        );
    }

    async leaveGroupRequest(waitingRoomId: string, playerId: string, shouldQuit: boolean = true): Promise<Group> {
        const waitingRoom = this.getMultiplayerGameFromId(waitingRoomId);
        switch (playerId) {
            case waitingRoom.joinedPlayer2?.id: {
                waitingRoom.joinedPlayer2 = undefined;
                break;
            }
            case waitingRoom.joinedPlayer3?.id: {
                waitingRoom.joinedPlayer3 = undefined;
                break;
            }
            case waitingRoom.joinedPlayer4?.id: {
                waitingRoom.joinedPlayer4 = undefined;
                break;
            }
            default: {
                const matchingObservers = waitingRoom.joinedObservers.filter((observer) => observer.id === playerId);
                if (matchingObservers.length === 0) throw new HttpException(INVALID_PLAYER_ID_FOR_GAME, StatusCodes.FORBIDDEN);
                const index = waitingRoom.joinedObservers.indexOf(matchingObservers[0]);
                waitingRoom.joinedObservers.splice(index, 1);
            }
        }

        if (shouldQuit) await this.chatService.quitChannel(waitingRoom.getGroupChannelId(), playerId);
        return waitingRoom.convertToGroup();
    }

    async cancelGame(waitingRoomId: string, playerId: string): Promise<void> {
        const waitingRoom = this.getMultiplayerGameFromId(waitingRoomId);

        if (waitingRoom.getConfig().player1.id !== playerId) {
            throw new HttpException(INVALID_PLAYER_ID_FOR_GAME, StatusCodes.FORBIDDEN);
        }
        this.dictionaryService.stopUsingDictionary(waitingRoom.dictionarySummary.id);
        await this.chatService.emptyChannel(waitingRoom.getGroupChannelId());

        const index = this.waitingRooms.indexOf(waitingRoom);
        this.waitingRooms.splice(index, 1);
    }

    getAvailableWaitingRooms(): Group[] {
        const groups: Group[] = [];
        for (const room of this.waitingRooms) {
            groups.push(room.convertToGroup());
        }

        return groups;
    }

    getMultiplayerGameFromId(waitingRoomId: string): WaitingRoom {
        const filteredWaitingRoom = this.waitingRooms.filter((g) => g.getId() === waitingRoomId);
        if (filteredWaitingRoom.length > 0) return filteredWaitingRoom[0];
        throw new HttpException(NO_GAME_FOUND_WITH_ID, StatusCodes.NOT_FOUND);
    }

    isGameInWaitingRooms(gameId: string): boolean {
        const filteredWaitingRoom = this.waitingRooms.filter((g) => g.getId() === gameId);
        return filteredWaitingRoom.length > 0;
    }

    private addToWaitingRoom(waitingRoom: WaitingRoom): void {
        this.waitingRooms.push(waitingRoom);
    }
}
