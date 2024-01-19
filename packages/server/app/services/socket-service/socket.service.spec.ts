/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Application } from '@app/app';
import { ConnectedUser } from '@app/classes/user/connected-user';
import { GAME_ROOM_ID_PREFIX } from '@app/constants/classes-constants';
import { SOCKET_CONFIGURE_EVENT_NAME } from '@app/constants/services-constants/socket-consts';
import { INVALID_ID_FOR_SOCKET, SOCKET_SERVICE_NOT_INITIALIZED } from '@app/constants/services-errors';
import { AuthentificationService } from '@app/services/authentification-service/authentification.service';
import { ChatService } from '@app/services/chat-service/chat.service';
import DictionaryService from '@app/services/dictionary-service/dictionary.service';
import { NotificationService } from '@app/services/notification-service/notification.service';
import { ServerActionService } from '@app/services/server-action-service/server-action.service';
import { ServicesTestingUnit } from '@app/services/service-testing-unit/services-testing-unit.spec';
import { Delay } from '@app/utils/delay/delay';
import * as arrowFunction from '@app/utils/is-id-virtual-player/is-id-virtual-player';
import { Server } from 'app/server';
import * as chai from 'chai';
import { expect, spy } from 'chai';
import * as sinon from 'sinon';
import { Socket, io as ioClient } from 'socket.io-client';
import { Container } from 'typedi';
import { SocketService } from './socket.service';

const RESPONSE_DELAY = 400;
const SERVER_URL = 'http://localhost:';

const DEFAULT_ROOM = 'default_room';
const DEFAULT_GAME_ROOM = GAME_ROOM_ID_PREFIX + 'default_room';
const INVALID_ROOM_NAME = 'invalid_room';
const INVALID_ID = 'invalid-id';
const DEFAULT_ARGS = 'data';
const DEFAULT_TOKEN = 'token';
const SOCKET_ID = 'socketid';
const getSocketId = async (socket: Socket) => {
    const DELAY = 5;
    const MAX_DELAY = 500;

    let i = 0;
    while (socket.id === undefined) {
        await Delay.for(DELAY);
        if (i * DELAY > MAX_DELAY) throw new Error('TIMEOUT');
        i++;
    }
    return socket.id;
};

describe('SocketService', () => {
    afterEach(() => {
        chai.spy.restore();
    });

    describe('Initialized', () => {
        let service: SocketService;
        let server: Server;
        let clientSocket: Socket;
        let testingUnit: ServicesTestingUnit;

        beforeEach(async () => {
            testingUnit = new ServicesTestingUnit()
                .withStubbed(DictionaryService)
                .withStubbed(ChatService)
                .withStubbed(NotificationService, {
                    initalizeAdminApp: undefined,
                    sendNotification: Promise.resolve(' '),
                })
                .withStubbed(
                    AuthentificationService,
                    {
                        authentificateSocket: Promise.resolve(),
                    },
                    { connectedUsers: sinon.createStubInstance(ConnectedUser) as unknown as ConnectedUser },
                )
                .withStubbedPrototypes(Application, { bindRoutes: undefined });
            await testingUnit.withMockDatabaseService();
        });

        beforeEach(() => {
            server = Container.get(Server);
            server.init();
            service = server['socketService'];
            chai.spy.on(service, 'handleDisconnect', () => {});
            clientSocket = ioClient(SERVER_URL + Server['appPort'], { auth: { token: DEFAULT_TOKEN } });
            service.handleSockets();
        });

        afterEach(() => {
            clientSocket.close();
            service['sio']?.close();
            testingUnit.restore();
        });

        it('should create', () => {
            expect(service).to.exist;
        });

        describe('on connect', () => {
            it('should add to the socket map', async () => {
                service.handleSockets();
                clientSocket.connect();
                await Delay.for(RESPONSE_DELAY); // Wait until the server socket received connection.
                expect(service['sockets'].get(clientSocket.id)).to.exist;
            });

            it('should emit initialization', async () => {
                return new Promise((resolve) => {
                    clientSocket.on('initialization', (res: { id: string }) => {
                        expect(res).to.ownProperty('id');
                        resolve();
                    });
                    clientSocket.connect();
                });
            });

            it('should emit sockets:configure event', async () => {
                const emitStub = sinon.stub(service['configureSocketsEvent'], 'emit');
                emitStub.callsFake(() => {
                    return true;
                });
                service.handleSockets();
                clientSocket.connect();

                await Delay.for(RESPONSE_DELAY); // Wait until the server socket received connection.

                expect(emitStub.calledWith(SOCKET_CONFIGURE_EVENT_NAME)).to.be.true;
            });
        });

        describe('getSocket', () => {
            let id: string;

            beforeEach(async () => {
                clientSocket.connect();
                id = await getSocketId(clientSocket);
            });

            afterEach(() => {
                clientSocket.disconnect();
            });

            it('should find socket when connected', () => {
                expect(service.getSocket(id)).to.exist;
            });

            it('should throw when id is invalid', () => {
                const invalidId = 'invalidId';
                expect(invalidId).to.not.equal(id);
                expect(() => service.getSocket(invalidId)).to.throw(INVALID_ID_FOR_SOCKET);
            });
        });

        describe('addToRoom', () => {
            let id: string;
            beforeEach(async () => {
                clientSocket.connect();
                id = await getSocketId(clientSocket);
            });

            afterEach(() => {
                clientSocket.disconnect();
            });

            it('should add it to the room', () => {
                expect(service.getSocket(id).socket.rooms.has(DEFAULT_ROOM)).to.be.false;
                service.addToRoom(id, DEFAULT_ROOM);
                expect(service.getSocket(id).socket.rooms.has(DEFAULT_ROOM)).to.be.true;
            });

            it('should add it to the gameRoom', () => {
                service.addToRoom(id, DEFAULT_GAME_ROOM);
                expect(service.getSocket(id).gameRoom).to.equal(DEFAULT_GAME_ROOM);
            });
        });

        describe('deleteRoom', () => {
            let id: string;
            beforeEach(async () => {
                clientSocket.connect();
                id = await getSocketId(clientSocket);
            });

            afterEach(() => {
                clientSocket.disconnect();
            });

            it('should remove it from the room', () => {
                service.addToRoom(id, DEFAULT_ROOM);
                expect(service.getSocket(id).socket.rooms.has(DEFAULT_ROOM)).to.be.true;
                service.deleteRoom(DEFAULT_ROOM);
                expect(service.getSocket(id).socket.rooms.has(DEFAULT_ROOM)).to.be.false;
                expect(service['sio']?.sockets.adapter.rooms.has(DEFAULT_ROOM)).to.be.false;
            });
        });

        describe('removeFromRoom', () => {
            let id: string;
            beforeEach(async () => {
                clientSocket.connect();
                id = await getSocketId(clientSocket);
                service.addToRoom(id, DEFAULT_ROOM);
            });

            afterEach(() => {
                clientSocket.disconnect();
            });

            it('should remove socketId from room', () => {
                expect(service.getSocket(id).socket.rooms.has(DEFAULT_ROOM)).to.be.true;
                service.removeFromRoom(id, DEFAULT_ROOM);
                expect(service.getSocket(id).socket.rooms.has(DEFAULT_ROOM)).to.be.false;
            });

            it('should remove it from the gameRoom if it matches', () => {
                service.addToRoom(id, DEFAULT_GAME_ROOM);
                expect(service.getSocket(id).gameRoom).to.equal(DEFAULT_GAME_ROOM);
                service.removeFromRoom(id, DEFAULT_GAME_ROOM);
                expect(service.getSocket(id).gameRoom).to.equal(undefined);
            });
        });

        describe('doesRoomExist', () => {
            let id: string;
            beforeEach(async () => {
                clientSocket.connect();
                id = await getSocketId(clientSocket);
            });

            afterEach(() => {
                clientSocket.disconnect();
            });

            it('should return true if room has socket in it', () => {
                service.addToRoom(id, DEFAULT_ROOM);
                expect(service.getSocket(id).socket.rooms.has(DEFAULT_ROOM)).to.be.true;
                expect(service.doesRoomExist(DEFAULT_ROOM)).to.be.true;
            });

            it('should return false if room has no socket in it', () => {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                service['sio']!.sockets.adapter.rooms.get(DEFAULT_ROOM)?.clear();
                expect(service.doesRoomExist(DEFAULT_ROOM)).to.be.false;
            });
        });

        describe('emitToRoom', () => {
            let id: string;

            beforeEach(async () => {
                clientSocket.connect();
                id = await getSocketId(clientSocket);
            });

            afterEach(() => {
                clientSocket.disconnect();
            });

            it('should emit to room', async () => {
                return new Promise((resolve) => {
                    service.addToRoom(id, DEFAULT_ROOM);

                    clientSocket.on('_test_event', (args: unknown[]) => {
                        expect(args).to.equal(DEFAULT_ARGS);
                        resolve();
                    });

                    service.emitToRoom(DEFAULT_ROOM, '_test_event', DEFAULT_ARGS);
                });
            });

            it('should throw if sio is undefined', () => {
                const sio = service['sio'];
                service['sio'] = undefined;
                expect(() => service.emitToRoom(DEFAULT_ROOM, '_test_event', DEFAULT_ARGS)).to.throw(SOCKET_SERVICE_NOT_INITIALIZED);
                service['sio'] = sio;
            });
        });

        describe('emitToRoomNoSender', () => {
            let id: string;

            beforeEach(async () => {
                clientSocket.connect();
                id = await getSocketId(clientSocket);
            });

            afterEach(() => {
                clientSocket.disconnect();
            });

            it('should not emit to socket if id is from virtual player', async () => {
                const spyGetSocket = spy.on(service, 'getSocket', () => {
                    return {};
                });

                spy.on(arrowFunction, 'isIdVirtualPlayer', () => {
                    return true;
                });
                service.emitToRoomNoSender(id, SOCKET_ID, '_test_event', DEFAULT_ARGS);
                expect(spyGetSocket).not.to.have.been.called();
            });

            it('should throw if sio is undefined', () => {
                const sio = service['sio'];
                service['sio'] = undefined;
                expect(() => service.emitToRoomNoSender(id, SOCKET_ID, '_test_event', DEFAULT_ARGS)).to.throw(SOCKET_SERVICE_NOT_INITIALIZED);
                service['sio'] = sio;
            });
        });

        describe('emitToSocket', () => {
            let id: string;

            beforeEach(async () => {
                clientSocket.connect();
                id = await getSocketId(clientSocket);
            });

            afterEach(() => {
                clientSocket.disconnect();
            });

            it('should emit to socket', async () => {
                return new Promise((resolve) => {
                    clientSocket.on('_test_event', (args: unknown[]) => {
                        expect(args).to.equal(DEFAULT_ARGS);
                        resolve();
                    });
                    service.emitToSocket(id, '_test_event', DEFAULT_ARGS);
                });
            });

            it('should not emit to socket if id is from virtual player', async () => {
                const spyGetSocket = spy.on(service, 'getSocket', () => {
                    return {};
                });

                spy.on(arrowFunction, 'isIdVirtualPlayer', () => {
                    return true;
                });
                service.emitToSocket(id, '_test_event', DEFAULT_ARGS);
                expect(spyGetSocket).not.to.have.been.called();
            });

            it('should throw if sio is undefined', () => {
                const sio = service['sio'];
                service['sio'] = undefined;
                expect(() => service.emitToSocket(id, '_test_event', DEFAULT_ARGS)).to.throw(SOCKET_SERVICE_NOT_INITIALIZED);
                service['sio'] = sio;
            });
        });
    });

    describe('Not initialized', () => {
        let service: SocketService;

        beforeEach(async () => {
            service = new SocketService(
                Container.get(AuthentificationService),
                sinon.createStubInstance(ServerActionService) as unknown as ServerActionService,
                Container.get(NotificationService),
            );
        });

        describe('addToRoom', () => {
            it('should throw if ID is invalid', () => {
                expect(() => service.addToRoom(INVALID_ID, DEFAULT_ROOM)).to.throw(SOCKET_SERVICE_NOT_INITIALIZED);
            });
        });

        describe('deleteRoom', () => {
            it('should throw if ID is invalid', () => {
                expect(() => service.deleteRoom(INVALID_ID)).to.throw(SOCKET_SERVICE_NOT_INITIALIZED);
            });
        });

        describe('removeFromRoom', () => {
            it('should throw if ID is invalid', () => {
                expect(() => service.removeFromRoom(INVALID_ID, INVALID_ROOM_NAME)).to.throw(SOCKET_SERVICE_NOT_INITIALIZED);
            });
        });

        describe('doesRoomExist', () => {
            it('should throw if ID is invalid', () => {
                expect(() => service.doesRoomExist(INVALID_ROOM_NAME)).to.throw(SOCKET_SERVICE_NOT_INITIALIZED);
            });
        });

        describe('getAllSockets', () => {
            it('should return an empty array', () => {
                expect(service.getAllSockets()).to.be.empty;
            });
        });
    });
});
