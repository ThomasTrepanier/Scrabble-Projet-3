import Player from '@app/classes/player/player';
import { GAME_ALREADY_FULL } from '@app/constants/classes-errors';
import { Channel } from '@common/models/chat/channel';
import { TypeOfId } from '@common/types/id';
import { StatusCodes } from 'http-status-codes';
import { HttpException } from '@app/classes/http-exception/http-exception';
import { GameConfig } from './game-config';
import Room from './room';
import { DictionarySummary } from '@app/classes/communication/dictionary-data';
import { Group } from '@common/models/group';
import { Observer } from '@common/models/observer';
import { PublicUser } from '@common/models/user';
import { INVALID_PLAYER_ID_FOR_GAME, INVALID_TYPES } from '@app/constants/services-errors';
import { RequestingUsers } from '@common/models/requesting-users';
import { GAME_ROOM_ID_PREFIX } from '@app/constants/classes-constants';

export default class WaitingRoom extends Room {
    joinedPlayer2?: Player;
    joinedPlayer3?: Player;
    joinedPlayer4?: Player;
    requestingPlayers: Player[];
    requestingObservers: Observer[];
    joinedObservers: Observer[];
    dictionarySummary: DictionarySummary;

    private config: GameConfig;
    private readonly groupChannelId: TypeOfId<Channel>;

    constructor(config: GameConfig, groupChannelId: TypeOfId<Channel>) {
        super(GAME_ROOM_ID_PREFIX);
        this.config = config;
        this.joinedPlayer2 = undefined;
        this.joinedPlayer3 = undefined;
        this.joinedPlayer4 = undefined;
        this.requestingPlayers = [];
        this.requestingObservers = [];
        this.joinedObservers = [];
        this.groupChannelId = groupChannelId;
    }

    getConfig(): GameConfig {
        return this.config;
    }

    getGroupChannelId(): TypeOfId<Channel> {
        return this.groupChannelId;
    }

    fillNextEmptySpot(player: Player): void {
        if (!this.joinedPlayer2) {
            this.joinedPlayer2 = player;
            return;
        } else if (!this.joinedPlayer3) {
            this.joinedPlayer3 = player;
            return;
        } else if (!this.joinedPlayer4) {
            this.joinedPlayer4 = player;
            return;
        }
        throw new HttpException(GAME_ALREADY_FULL, StatusCodes.UNAUTHORIZED);
    }

    getPlayers(): Player[] {
        const players = [this.config.player1];
        if (this.joinedPlayer2) {
            players.push(this.joinedPlayer2);
        }
        if (this.joinedPlayer3) {
            players.push(this.joinedPlayer3);
        }
        if (this.joinedPlayer4) {
            players.push(this.joinedPlayer4);
        }
        return players;
    }

    convertToGroup(): Group {
        return {
            user1: this.config.player1.publicUser,
            user2: this.joinedPlayer2?.publicUser ?? undefined,
            user3: this.joinedPlayer3?.publicUser ?? undefined,
            user4: this.joinedPlayer4?.publicUser ?? undefined,
            maxRoundTime: this.config.maxRoundTime,
            gameVisibility: this.config.gameVisibility,
            virtualPlayerLevel: this.config.virtualPlayerLevel,
            groupId: this.getId(),
            password: this.getConfig().password,
            numberOfObservers: this.joinedObservers.length,
        };
    }

    getRequestingUsers(): RequestingUsers {
        return {
            requestingPlayers: this.requestingPlayers.map((player) => player.publicUser),
            requestingObservers: this.requestingObservers.map((observer) => observer.publicUser),
        };
    }

    addToRequesting(publicUser: PublicUser, playerId: string, isObserver: boolean): void {
        if (isObserver) this.requestingObservers.push({ publicUser, id: playerId });
        else this.requestingPlayers.push(new Player(playerId, publicUser));
    }

    addToJoined(publicUser: PublicUser, playerId: string, isObserver: boolean): void {
        if (isObserver) this.joinedObservers.push({ publicUser, id: playerId });
        else this.fillNextEmptySpot(new Player(playerId, publicUser));
    }

    getUserFromRequestingUsers(criteria: (user: Observer) => boolean, isObserver?: boolean): [Observer, boolean] {
        let requestingArray: Observer[] = [];
        if (isObserver === undefined || isObserver) requestingArray = requestingArray.concat(this.requestingObservers);
        if (isObserver === undefined || !isObserver) requestingArray = requestingArray.concat(this.requestingPlayers);

        const matchingUsers: Observer[] = requestingArray.filter((requesting) => criteria(requesting));
        if (matchingUsers.length === 0) throw new HttpException(INVALID_PLAYER_ID_FOR_GAME, StatusCodes.FORBIDDEN);
        const matchingUser: Observer = matchingUsers[0];
        return isObserver === undefined ? [matchingUser, this.requestingObservers.includes(matchingUser)] : [matchingUser, isObserver];
    }

    removeRequesting(playerId: string): Observer {
        const [userWanted, isObserver] = this.getUserFromRequestingUsers((user) => user.id === playerId);
        let requestingArray: Observer[];
        if (isObserver) requestingArray = this.requestingObservers;
        else requestingArray = this.requestingPlayers;
        const index = requestingArray.indexOf(userWanted);
        return requestingArray.splice(index, 1)[0];
    }

    changeRequestingToJoined(playerId: string, isObserver: boolean): void {
        const requestingUser: Observer = this.removeRequesting(playerId);
        if (isObserver) {
            this.joinedObservers.push(requestingUser);
        } else if (requestingUser instanceof Player) {
            this.fillNextEmptySpot(requestingUser);
        } else {
            throw new HttpException(INVALID_TYPES, StatusCodes.BAD_REQUEST);
        }
    }
}
