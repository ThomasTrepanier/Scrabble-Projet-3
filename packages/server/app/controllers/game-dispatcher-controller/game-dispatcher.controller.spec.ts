/* eslint-disable max-len */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable max-lines */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Application } from '@app/app';
import { GameUpdateData } from '@app/classes/communication/game-update-data';
import Game from '@app/classes/game/game';
import { GameConfig, StartGameData } from '@app/classes/game/game-config';
import Room from '@app/classes/game/room';
import WaitingRoom from '@app/classes/game/waiting-room';
import { HttpException } from '@app/classes/http-exception/http-exception';
import Player from '@app/classes/player/player';
import { ConnectedUser } from '@app/classes/user/connected-user';
import { SECONDS_TO_MILLISECONDS, TIME_TO_RECONNECT } from '@app/constants/controllers-constants';
import { GAME_IS_OVER } from '@app/constants/controllers-errors';
import { SYSTEM_ID } from '@app/constants/game-constants';
import { ActiveGameService } from '@app/services/active-game-service/active-game.service';
import { AuthentificationService } from '@app/services/authentification-service/authentification.service';
import { ChatService } from '@app/services/chat-service/chat.service';
import { GameDispatcherService } from '@app/services/game-dispatcher-service/game-dispatcher.service';
import { NotificationService } from '@app/services/notification-service/notification.service';
import { ServicesTestingUnit } from '@app/services/service-testing-unit/services-testing-unit.spec';
import { SocketService } from '@app/services/socket-service/socket.service';
import { UserService } from '@app/services/user-service/user-service';
import { GameVisibility } from '@common/models/game-visibility';
import { Group, GroupData } from '@common/models/group';
import { Observer } from '@common/models/observer';
import { UNKOWN_USER, User } from '@common/models/user';
import { VirtualPlayerLevel } from '@common/models/virtual-player-level';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import { EventEmitter } from 'events';
import { StatusCodes } from 'http-status-codes';
import * as sinon from 'sinon';
import { SinonStub, SinonStubbedInstance, createStubInstance, stub, useFakeTimers } from 'sinon';
import { Socket } from 'socket.io';
import * as supertest from 'supertest';
import { Container } from 'typedi';
import { GameDispatcherController } from './game-dispatcher.controller';

const expect = chai.expect;

chai.use(spies);
chai.use(chaiAsPromised);

const USER1: User = { username: 'user1', email: 'email1', avatar: 'avatar1', idUser: 1, password: '1' };
const USER2: User = { username: 'user2', email: 'email2', avatar: 'avatar2', idUser: 2, password: '2' };

const DEFAULT_PLAYER_ID = 'playerId';
const DEFAULT_GAME_ID = 'gameId';
const DEFAULT_USER_ID = 1;
const DEFAULT_SOCKETID_ID = 'SocketID';
const DEFAULT_NEW_PLAYER_ID = 'newPlayerId';
const DEFAULT_MAX_ROUND_TIME = 1;

const DEFAULT_PLAYER_NAME = 'player';
const DEFAULT_GAME_CONFIG_DATA: GroupData = {
    virtualPlayerLevel: VirtualPlayerLevel.Beginner,
    gameVisibility: GameVisibility.Private,
    maxRoundTime: DEFAULT_MAX_ROUND_TIME,
    user1: USER1,
    password: '',
    numberOfObservers: 0,
};

const DEFAULT_GROUP: Group = {
    virtualPlayerLevel: VirtualPlayerLevel.Beginner,
    gameVisibility: GameVisibility.Private,
    maxRoundTime: DEFAULT_MAX_ROUND_TIME,
    groupId: '',
    password: '',
    user1: USER1,
    user2: USER2,
    numberOfObservers: 0,
};

const DEFAULT_EXCEPTION = 'exception';

// const DEFAULT_PLAYER = new Player(VIRTUAL_PLAYER_ID_PREFIX + DEFAULT_PLAYER_ID, DEFAULT_PLAYER_NAME);
const DEFAULT_JOINED_PLAYER1 = new Player(DEFAULT_PLAYER_ID, USER1);
const DEFAULT_JOINED_PLAYER2 = new Player(DEFAULT_PLAYER_ID, USER1);
const DEFAULT_JOINED_PLAYER3 = new Player(DEFAULT_PLAYER_ID, USER1);

describe('GameDispatcherController', () => {
    let controller: GameDispatcherController;
    let authentificationServiceStub: SinonStubbedInstance<AuthentificationService>;
    let socketServiceStub: SinonStubbedInstance<SocketService>;
    let userService: UserService;
    let testingUnit: ServicesTestingUnit;

    beforeEach(async () => {
        testingUnit = new ServicesTestingUnit();
        await testingUnit.withMockDatabaseService();
        testingUnit
            .withStubbedDictionaryService()
            .withStubbedControllers(GameDispatcherController)
            .withStubbed(ChatService)
            .withStubbed(NotificationService, {
                initalizeAdminApp: undefined,
                sendNotification: Promise.resolve(' '),
            })
            .withMockedAuthentification();
        authentificationServiceStub = testingUnit.setStubbed(AuthentificationService);
        socketServiceStub = testingUnit.setStubbed(SocketService);
    });

    beforeEach(() => {
        socketServiceStub.playerDisconnectedEvent = new EventEmitter();
        controller = Container.get(GameDispatcherController);
        userService = Container.get(UserService);
        authentificationServiceStub.connectedUsers = new ConnectedUser();
        authentificationServiceStub.connectedUsers.connect(DEFAULT_SOCKETID_ID, DEFAULT_USER_ID);
    });

    afterEach(() => {
        sinon.restore();
        chai.spy.restore();
        testingUnit.restore();
    });

    it('should create', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions, no-unused-expressions
        expect(controller).to.exist;
    });

    describe('configureRouter', () => {
        let expressApp: Express.Application;

        beforeEach(() => {
            const app = Container.get(Application);
            expressApp = app.app;
        });

        describe('POST /games/', () => {
            it('should return CREATED', async () => {
                chai.spy.on(controller, 'handleCreateGame', () => {});

                return await supertest(expressApp).post('/api/games/').send({ idUser: DEFAULT_USER_ID }).expect(StatusCodes.CREATED);
            });

            it('should return BAD_REQUEST on throw httpException', async () => {
                chai.spy.on(controller, 'handleCreateGame', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.BAD_REQUEST);
                });

                return await supertest(expressApp).post('/api/games/').send({ idUser: DEFAULT_USER_ID }).expect(StatusCodes.BAD_REQUEST);
            });
        });

        describe('GET /games/', () => {
            it('should return NO_CONTENT', async () => {
                chai.spy.on(controller, 'handleGroupsRequest', () => {});

                return await supertest(expressApp).get('/api/games/').send({ idUser: DEFAULT_USER_ID }).expect(StatusCodes.NO_CONTENT);
            });

            it('should return INTERNAL_SERVER_ERROR on throw httpException', async () => {
                chai.spy.on(controller, 'handleGroupsRequest', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.INTERNAL_SERVER_ERROR);
                });

                return await supertest(expressApp).get('/api/games/').send({ idUser: DEFAULT_USER_ID }).expect(StatusCodes.INTERNAL_SERVER_ERROR);
            });
        });

        describe('/games/:gameId/players/join', () => {
            it('should return NO_CONTENT', async () => {
                await userService['table'].insert(USER1);
                chai.spy.on(controller, 'handleJoinGame', () => {});

                return await supertest(expressApp)
                    .post(`/api/games/${DEFAULT_GAME_ID}/players/join`)
                    .send({ idUser: USER1.idUser })
                    .expect(StatusCodes.NO_CONTENT);
            });

            it('should return BAD_REQUEST on throw', async () => {
                await userService['table'].insert(USER1);
                chai.spy.on(controller, 'handleJoinGame', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.BAD_REQUEST);
                });

                return await supertest(expressApp)
                    .post(`/api/games/${DEFAULT_GAME_ID}/players/join`)
                    .send({ idUser: USER1.idUser })
                    .expect(StatusCodes.BAD_REQUEST);
            });
        });

        describe('/games/:gameId/players/accept', () => {
            it('should return NO_CONTENT', async () => {
                chai.spy.on(controller, 'handleAcceptRequest', () => {});

                return await supertest(expressApp)
                    .post(`/api/games/${DEFAULT_GAME_ID}/players/accept`)
                    .send({ idUser: DEFAULT_USER_ID })
                    .expect(StatusCodes.NO_CONTENT);
            });

            it('should return BAD_REQUEST on throw', async () => {
                chai.spy.on(controller, 'handleAcceptRequest', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.BAD_REQUEST);
                });

                return await supertest(expressApp)
                    .post(`/api/games/${DEFAULT_GAME_ID}/players/accept`)
                    .send({ idUser: DEFAULT_USER_ID })
                    .expect(StatusCodes.BAD_REQUEST);
            });
        });

        describe('PATCH /games/:gameId/', () => {
            it('should return NO_CONTENT', async () => {
                await userService['table'].insert(USER1);
                chai.spy.on(controller, 'handleGetGroupUpdates', () => {});

                return await supertest(expressApp)
                    .patch(`/api/games/${DEFAULT_GAME_ID}`)
                    .send({ idUser: USER1.idUser, password: '' })
                    .expect(StatusCodes.NO_CONTENT);
            });

            it('should return BAD_REQUEST on throw', async () => {
                await userService['table'].insert(USER1);
                chai.spy.on(controller, 'handleGetGroupUpdates', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.BAD_REQUEST);
                });

                return await supertest(expressApp)
                    .patch(`/api/games/${DEFAULT_GAME_ID}`)
                    .send({ idUser: USER1.idUser, password: '' })
                    .expect(StatusCodes.BAD_REQUEST);
            });
        });

        describe('/games/:gameId/players/start', () => {
            it('should return NO_CONTENT', async () => {
                chai.spy.on(controller, 'handleStartRequest', () => {});

                return await supertest(expressApp)
                    .post(`/api/games/${DEFAULT_GAME_ID}/players/start`)
                    .send({ idUser: DEFAULT_USER_ID })
                    .expect(StatusCodes.NO_CONTENT);
            });

            it('should return BAD_REQUEST on throw', async () => {
                chai.spy.on(controller, 'handleStartRequest', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.BAD_REQUEST);
                });

                return await supertest(expressApp)
                    .post(`/api/games/${DEFAULT_GAME_ID}/players/start`)
                    .send({ idUser: DEFAULT_USER_ID })
                    .expect(StatusCodes.BAD_REQUEST);
            });
        });

        describe('/games/:gameId/players/:playerId/reject', () => {
            it('should return NO_CONTENT', async () => {
                chai.spy.on(controller, 'handleRejectRequest', () => {});

                return await supertest(expressApp)
                    .post(`/api/games/${DEFAULT_GAME_ID}/players/reject`)
                    .send({ idUser: DEFAULT_USER_ID })
                    .expect(StatusCodes.NO_CONTENT);
            });

            it('should return BAD_REQUEST on throw', async () => {
                chai.spy.on(controller, 'handleRejectRequest', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.BAD_REQUEST);
                });

                return await supertest(expressApp)
                    .post(`/api/games/${DEFAULT_GAME_ID}/players/reject`)
                    .send({ idUser: DEFAULT_USER_ID })
                    .expect(StatusCodes.BAD_REQUEST);
            });
        });

        describe('/games/:gameId/players/:playerId/cancel', () => {
            it('should return NO_CONTENT', async () => {
                chai.spy.on(controller, 'handleCancelGame', () => {});

                return await supertest(expressApp)
                    .delete(`/api/games/${DEFAULT_GAME_ID}/players/cancel`)
                    .send({ idUser: DEFAULT_USER_ID })
                    .expect(StatusCodes.NO_CONTENT);
            });

            it('should return INTERNAL_SERVER_ERROR on throw', async () => {
                chai.spy.on(controller, 'handleCancelGame', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.INTERNAL_SERVER_ERROR);
                });

                return await supertest(expressApp)
                    .delete(`/api/games/${DEFAULT_GAME_ID}/players/cancel`)
                    .send({ idUser: DEFAULT_USER_ID })
                    .expect(StatusCodes.INTERNAL_SERVER_ERROR);
            });
        });

        describe('/games/:gameId/player/:playerId/reconnect', () => {
            it('should return NO_CONTENT', async () => {
                chai.spy.on(controller, 'handleReconnection', () => {});

                return await supertest(expressApp)
                    .post(`/api/games/${DEFAULT_GAME_ID}/players/reconnect`)
                    .send({ idUser: DEFAULT_USER_ID })
                    .expect(StatusCodes.NO_CONTENT);
            });

            it('should return INTERNAL_SERVER_ERROR on throw', async () => {
                chai.spy.on(controller, 'handleReconnection', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.INTERNAL_SERVER_ERROR);
                });

                return await supertest(expressApp)
                    .post(`/api/games/${DEFAULT_GAME_ID}/players/reconnect`)
                    .send({ idUser: DEFAULT_USER_ID })
                    .expect(StatusCodes.INTERNAL_SERVER_ERROR);
            });
        });

        describe('/games/:gameId/player/:playerId/disconnect', () => {
            it('should return NO_CONTENT', async () => {
                chai.spy.on(controller, 'handleDisconnection', () => {});

                return await supertest(expressApp)
                    .delete(`/api/games/${DEFAULT_GAME_ID}/players/disconnect`)
                    .send({ idUser: DEFAULT_USER_ID })
                    .expect(StatusCodes.NO_CONTENT);
            });

            it('should return INTERNAL_SERVER_ERROR on throw', async () => {
                chai.spy.on(controller, 'handleDisconnection', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.INTERNAL_SERVER_ERROR);
                });

                return await supertest(expressApp)
                    .delete(`/api/games/${DEFAULT_GAME_ID}/players/disconnect`)
                    .send({ idUser: DEFAULT_USER_ID })
                    .expect(StatusCodes.INTERNAL_SERVER_ERROR);
            });
        });

        describe('/games/:gameId/player/:playerId/leave', () => {
            it('should return NO_CONTENT', async () => {
                chai.spy.on(controller, 'handleLeave', () => {});

                return await supertest(expressApp)
                    .delete(`/api/games/${DEFAULT_GAME_ID}/players/leave`)
                    .send({ idUser: DEFAULT_USER_ID })
                    .expect(StatusCodes.NO_CONTENT);
            });

            it('should return INTERNAL_SERVER_ERROR on throw', async () => {
                chai.spy.on(controller, 'handleLeave', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.INTERNAL_SERVER_ERROR);
                });

                return await supertest(expressApp)
                    .delete(`/api/games/${DEFAULT_GAME_ID}/players/leave`)
                    .send({ idUser: DEFAULT_USER_ID })
                    .expect(StatusCodes.INTERNAL_SERVER_ERROR);
            });
        });
    });

    describe('handleReconnection', () => {
        let gameStub: SinonStubbedInstance<Game>;
        let getGameSpy: SinonStub;
        let playerStub: SinonStubbedInstance<Player>;
        let opponent: SinonStubbedInstance<Player>;
        let gameDispatcherStub: SinonStubbedInstance<GameDispatcherService>;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let emitToSocketSpy: any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let emitToRoomNoSenderSpy: any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let addToRoomSpy: any;
        let mockStartGameData: StartGameData;

        beforeEach(() => {
            gameStub = createStubInstance(Game);
            gameDispatcherStub = createStubInstance(GameDispatcherService);

            playerStub = createStubInstance(Player);
            playerStub.id = DEFAULT_PLAYER_ID;
            playerStub.isConnected = true;

            opponent = createStubInstance(Player);
            opponent.id = 'opponent-id';

            mockStartGameData = undefined as unknown as StartGameData;
            gameStub.createStartGameData.callsFake(() => mockStartGameData);
            getGameSpy = stub(controller['activeGameService'], 'getGame').returns(gameStub as unknown as Game);
            controller['gameDispatcherService'] = gameDispatcherStub as unknown as GameDispatcherService;
            gameStub.getPlayer
                .onFirstCall()
                .returns(playerStub as unknown as Player)
                .onSecondCall()
                .returns(opponent as unknown as Player);
            emitToSocketSpy = chai.spy.on(controller['socketService'], 'emitToSocket', () => {});
            emitToRoomNoSenderSpy = chai.spy.on(controller['socketService'], 'emitToRoomNoSender', () => {});
            addToRoomSpy = chai.spy.on(controller['socketService'], 'addToRoom', () => {});
            gameStub.areGameOverConditionsMet.returns(false);

            gameStub.getPlayerNumber.returns(1);
        });

        it('should call activeGameService.getGame', () => {
            gameStub.areGameOverConditionsMet.returns(false);
            controller['handleReconnection'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_NEW_PLAYER_ID);
            chai.assert(getGameSpy.calledOnce);
        });

        it('should call isGameOver', () => {
            gameStub.areGameOverConditionsMet.returns(false);
            controller['handleReconnection'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_NEW_PLAYER_ID);
            chai.assert(gameStub.areGameOverConditionsMet.calledOnce);
        });

        it('should throw GAME_IS_OVER, FORBIDDEN if game isGameOver', () => {
            gameStub.areGameOverConditionsMet.returns(true);
            const result = () => controller['handleReconnection'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_NEW_PLAYER_ID);
            expect(result).to.throw(GAME_IS_OVER);
        });

        it('should set Player id to new Id and Connected to true', () => {
            controller['handleReconnection'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_NEW_PLAYER_ID);
            expect(playerStub.id).to.equal(DEFAULT_NEW_PLAYER_ID);
            expect(playerStub.isConnected).to.be.true;
        });

        it('should call addToRoom', () => {
            gameStub.areGameOverConditionsMet.returns(false);
            controller['handleReconnection'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_NEW_PLAYER_ID);
            expect(addToRoomSpy).to.have.been.called();
        });

        it('should createStartGameData', () => {
            gameStub.areGameOverConditionsMet.returns(false);

            controller['handleReconnection'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_NEW_PLAYER_ID);
            chai.assert(gameStub.createStartGameData.calledOnce);
        });

        it('should call emit start game data to reconnected socket', () => {
            gameStub.areGameOverConditionsMet.returns(false);

            controller['handleReconnection'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_NEW_PLAYER_ID);
            expect(emitToSocketSpy).to.have.been.called.with(DEFAULT_NEW_PLAYER_ID, 'startGame', mockStartGameData);
        });

        it('should call emit new id to opponents', () => {
            gameStub.areGameOverConditionsMet.returns(false);

            controller['handleReconnection'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_NEW_PLAYER_ID);
            const updateData: GameUpdateData = { player1: { id: DEFAULT_PLAYER_ID, newId: DEFAULT_NEW_PLAYER_ID } };
            expect(emitToRoomNoSenderSpy).to.have.been.called.with(DEFAULT_GAME_ID, DEFAULT_NEW_PLAYER_ID, 'gameUpdate', updateData);
        });
    });

    describe('handleCreateGame', () => {
        it('should call createMultiplayerGame', async () => {
            const createGameServiceSpy = chai.spy.on(controller['gameDispatcherService'], 'createMultiplayerGame', () => ({} as unknown as Group));
            controller['handleCreateGame'](DEFAULT_GAME_CONFIG_DATA, DEFAULT_USER_ID, '');
            expect(createGameServiceSpy).to.have.been.called();
        });
    });

    describe('handleJoinGame', () => {
        let emitSocketSpy: unknown;
        let emitRoomSpy: unknown;
        let addRoomSpy: unknown;
        let requestSpy: unknown;

        const waitingRoom = new WaitingRoom({ player1: DEFAULT_JOINED_PLAYER1 } as unknown as GameConfig, 1);
        beforeEach(() => {
            emitSocketSpy = chai.spy.on(controller['socketService'], 'emitToSocket', () => {});
            emitRoomSpy = chai.spy.on(controller['socketService'], 'emitToRoom', () => {});
            addRoomSpy = chai.spy.on(controller['socketService'], 'addToRoom', () => {});
            requestSpy = chai.spy.on(controller['gameDispatcherService'], 'requestJoinGame', () => waitingRoom);
            chai.spy.on(controller, 'handleGroupsUpdate', () => {});
            const stubSocket = createStubInstance(Socket);
            stubSocket.leave.returns();
            chai.spy.on(controller['socketService'], 'getSocket', () => {
                return { socket: stubSocket };
            });
        });

        it('should call socketService.emitToSocket if game is private', async () => {
            waitingRoom.getConfig().gameVisibility = GameVisibility.Private;
            await controller['handleJoinGame'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, USER1, '');
            expect(emitSocketSpy).to.have.been.called();
        });

        it('should call socketService.addToRoom and emitToRoom if game is protected', async () => {
            waitingRoom.getConfig().gameVisibility = GameVisibility.Protected;
            await controller['handleJoinGame'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, USER1, '');
            expect(emitRoomSpy).to.have.been.called();
            expect(addRoomSpy).to.have.been.called();
        });

        it('should call socketService.addToRoom and emitToRoom if game is public', async () => {
            waitingRoom.getConfig().gameVisibility = GameVisibility.Public;
            await controller['handleJoinGame'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, USER1, '');
            expect(emitRoomSpy).to.have.been.called();
            expect(addRoomSpy).to.have.been.called();
        });

        it('should call gameDispatcherService.requestJoinGame', async () => {
            await controller['handleJoinGame'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, USER1, '');
            expect(requestSpy).to.have.been.called();
        });
    });

    describe('handleAcceptRequest', async () => {
        let rejectSpy: unknown;
        let emitToSocketSpy: unknown;
        let addToRoomSpy: unknown;
        const player = new Player('id', USER1);

        beforeEach(() => {
            rejectSpy = chai.spy.on(controller['gameDispatcherService'], 'handleJoinRequest', () => [player, { user1: USER1 }]);
            emitToSocketSpy = chai.spy.on(controller['socketService'], 'emitToRoom', () => {});
            addToRoomSpy = chai.spy.on(controller['socketService'], 'addToRoom', () => {});
        });

        it('should call gameDispatcherService.rejectJoinRequest', async () => {
            await controller['handleAcceptRequest'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_PLAYER_NAME);
            expect(rejectSpy).to.have.been.called();
        });

        it('should call emitToSocketSpy', async () => {
            await controller['handleAcceptRequest'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_PLAYER_NAME);
            expect(emitToSocketSpy).to.have.been.called();
        });

        it('should call addToRoomSpy', async () => {
            await controller['handleAcceptRequest'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_PLAYER_NAME);
            expect(addToRoomSpy).to.have.been.called();
        });
    });

    describe('handleStartRequest', () => {
        let emitToSocketSpy: unknown;
        let emitToRoomSpy: unknown;
        let removeFromRoomSpy: unknown;
        let getMultiplayerGameFromIdSpy: unknown;
        let beginGameSpy: unknown;
        let startRequestSpy: unknown;
        let waitingRoom: WaitingRoom;

        beforeEach(() => {
            emitToSocketSpy = chai.spy.on(controller['socketService'], 'emitToSocket', () => {});
            emitToRoomSpy = chai.spy.on(controller['socketService'], 'emitToRoom', () => {});
            startRequestSpy = chai.spy.on(controller['gameDispatcherService'], 'startRequest', () => {
                return { idChannel: 2 };
            });
            removeFromRoomSpy = chai.spy.on(controller['socketService'], 'removeFromRoom', () => {});
            beginGameSpy = chai.spy.on(controller['activeGameService'], 'beginGame', () => {
                return { round: { playerData: { id: 'id' } } };
            });
            waitingRoom = new WaitingRoom({ player1: { id: '1' } } as unknown as GameConfig, 1);

            getMultiplayerGameFromIdSpy = chai.spy.on(controller['gameDispatcherService'], 'getMultiplayerGameFromId', () => {
                return waitingRoom;
            });
        });

        it('has no requesting players', async () => {
            await controller['handleStartRequest'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID);
            expect(getMultiplayerGameFromIdSpy).to.have.been.called();
            expect(emitToSocketSpy).not.to.have.been.called();
            expect(removeFromRoomSpy).not.to.have.been.called();
            expect(startRequestSpy).to.have.been.called();
            expect(beginGameSpy).to.have.been.called();
            expect(emitToRoomSpy).to.have.been.called();
        });

        it('has requesting players', async () => {
            waitingRoom.requestingPlayers.push(new Player('', USER1));
            await controller['handleStartRequest'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID);

            expect(getMultiplayerGameFromIdSpy).to.have.been.called();
            expect(emitToSocketSpy).to.have.been.called();
        });
    });

    describe('handleRejectRequest', async () => {
        let rejectSpy: unknown;
        let emitToSocketSpy: unknown;
        const player = new Player('id', USER1);

        beforeEach(() => {
            rejectSpy = chai.spy.on(controller['gameDispatcherService'], 'handleJoinRequest', () => [player, { user1: USER1 }]);
            emitToSocketSpy = chai.spy.on(controller['socketService'], 'emitToSocket', () => {});
        });

        it('should call gameDispatcherService.rejectJoinRequest', async () => {
            chai.spy.on(controller, 'handleGroupsUpdate', () => {});
            await controller['handleRejectRequest'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_PLAYER_NAME);
            expect(rejectSpy).to.have.been.called();
        });

        it('should call emitToSocketSpy', async () => {
            chai.spy.on(controller, 'handleGroupsUpdate', () => {});
            await controller['handleRejectRequest'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_PLAYER_NAME);
            expect(emitToSocketSpy).to.have.been.called();
        });
    });

    describe('handleGroupsRequest', () => {
        let getAvailableRoomsSpy: unknown;
        let addToRoomSpy: unknown;
        let emitToSocketSpy: unknown;
        const groupStub = createStubInstance(Room);
        groupStub.getId.returns('1');

        beforeEach(() => {
            chai.spy.on(controller['gameDispatcherService'], 'getLobbiesRoom', () => groupStub);
            getAvailableRoomsSpy = chai.spy.on(controller['gameDispatcherService'], 'getAvailableWaitingRooms', () => groupStub);
            addToRoomSpy = chai.spy.on(controller['socketService'], 'addToRoom', () => {});
            emitToSocketSpy = chai.spy.on(controller['socketService'], 'emitToSocket', () => {});
            controller['handleGroupsRequest']('');
        });

        it('should call gameDispatcherService.getAvailableWaitingRooms', () => {
            expect(getAvailableRoomsSpy).to.have.been.called();
        });

        it('should call socketService.addToRoom', () => {
            expect(addToRoomSpy).to.have.been.called();
        });

        it('should call socketService.emitToSocket', () => {
            expect(emitToSocketSpy).to.have.been.called();
        });
    });

    describe('handleCancelGame', () => {
        let getGameFromIdSpy: unknown;
        let emitToRoomNoSenderSpy: unknown;
        let cancelGameSpy: unknown;
        let handleLobbiesUpdateSpy: unknown;
        const waitingRoomStub = createStubInstance(WaitingRoom);

        beforeEach(() => {
            getGameFromIdSpy = chai.spy.on(controller['gameDispatcherService'], 'getMultiplayerGameFromId', () => {
                return waitingRoomStub;
            });
            emitToRoomNoSenderSpy = chai.spy.on(controller['socketService'], 'emitToRoomNoSender', () => {});
            cancelGameSpy = chai.spy.on(controller['gameDispatcherService'], 'cancelGame', () => {});
            handleLobbiesUpdateSpy = chai.spy.on(controller, 'handleGroupsUpdate', () => {});
            waitingRoomStub.joinedPlayer2 = DEFAULT_JOINED_PLAYER1;
            waitingRoomStub.joinedPlayer3 = DEFAULT_JOINED_PLAYER2;
            waitingRoomStub.joinedPlayer4 = DEFAULT_JOINED_PLAYER3;
            waitingRoomStub.requestingPlayers = [new Player('unkownid', UNKOWN_USER)];
            waitingRoomStub.requestingObservers = [{ id: 'unkownid', publicUser: UNKOWN_USER }];
            chai.spy.on(waitingRoomStub, 'getConfig', () => {
                return { player1: new Player(DEFAULT_PLAYER_ID, USER1) };
            });
        });

        afterEach(() => {
            chai.spy.restore();
        });

        it('should call gameDispatcherService.getMultiplayerGameFromId', async () => {
            await controller['handleCancelGame'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID);
            expect(getGameFromIdSpy).to.have.been.called.with(DEFAULT_GAME_ID);
        });

        it('should call socketService.emitToSocket', () => {
            waitingRoomStub.joinedPlayer2 = new Player(DEFAULT_PLAYER_ID, USER1);
            controller['handleCancelGame'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID);
            expect(emitToRoomNoSenderSpy).to.have.been.called();
        });

        it('should call gameDispatcherService.cancelGame', async () => {
            await controller['handleCancelGame'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID);
            expect(cancelGameSpy).to.have.been.called.with(DEFAULT_GAME_ID, DEFAULT_PLAYER_ID);
        });

        it('should call handleLobbiesUpdate', async () => {
            await controller['handleCancelGame'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID);
            expect(handleLobbiesUpdateSpy).to.have.been.called();
        });
    });

    describe('handleLeave', () => {
        let isGameInWaitingRoomsSpy: unknown;
        let emitToRoomSpy: unknown;
        let removeFromRoomSpy: unknown;
        let activeGameServiceStub: SinonStubbedInstance<ActiveGameService>;

        beforeEach(() => {
            emitToRoomSpy = chai.spy.on(controller['socketService'], 'emitToRoom', () => {});
            removeFromRoomSpy = chai.spy.on(controller['socketService'], 'removeFromRoom', () => {});
            activeGameServiceStub = createStubInstance(ActiveGameService);

            (controller['activeGameService'] as unknown) = activeGameServiceStub;
            activeGameServiceStub.playerLeftEvent = new EventEmitter();
        });

        describe('Player leave before game', async () => {
            let leaveGroupRequestSpy: unknown;

            beforeEach(async () => {
                isGameInWaitingRoomsSpy = chai.spy.on(controller['gameDispatcherService'], 'isGameInWaitingRooms', () => {
                    return true;
                });
                leaveGroupRequestSpy = chai.spy.on(controller['gameDispatcherService'], 'leaveGroupRequest', async () => {
                    return DEFAULT_GROUP;
                });
                chai.spy.on(controller, 'handleLobbiesUpdate', () => {});
            });

            it('Player is from joinedPlayers', async () => {
                const isPlayerFromAcceptedPlayersSpy = chai.spy.on(controller['gameDispatcherService'], 'isPlayerFromAcceptedUsers', () => {
                    return true;
                });
                const handleGroupsUpdateSpy = chai.spy.on(controller, 'handleGroupsUpdate', () => {
                    return true;
                });
                await controller['handleLeave'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID);
                expect(isPlayerFromAcceptedPlayersSpy).to.have.been.called();
                expect(isGameInWaitingRoomsSpy).to.have.been.called();
                expect(leaveGroupRequestSpy).to.have.been.called();
                expect(emitToRoomSpy).to.have.been.called();
                expect(removeFromRoomSpy).to.have.been.called();
                expect(handleGroupsUpdateSpy).to.have.been.called();
            });

            it('Player is from requesting players', async () => {
                const waitingRoom = new WaitingRoom({ player1: { id: '1' } } as unknown as GameConfig, 1);
                const isPlayerFromAcceptedPlayersSpy = chai.spy.on(controller['gameDispatcherService'], 'isPlayerFromAcceptedUsers', () => {
                    return false;
                });
                const removeRequestingSpy = chai.spy.on(waitingRoom, 'removeRequesting', () => {
                    return {} as unknown as Observer;
                });
                const getMultiplayerGameFromIdSpy = chai.spy.on(controller['gameDispatcherService'], 'getMultiplayerGameFromId', () => {
                    return waitingRoom;
                });
                await controller['handleLeave'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID);
                expect(isPlayerFromAcceptedPlayersSpy).to.have.been.called();
                expect(removeRequestingSpy).to.have.been.called();
                expect(getMultiplayerGameFromIdSpy).to.have.been.called();
            });
        });

        describe('Player leave during game', () => {
            beforeEach(async () => {
                isGameInWaitingRoomsSpy = chai.spy.on(controller['gameDispatcherService'], 'isGameInWaitingRooms', () => {
                    return false;
                });
            });

            it('should call handlePlayerLeaves on ActiveGameService', () => {
                activeGameServiceStub.handlePlayerLeaves.callsFake(async () => {});

                controller['handleLeave'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID);

                expect(activeGameServiceStub.handlePlayerLeaves.calledWith(DEFAULT_GAME_ID, DEFAULT_PLAYER_ID));
            });
        });
    });

    describe('handleGroupsUpdate', () => {
        let getAvailableRoomsSpy: unknown;
        let emitToRoomSpy: unknown;
        let getGroupsRoomSpy: unknown;
        let room: Room;

        beforeEach(() => {
            room = new Room();
            getAvailableRoomsSpy = chai.spy.on(controller['gameDispatcherService'], 'getAvailableWaitingRooms', () => {});
            emitToRoomSpy = chai.spy.on(controller['socketService'], 'emitToRoom', () => {});
            getGroupsRoomSpy = chai.spy.on(controller['gameDispatcherService'], 'getGroupsRoom', () => {
                return room;
            });

            controller['handleGroupsUpdate']();
        });

        it('should call gameDispatcherService.getAvailableWaitingRooms', () => {
            expect(getAvailableRoomsSpy).to.have.been.called();
        });

        it('should call socketService.emitToRoom', () => {
            expect(emitToRoomSpy).to.have.been.called();
        });

        it('should call gameDispatcherService.getLobbiesRoom', () => {
            expect(getGroupsRoomSpy).to.have.been.called();
        });
    });

    describe('handleDisconnection', () => {
        let gameStub: SinonStubbedInstance<Game>;
        let getGameSpy: SinonStub;
        let gameIsOverSpy: unknown;
        let playerStub: SinonStubbedInstance<Player>;
        let handleLeaveSpy: unknown;

        beforeEach(() => {
            gameStub = createStubInstance(Game);
            getGameSpy = stub(controller['activeGameService'], 'getGame').returns(gameStub as unknown as Game);
            playerStub = createStubInstance(Player);
            gameStub.getPlayer.returns(playerStub as unknown as Player);
            handleLeaveSpy = chai.spy.on(controller, 'handleGroupLeave', () => {});
        });

        it('Disconnection should verify if game is over', () => {
            gameIsOverSpy = chai.spy.on(gameStub, 'areGameOverConditionsMet', () => true);
            controller['handleDisconnection'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID);
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions, no-unused-expressions
            expect(getGameSpy.calledOnce).to.be.true;
            expect(gameIsOverSpy).to.have.been.called();
        });

        it('Disconnection should force player to leave if they are not reconnected after 5 seconds', () => {
            const clock = useFakeTimers();
            gameIsOverSpy = chai.spy.on(gameStub, 'areGameOverConditionsMet', () => false);
            controller['handleDisconnection'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID);
            expect(handleLeaveSpy).to.not.have.been.called();

            clock.tick(TIME_TO_RECONNECT * SECONDS_TO_MILLISECONDS);
            clock.restore();
        });

        it('Disconnection should keep player in game if they reconnect within 5 seconds', () => {
            const clock = useFakeTimers();
            gameIsOverSpy = chai.spy.on(gameStub, 'areGameOverConditionsMet', () => false);
            controller['handleDisconnection'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID);
            expect(handleLeaveSpy).to.not.have.been.called();
            playerStub.isConnected = true;

            clock.tick(TIME_TO_RECONNECT * SECONDS_TO_MILLISECONDS);
            expect(handleLeaveSpy).to.not.have.been.called.with(DEFAULT_GAME_ID, DEFAULT_PLAYER_ID);
            clock.restore();
        });
    });

    describe('PlayerLeftFeedback', () => {
        it('On receive player feedback, should call handlePlayerFeedback method', () => {
            const handlePlayerFeedbackSpy = chai.spy.on(controller, 'handlePlayerLeftFeedback', () => {});
            const messages: string[] = ['test'];
            const updatedData: GameUpdateData = {};
            controller['activeGameService'].playerLeftEvent.emit('playerLeftFeedback', DEFAULT_GAME_ID, messages, updatedData);
            expect(handlePlayerFeedbackSpy).to.have.been.called.with(DEFAULT_GAME_ID, messages, updatedData);
        });

        it('PlayerLeftFeedback shoud emit game update to room', () => {
            const emitToRoomSpy = chai.spy.on(controller['socketService'], 'emitToRoom', () => {});
            const messages: string[] = ['test'];
            const updatedData: GameUpdateData = {};
            controller['handlePlayerLeftFeedback'](DEFAULT_GAME_ID, messages, updatedData);
            expect(emitToRoomSpy).to.have.been.called.with(DEFAULT_GAME_ID, 'gameUpdate', updatedData);
        });

        it('PlayerLeftFeedback shoud emit end game messages to room', () => {
            const emitToRoomSpy = chai.spy.on(controller['socketService'], 'emitToRoom', () => {});
            const messages: string[] = ['test', 'test2', 'test3'];
            const updatedData: GameUpdateData = {};
            controller['handlePlayerLeftFeedback'](DEFAULT_GAME_ID, messages, updatedData);
            expect(emitToRoomSpy).to.have.been.called.with(DEFAULT_GAME_ID, 'newMessage', {
                content: messages.join('<br>'),
                senderId: SYSTEM_ID,
                gameId: DEFAULT_GAME_ID,
            });
        });
    });
});
