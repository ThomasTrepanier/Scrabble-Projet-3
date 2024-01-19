/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-len */
/* eslint-disable max-lines */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-unused-expressions, no-unused-expressions */

import { DictionarySummary } from '@app/classes/communication/dictionary-data';
import { GameConfig } from '@app/classes/game/game-config';
import Room from '@app/classes/game/room';
import WaitingRoom from '@app/classes/game/waiting-room';
import Player from '@app/classes/player/player';
import { ACCEPT, REJECT } from '@app/constants/services-constants/game-dispatcher-const';
import {
    CANT_START_GAME_WITH_NO_REAL_OPPONENT,
    INVALID_PLAYER_ID_FOR_GAME,
    NO_DICTIONARY_INITIALIZED,
    NO_GAME_FOUND_WITH_ID,
} from '@app/constants/services-errors';
import { VirtualPlayerFactory } from '@app/factories/virtual-player-factory/virtual-player-factory';
import { ChatService } from '@app/services/chat-service/chat.service';
import { CreateGameService } from '@app/services/create-game-service/create-game.service';
import { NotificationService } from '@app/services/notification-service/notification.service';
import { ServicesTestingUnit } from '@app/services/service-testing-unit/services-testing-unit.spec';
import { SocketService } from '@app/services/socket-service/socket.service';
import { VirtualPlayerService } from '@app/services/virtual-player-service/virtual-player.service';
import { GameVisibility } from '@common/models/game-visibility';
import { GroupData } from '@common/models/group';
import { VirtualPlayerLevel } from '@common/models/virtual-player-level';
import * as chai from 'chai';
import { spy } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import * as sinon from 'sinon';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { Container } from 'typedi';
import { GameDispatcherService } from './game-dispatcher.service';

const expect = chai.expect;

const USER1 = { username: 'user1', email: 'email1', avatar: 'avatar1' };
const USER2 = { username: 'user2', email: 'email2', avatar: 'avatar2' };
const DEFAULT_OPPONENT_USER = { username: 'user5', email: 'email5', avatar: 'avatar5' };
const DEFAULT_OPPONENT_USER2 = { username: 'user6', email: 'email5', avatar: 'avatar5' };
const DEFAULT_OPPONENT_USER3 = { username: 'user7', email: 'email5', avatar: 'avatar5' };
const DEFAULT_USER_ID = 1;
const DEFAULT_PLAYER_ID1 = 'id1';
const DEFAULT_GAME_CHANNEL_ID = 1;
const DEFAULT_OPPONENT_ID = 'opponent_id';
const DEFAULT_OPPONENT_ID2 = 'opponent_id2';
const DEFAULT_OPPONENT_ID3 = 'opponent_id3';
const DEFAULT_ROUND_TIME = 1;

const DEFAULT_OPPONENT = new Player(DEFAULT_OPPONENT_ID, DEFAULT_OPPONENT_USER);
const DEFAULT_OPPONENT2 = new Player(DEFAULT_OPPONENT_ID2, DEFAULT_OPPONENT_USER2);
const DEFAULT_OPPONENT3 = new Player(DEFAULT_OPPONENT_ID3, DEFAULT_OPPONENT_USER3);

const DEFAULT_GROUP_DATA: GroupData = {
    user1: USER1,
    maxRoundTime: DEFAULT_ROUND_TIME,
    virtualPlayerLevel: VirtualPlayerLevel.Beginner,
    gameVisibility: GameVisibility.Private,
    password: '',
    numberOfObservers: 0,
};

const DEFAULT_JOINED_PLAYER1 = new Player(DEFAULT_PLAYER_ID1, USER2);

const DEFAULT_MULTIPLAYER_CONFIG: GameConfig = {
    player1: new Player(DEFAULT_PLAYER_ID1, USER1),
    maxRoundTime: DEFAULT_ROUND_TIME,
    virtualPlayerLevel: VirtualPlayerLevel.Beginner,
    gameVisibility: GameVisibility.Private,
    password: '',
};

const DEFAULT_WAITING_ROOM = new WaitingRoom(DEFAULT_MULTIPLAYER_CONFIG, DEFAULT_GAME_CHANNEL_ID);

chai.use(spies);
chai.use(chaiAsPromised);

describe('GameDispatcherService', () => {
    let gameDispatcherService: GameDispatcherService;
    let socketService: SocketService;
    let createGameService: CreateGameService;
    let testingUnit: ServicesTestingUnit;
    let virtualPlayerServiceStub: SinonStubbedInstance<VirtualPlayerService>;

    beforeEach(async () => {
        testingUnit = new ServicesTestingUnit()
            .withStubbedDictionaryService()
            .withStubbed(ChatService)
            .withStubbed(VirtualPlayerFactory)
            .withStubbed(NotificationService, {
                initalizeAdminApp: undefined,
                sendNotification: Promise.resolve(' '),
            });
        await testingUnit.withMockDatabaseService();
        virtualPlayerServiceStub = createStubInstance(VirtualPlayerService);
        gameDispatcherService = Container.get(GameDispatcherService);
        gameDispatcherService['virtualPlayerService'] = virtualPlayerServiceStub as unknown as VirtualPlayerService;
        socketService = Container.get(SocketService);
        createGameService = Container.get(CreateGameService);
    });

    afterEach(() => {
        chai.spy.restore();
        sinon.restore();
        testingUnit.restore();
    });

    it('should create', () => {
        expect(gameDispatcherService).to.exist;
    });

    it('should initiate an empty WaitingRoom in list', () => {
        expect(gameDispatcherService['waitingRooms']).to.be.empty;
    });

    describe('getGroupsRoom', () => {
        it('should GroupsRoom', () => {
            const room = {} as unknown as Room;
            gameDispatcherService['groupsRoom'] = room;
            expect(gameDispatcherService['getGroupsRoom']()).to.equal(room);
        });
    });

    describe('getVirtualPlayerService', () => {
        it('should VirtualPlayerService', () => {
            expect(gameDispatcherService['getVirtualPlayerService']()).to.equal(virtualPlayerServiceStub);
        });
    });

    describe('addToRoom', () => {
        it('should add room to waitingRooms', () => {
            gameDispatcherService['addToWaitingRoom'](DEFAULT_WAITING_ROOM);
            expect(gameDispatcherService['waitingRooms'].length).to.equal(1);
        });
    });

    describe('startRequest', () => {
        let getMultiplayerGameFromIdSpy: unknown;
        let newRoom: WaitingRoom;
        beforeEach(() => {
            newRoom = new WaitingRoom(DEFAULT_MULTIPLAYER_CONFIG, DEFAULT_GAME_CHANNEL_ID);
            const oldRoom = new WaitingRoom(DEFAULT_MULTIPLAYER_CONFIG, DEFAULT_GAME_CHANNEL_ID + 1);
            getMultiplayerGameFromIdSpy = spy.on(gameDispatcherService, 'getMultiplayerGameFromId', () => {
                return newRoom;
            });
            newRoom.joinedPlayer4 = {} as unknown as Player;
            gameDispatcherService['waitingRooms'] = [newRoom, oldRoom];
        });

        it('should call getMultiplayerGameFromIdSpy', () => {
            gameDispatcherService.startRequest('newroomid', DEFAULT_MULTIPLAYER_CONFIG.player1.id);
            expect(getMultiplayerGameFromIdSpy).to.have.been.called();
        });

        it('should throw if invalid playerid', () => {
            expect(() => {
                gameDispatcherService.startRequest('newroomid', 'badid');
            }).to.throw(INVALID_PLAYER_ID_FOR_GAME);
        });

        it('should throw if game has no joined players', () => {
            newRoom.joinedPlayer4 = undefined;

            expect(() => {
                gameDispatcherService.startRequest('newroomid', DEFAULT_MULTIPLAYER_CONFIG.player1.id);
            }).to.throw(CANT_START_GAME_WITH_NO_REAL_OPPONENT);
        });

        it('should remove the room from the waiting rooms', () => {
            expect(gameDispatcherService['waitingRooms'].includes(newRoom)).to.be.true;
            gameDispatcherService.startRequest('newroomid', DEFAULT_MULTIPLAYER_CONFIG.player1.id);
            expect(gameDispatcherService['waitingRooms'].includes(newRoom)).to.be.false;
        });
    });

    describe('createMultiplayerGame', () => {
        let createMultiplayerGameSpy: unknown;
        let addToRoomSpy: unknown;
        let getAllDictionarySummaries: unknown;

        beforeEach(() => {
            createMultiplayerGameSpy = chai.spy.on(createGameService, 'createMultiplayerGame', () => {
                return DEFAULT_WAITING_ROOM;
            });
            addToRoomSpy = chai.spy.on(socketService, 'addToRoom', () => {
                return;
            });
        });

        it('should call appropriate methods', async () => {
            getAllDictionarySummaries = chai.spy.on(gameDispatcherService['dictionaryService'], 'getAllDictionarySummaries', () => {
                return [{} as unknown as DictionarySummary, {} as unknown as DictionarySummary];
            });
            await gameDispatcherService['createMultiplayerGame'](DEFAULT_GROUP_DATA, DEFAULT_USER_ID, '');
            expect(createMultiplayerGameSpy).to.have.been.called();
            expect(addToRoomSpy).to.have.been.called();
            expect(getAllDictionarySummaries).to.have.been.called();
        });

        it('should throw if no dictionnary summary', async () => {
            getAllDictionarySummaries = chai.spy.on(gameDispatcherService['dictionaryService'], 'getAllDictionarySummaries', () => {
                return [];
            });
            await expect(gameDispatcherService['createMultiplayerGame'](DEFAULT_GROUP_DATA, DEFAULT_USER_ID, '')).to.be.rejectedWith(
                NO_DICTIONARY_INITIALIZED,
            );
        });
    });

    describe('requestJoinGame', () => {
        let id: string;
        let chatServiceStub: SinonStubbedInstance<ChatService>;

        beforeEach(() => {
            gameDispatcherService['waitingRooms'] = [DEFAULT_WAITING_ROOM];
            id = DEFAULT_WAITING_ROOM.getId();
            DEFAULT_WAITING_ROOM.joinedPlayer2 = undefined;
            DEFAULT_WAITING_ROOM.joinedPlayer3 = undefined;
            DEFAULT_WAITING_ROOM.joinedPlayer4 = undefined;
            spy.on(gameDispatcherService, 'getMultiplayerGameFromId', () => {
                return DEFAULT_WAITING_ROOM;
            });
            chatServiceStub = testingUnit.getStubbedInstance(ChatService);
            chatServiceStub.joinChannel.callsFake(async () => {});
        });

        afterEach(() => {
            chai.spy.restore();
        });

        it('should add the player to the requestingPlayers if group is private', () => {
            DEFAULT_WAITING_ROOM.getConfig().gameVisibility = GameVisibility.Private;
            expect(DEFAULT_WAITING_ROOM.requestingPlayers.length).to.equal(0);
            gameDispatcherService.requestJoinGame(id, DEFAULT_OPPONENT_ID, DEFAULT_OPPONENT_USER, '', false);
            expect(DEFAULT_WAITING_ROOM.requestingPlayers.length).to.equal(1);
        });

        it('should add the to the channel and room if protected and password matched', () => {
            DEFAULT_WAITING_ROOM.getConfig().gameVisibility = GameVisibility.Protected;
            DEFAULT_WAITING_ROOM.getConfig().password = 'Protected';
            DEFAULT_WAITING_ROOM.requestingPlayers = [new Player(DEFAULT_OPPONENT_ID, DEFAULT_OPPONENT_USER)];
            gameDispatcherService.requestJoinGame(id, DEFAULT_OPPONENT_ID, DEFAULT_OPPONENT_USER, 'Protected', false);
            expect(chatServiceStub.joinChannel.calledWith(DEFAULT_GAME_CHANNEL_ID, DEFAULT_OPPONENT_ID)).to.be.true;
        });

        it('should add the to the channel and room if public', () => {
            DEFAULT_WAITING_ROOM.getConfig().gameVisibility = GameVisibility.Public;
            DEFAULT_WAITING_ROOM.requestingPlayers = [new Player(DEFAULT_OPPONENT_ID, DEFAULT_OPPONENT_USER)];
            gameDispatcherService.requestJoinGame(id, DEFAULT_OPPONENT_ID, DEFAULT_OPPONENT_USER, '', false);
            expect(chatServiceStub.joinChannel.calledWith(DEFAULT_GAME_CHANNEL_ID, DEFAULT_OPPONENT_ID)).to.be.true;
        });
    });

    describe('handleJoinRequest', () => {
        let id: string;
        let chatServiceStub: SinonStubbedInstance<ChatService>;

        beforeEach(() => {
            gameDispatcherService['waitingRooms'] = [DEFAULT_WAITING_ROOM];
            id = DEFAULT_WAITING_ROOM.getId();
            DEFAULT_WAITING_ROOM.joinedPlayer2 = undefined;
            DEFAULT_WAITING_ROOM.requestingPlayers = [new Player(id, USER2)];
            spy.on(gameDispatcherService, 'getMultiplayerGameFromId', () => {
                return DEFAULT_WAITING_ROOM;
            });
            chatServiceStub = testingUnit.getStubbedInstance(ChatService);
            chatServiceStub.joinChannel.callsFake(async () => {});
        });

        afterEach(() => {
            chai.spy.restore();
        });

        it('should throw if wrong player given', async () => {
            const stubbedJoinedPlayer = sinon.createStubInstance(Player);
            stubbedJoinedPlayer.publicUser = DEFAULT_OPPONENT_USER;
            stubbedJoinedPlayer.id = DEFAULT_OPPONENT_ID;
            DEFAULT_WAITING_ROOM.joinedPlayer2 = stubbedJoinedPlayer as unknown as Player;
            await expect(gameDispatcherService.handleJoinRequest(id, 'weongid', 'wrongname', ACCEPT)).to.be.rejectedWith(INVALID_PLAYER_ID_FOR_GAME);
        });

        it("should make user join group's channel if accepted", async () => {
            const stubbedJoinedPlayer = sinon.createStubInstance(Player);
            stubbedJoinedPlayer.publicUser = DEFAULT_OPPONENT_USER;
            stubbedJoinedPlayer.id = DEFAULT_OPPONENT_ID;
            DEFAULT_WAITING_ROOM.requestingPlayers = [stubbedJoinedPlayer as unknown as Player];
            const fillNextEmptySpotSpy = spy.on(DEFAULT_WAITING_ROOM, 'fillNextEmptySpot', () => {
                return;
            });

            const convertToGroupSpy = spy.on(DEFAULT_WAITING_ROOM, 'convertToGroup', () => {
                return {};
            });

            await gameDispatcherService.handleJoinRequest(id, DEFAULT_PLAYER_ID1, stubbedJoinedPlayer.publicUser.username, ACCEPT);
            expect(fillNextEmptySpotSpy).to.have.been.called();
            expect(convertToGroupSpy).to.have.been.called();

            expect(chatServiceStub.joinChannel.calledWith(DEFAULT_GAME_CHANNEL_ID, stubbedJoinedPlayer.id)).to.be.true;
        });

        it("should not make user join group's channel if rejected", async () => {
            const stubbedJoinedPlayer = sinon.createStubInstance(Player);
            stubbedJoinedPlayer.publicUser = DEFAULT_OPPONENT_USER;
            stubbedJoinedPlayer.id = DEFAULT_OPPONENT_ID;
            DEFAULT_WAITING_ROOM.requestingPlayers = [stubbedJoinedPlayer as unknown as Player];
            const fillNextEmptySpotSpy = spy.on(DEFAULT_WAITING_ROOM, 'fillNextEmptySpot', () => {
                return;
            });

            const convertToGroupSpy = spy.on(DEFAULT_WAITING_ROOM, 'convertToGroup', () => {
                return {};
            });

            await gameDispatcherService.handleJoinRequest(id, DEFAULT_PLAYER_ID1, stubbedJoinedPlayer.publicUser.username, REJECT);
            expect(fillNextEmptySpotSpy).to.not.have.been.called();
            expect(chatServiceStub.joinChannel.calledWith(DEFAULT_GAME_CHANNEL_ID, stubbedJoinedPlayer.id)).to.be.false;
            expect(convertToGroupSpy).to.have.been.called();
        });
    });

    describe('leaveGroupRequest', () => {
        let id: string;
        // let waitingRoom: WaitingRoom;
        let chatServiceStub: SinonStubbedInstance<ChatService>;

        beforeEach(() => {
            gameDispatcherService['waitingRooms'] = [DEFAULT_WAITING_ROOM];
            id = DEFAULT_WAITING_ROOM.getId();
            spy.on(gameDispatcherService, 'getMultiplayerGameFromId', () => {
                return DEFAULT_WAITING_ROOM;
            });
            DEFAULT_WAITING_ROOM.joinedPlayer2 = DEFAULT_OPPONENT;
            DEFAULT_WAITING_ROOM.joinedPlayer3 = DEFAULT_OPPONENT2;
            DEFAULT_WAITING_ROOM.joinedPlayer4 = DEFAULT_OPPONENT3;

            chatServiceStub = testingUnit.getStubbedInstance(ChatService);
            chatServiceStub.quitChannel.callsFake(async () => {});
        });

        it("should disconnect joinedPlayer from group's channel(player 2)", async () => {
            sinon.stub(DEFAULT_WAITING_ROOM, 'getGroupChannelId').returns(DEFAULT_GAME_CHANNEL_ID);
            const expectedId = DEFAULT_WAITING_ROOM.joinedPlayer2?.id;

            await gameDispatcherService.leaveGroupRequest(id, DEFAULT_OPPONENT.id);

            expect(chatServiceStub.quitChannel.calledWith(DEFAULT_WAITING_ROOM.getGroupChannelId(), expectedId)).to.be.true;
        });

        it("should disconnect joinedPlayer from group's channel (player3)", async () => {
            sinon.stub(DEFAULT_WAITING_ROOM, 'getGroupChannelId').returns(DEFAULT_GAME_CHANNEL_ID);
            const expectedId = DEFAULT_WAITING_ROOM.joinedPlayer3?.id;

            await gameDispatcherService.leaveGroupRequest(id, DEFAULT_OPPONENT2.id);

            expect(chatServiceStub.quitChannel.calledWith(DEFAULT_WAITING_ROOM.getGroupChannelId(), expectedId)).to.be.true;
        });

        it("should disconnect joinedPlayer from group's channel(player4)", async () => {
            sinon.stub(DEFAULT_WAITING_ROOM, 'getGroupChannelId').returns(DEFAULT_GAME_CHANNEL_ID);
            const expectedId = DEFAULT_WAITING_ROOM.joinedPlayer4?.id;

            await gameDispatcherService.leaveGroupRequest(id, DEFAULT_OPPONENT3.id);

            expect(chatServiceStub.quitChannel.calledWith(DEFAULT_WAITING_ROOM.getGroupChannelId(), expectedId)).to.be.true;
        });
    });

    describe('cancelGame', () => {
        let id: string;

        beforeEach(() => {
            gameDispatcherService['waitingRooms'] = [DEFAULT_WAITING_ROOM];
            id = DEFAULT_WAITING_ROOM.getId();
            spy.on(gameDispatcherService, 'getMultiplayerGameFromId', () => {
                return DEFAULT_WAITING_ROOM;
            });
        });

        it('should remove waiting game from list', async () => {
            await gameDispatcherService.cancelGame(id, DEFAULT_JOINED_PLAYER1.id);
            expect(gameDispatcherService['waitingRooms'].filter((g) => g.getId() === id)).to.be.empty;
        });

        it("should empty the group's channel", async () => {
            const chatServiceStub = testingUnit.getStubbedInstance(ChatService);
            chatServiceStub.emptyChannel.callsFake(async () => {});

            sinon.stub(DEFAULT_WAITING_ROOM, 'getGroupChannelId').returns(DEFAULT_GAME_CHANNEL_ID);

            await gameDispatcherService.cancelGame(id, DEFAULT_JOINED_PLAYER1.id);

            expect(chatServiceStub.emptyChannel.calledWith(DEFAULT_WAITING_ROOM.getGroupChannelId())).to.be.true;
        });

        it('should throw if playerId is invalid', async () => {
            const invalidId = 'invalidId';
            expect(gameDispatcherService.cancelGame(id, invalidId)).to.eventually.throw(INVALID_PLAYER_ID_FOR_GAME);
        });
    });

    describe('getAvailableWaitingRooms', () => {
        it('should return right amount', () => {
            const NTH_GAMES = 5;
            for (let i = 0; i < NTH_GAMES; ++i) {
                const newRoom = new WaitingRoom(DEFAULT_MULTIPLAYER_CONFIG, DEFAULT_GAME_CHANNEL_ID);
                gameDispatcherService['addToWaitingRoom'](newRoom);
            }

            expect(gameDispatcherService.getAvailableWaitingRooms()).to.have.lengthOf(NTH_GAMES);
        });

        it('should all games (even with joined player)', () => {
            const NTH_GAMES = 5;
            const NTH_JOINED = 2;
            gameDispatcherService['waitingRooms'] = [];
            spy.on(gameDispatcherService, 'getMultiplayerGameFromId', (i) => {
                return gameDispatcherService['waitingRooms'][i];
            });

            for (let i = 0; i < NTH_GAMES; ++i) {
                const newRoom = new WaitingRoom(DEFAULT_MULTIPLAYER_CONFIG, DEFAULT_GAME_CHANNEL_ID);
                newRoom['id'] = i as unknown as string;
                gameDispatcherService['addToWaitingRoom'](newRoom);
                if (i < NTH_JOINED) {
                    newRoom.joinedPlayer2 = {} as unknown as Player;
                    newRoom.joinedPlayer3 = {} as unknown as Player;
                    newRoom.joinedPlayer4 = {} as unknown as Player;
                }
            }

            expect(gameDispatcherService.getAvailableWaitingRooms()).to.have.lengthOf(NTH_GAMES);
        });
    });

    describe('isPlayerFromAcceptedPlayers', () => {
        let getMultiplayerGameFromIdSpy: unknown;
        let newRoom: WaitingRoom;
        beforeEach(() => {
            newRoom = new WaitingRoom(DEFAULT_MULTIPLAYER_CONFIG, DEFAULT_GAME_CHANNEL_ID);
            getMultiplayerGameFromIdSpy = spy.on(gameDispatcherService, 'getMultiplayerGameFromId', () => {
                return newRoom;
            });
        });

        it('should call getMultiplayerGameFromIdSpy', () => {
            gameDispatcherService.isPlayerFromAcceptedUsers('newroomid', 'playerid');
            expect(getMultiplayerGameFromIdSpy).to.have.been.called();
        });

        it('should false if not from joined players', () => {
            expect(gameDispatcherService.isPlayerFromAcceptedUsers('newroomid', 'notjoinedplayerid')).to.be.false;
        });

        it('should false if host id', () => {
            expect(gameDispatcherService.isPlayerFromAcceptedUsers('newroomid', DEFAULT_PLAYER_ID1)).to.be.false;
        });

        it('should true if player 4', () => {
            newRoom.joinedPlayer4 = { id: 'joinedPlayer4id' } as unknown as Player;
            expect(gameDispatcherService.isPlayerFromAcceptedUsers('newroomid', 'joinedPlayer4id')).to.be.true;
        });
    });

    describe('removeRequestingPlayer', () => {
        let getMultiplayerGameFromIdSpy: unknown;
        beforeEach(() => {
            gameDispatcherService['waitingRooms'] = [DEFAULT_WAITING_ROOM];
            getMultiplayerGameFromIdSpy = spy.on(gameDispatcherService, 'getMultiplayerGameFromId', () => {
                return DEFAULT_WAITING_ROOM;
            });
            DEFAULT_WAITING_ROOM.requestingPlayers = [];
            DEFAULT_WAITING_ROOM.requestingPlayers.push(DEFAULT_OPPONENT);
            DEFAULT_WAITING_ROOM.requestingPlayers.push(DEFAULT_OPPONENT2);
            DEFAULT_WAITING_ROOM.requestingPlayers.push(DEFAULT_OPPONENT3);
        });

        it('should call getMultiplayerGameFromIdSpy', () => {
            gameDispatcherService.isPlayerFromAcceptedUsers('newroomid', 'playerid');
            expect(getMultiplayerGameFromIdSpy).to.have.been.called();
        });
    });

    describe('getGameFromId', () => {
        let id: string;

        beforeEach(() => {
            gameDispatcherService['waitingRooms'] = [DEFAULT_WAITING_ROOM];
            id = DEFAULT_WAITING_ROOM.getId();
        });

        it('should find the waitingRoom', () => {
            expect(gameDispatcherService['getMultiplayerGameFromId'](id)).to.exist;
        });

        it('should throw when id is invalid', () => {
            const invalidId = 'invalidId';
            expect(() => gameDispatcherService['getMultiplayerGameFromId'](invalidId)).to.throw(NO_GAME_FOUND_WITH_ID);
        });
    });

    describe('isGameInWaitingRooms', () => {
        const stubPlayer: SinonStubbedInstance<Player> = createStubInstance(Player);
        const config: GameConfig = {
            player1: stubPlayer as unknown as Player,
            maxRoundTime: 60,
        } as unknown as GameConfig;
        let waitingRooms: WaitingRoom[];

        beforeEach(() => {
            waitingRooms = [new WaitingRoom(config, DEFAULT_GAME_CHANNEL_ID)];
            gameDispatcherService['waitingRooms'] = waitingRooms;
        });

        it('should return false if gameId is not associated to game in waitingRooms', () => {
            const gameId = 'NOT_EXISTING_ID';
            expect(gameDispatcherService.isGameInWaitingRooms(gameId)).to.be.false;
        });

        it('should return true if gameId is associated to game in waitingRooms', () => {
            const gameId = waitingRooms[0].getId();
            expect(gameDispatcherService.isGameInWaitingRooms(gameId)).to.be.true;
        });
    });
});
