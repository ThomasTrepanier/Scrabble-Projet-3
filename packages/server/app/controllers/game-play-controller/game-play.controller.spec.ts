/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Application } from '@app/app';
import { Position } from '@app/classes/board';
import Board from '@app/classes/board/board';
import { ActionData } from '@app/classes/communication/action-data';
import { FeedbackMessage, FeedbackMessages } from '@app/classes/communication/feedback-messages';
import { GameUpdateData } from '@app/classes/communication/game-update-data';
import { Message } from '@app/classes/communication/message';
import { RoundData } from '@app/classes/communication/round-data';
import Game from '@app/classes/game/game';
import { HttpException } from '@app/classes/http-exception/http-exception';
import Player from '@app/classes/player/player';
import { Square } from '@app/classes/square';
import { Tile, TileReserve } from '@app/classes/tile';
import { ConnectedUser } from '@app/classes/user/connected-user';
import { CONTENT_REQUIRED, SENDER_REQUIRED } from '@app/constants/controllers-errors';
import { SYSTEM_ERROR_ID } from '@app/constants/game-constants';
import { COMMAND_IS_INVALID, INVALID_COMMAND, INVALID_WORD } from '@app/constants/services-errors';
import { VIRTUAL_PLAYER_ID_PREFIX } from '@app/constants/virtual-player-constants';
import { ActiveGameService } from '@app/services/active-game-service/active-game.service';
import { AuthentificationService } from '@app/services/authentification-service/authentification.service';
import { GamePlayService } from '@app/services/game-play-service/game-play.service';
import { NotificationService } from '@app/services/notification-service/notification.service';
import { ServicesTestingUnit } from '@app/services/service-testing-unit/services-testing-unit.spec';
import { SocketService } from '@app/services/socket-service/socket.service';
import { VirtualPlayerService } from '@app/services/virtual-player-service/virtual-player.service';
import { Delay } from '@app/utils/delay/delay';
import * as isIdVirtualPlayer from '@app/utils/is-id-virtual-player/is-id-virtual-player';
import { ActionType } from '@common/models/action';
import { TilePlacement } from '@common/models/tile-placement';
import * as chai from 'chai';
import { spy } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import { StatusCodes } from 'http-status-codes';
import * as sinon from 'sinon';
import { SinonStub, SinonStubbedInstance, createStubInstance, stub } from 'sinon';
import * as supertest from 'supertest';
import { Container } from 'typedi';
import { GamePlayController } from './game-play.controller';

const expect = chai.expect;

chai.use(spies);
chai.use(chaiAsPromised);

const USER1 = { username: 'user1', email: 'email1', avatar: 'avatar1' };
const USER2 = { username: 'user2', email: 'email2', avatar: 'avatar2' };
const DEFAULT_PLAYER_ID = 'id';
const DEFAULT_GAME_ID = 'gameId';
const DEFAULT_DATA: ActionData = { type: ActionType.EXCHANGE, payload: { tiles: [] }, input: '' };
const DEFAULT_EXCEPTION = 'exception';
const DEFAULT_FEEDBACK: FeedbackMessage = { message: 'this is a feedback' };
const DEFAULT_PLAYER_1 = new Player('player-1', USER1);
const DEFAULT_PLAYER_2 = new Player('player-2', USER2);
const DEFAULT_SQUARE_1: Square = { tile: null, position: new Position(0, 0), scoreMultiplier: null, wasMultiplierUsed: false, isCenter: false };
const DEFAULT_BOARD: Square[][] = [
    [
        { ...DEFAULT_SQUARE_1, position: new Position(0, 0) },
        { ...DEFAULT_SQUARE_1, position: new Position(1, 0) },
    ],
    [
        { ...DEFAULT_SQUARE_1, position: new Position(0, 1) },
        { ...DEFAULT_SQUARE_1, position: new Position(1, 1) },
    ],
];
const DEFAULT_ERROR_MESSAGE = INVALID_COMMAND;
const DEFAULT_MESSAGE_CONTENT = 'content';
const DEFAULT_VIRTUAL_PLAYER_ID = VIRTUAL_PLAYER_ID_PREFIX + 'ID';
const DEFAULT_VIRTUAL_PLAYER_DATA = {
    id: DEFAULT_VIRTUAL_PLAYER_ID,
};
const DEFAULT_ROUND_DATA: RoundData = {
    playerData: DEFAULT_VIRTUAL_PLAYER_DATA,
    startTime: new Date(),
    limitTime: new Date(),
};
const DEFAULT_VIRTUAL_PLAYER_TURN_DATA: GameUpdateData = {
    round: DEFAULT_ROUND_DATA,
};
const DEFAULT_USER_ID = 1;
const DEFAULT_SOCKETID_ID = 'SocketID';

describe('GamePlayController', () => {
    let socketServiceStub: SinonStubbedInstance<SocketService>;
    let gamePlayServiceStub: SinonStubbedInstance<GamePlayService>;
    let activeGameServiceStub: SinonStubbedInstance<ActiveGameService>;
    let authentificationServiceStub: SinonStubbedInstance<AuthentificationService>;
    let gamePlayController: GamePlayController;
    let testingUnit: ServicesTestingUnit;

    beforeEach(async () => {
        testingUnit = new ServicesTestingUnit();
        await testingUnit.withMockDatabaseService();
        testingUnit
            .withStubbedDictionaryService()
            .withStubbed(ActiveGameService)
            .withStubbed(VirtualPlayerService)
            .withStubbedControllers(GamePlayController)
            .withStubbed(NotificationService, {
                initalizeAdminApp: undefined,
                sendNotification: Promise.resolve(' '),
            })
            .withMockedAuthentification();

        gamePlayServiceStub = testingUnit.setStubbed(GamePlayService);
        socketServiceStub = testingUnit.setStubbed(SocketService);
        authentificationServiceStub = testingUnit.setStubbed(AuthentificationService);
        activeGameServiceStub = testingUnit.setStubbed(ActiveGameService);
    });

    beforeEach(() => {
        gamePlayController = Container.get(GamePlayController);
        authentificationServiceStub.connectedUsers = new ConnectedUser();
        authentificationServiceStub.connectedUsers.connect(DEFAULT_SOCKETID_ID, DEFAULT_USER_ID);
    });

    afterEach(() => {
        sinon.restore();
        chai.spy.restore();
        testingUnit.restore();
    });

    it('should create', () => {
        expect(gamePlayController).to.exist;
    });

    describe('configureRouter', () => {
        let expressApp: Express.Application;

        beforeEach(() => {
            const app = Container.get(Application);
            expressApp = app.app;
        });

        describe('POST /games/:gameId/players/:playerId/action', () => {
            it('should return NO_CONTENT', async () => {
                chai.spy.on(gamePlayController, 'handlePlayAction', () => {});

                return await supertest(expressApp)
                    .post(`/api/games/${DEFAULT_GAME_ID}/players/action`)
                    .send({ idUser: DEFAULT_USER_ID })
                    .expect(StatusCodes.NO_CONTENT);
            });

            it('should return BAD_REQUEST on error', async () => {
                chai.spy.on(gamePlayController, 'handlePlayAction', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.BAD_REQUEST);
                });

                return await supertest(expressApp)
                    .post(`/api/games/${DEFAULT_GAME_ID}/players/action`)
                    .send({ idUser: DEFAULT_USER_ID })
                    .expect(StatusCodes.BAD_REQUEST);
            });

            it('should call handlePlayAction', async () => {
                const handlePlayActionSpy = chai.spy.on(gamePlayController, 'handlePlayAction', () => {});

                return await supertest(expressApp)
                    .post(`/api/games/${DEFAULT_GAME_ID}/players/action`)
                    .send({ idUser: DEFAULT_USER_ID })
                    .then(() => {
                        expect(handlePlayActionSpy).to.have.been.called();
                    });
            });
        });

        describe('POST /games/:gameId/squares/place', () => {
            it('should return NO_CONTENT', async () => {
                const tilePlacement: TilePlacement = {
                    tile: {} as Tile,
                    position: new Position(0, 0),
                };
                chai.spy.on(gamePlayController, 'handlePlaceTile', () => {});

                return await supertest(expressApp)
                    .post(`/api/games/${DEFAULT_GAME_ID}/squares/place`)
                    .send({ idUser: DEFAULT_USER_ID, tilePlacement: [tilePlacement] })
                    .expect(StatusCodes.NO_CONTENT);
            });
        });

        describe('POST /games/:gameId/players/virtual-player-action', () => {
            it('should return NO_CONTENT', async () => {
                chai.spy.on(gamePlayController, 'handlePlayAction', () => {});

                return await supertest(expressApp)
                    .post(`/api/games/${DEFAULT_GAME_ID}/players/virtual-player-action`)
                    .send({ virtualPlayerId: DEFAULT_USER_ID })
                    .expect(StatusCodes.NO_CONTENT);
            });

            it('should return BAD_REQUEST on error', async () => {
                chai.spy.on(gamePlayController, 'handlePlayAction', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.BAD_REQUEST);
                });

                return await supertest(expressApp)
                    .post(`/api/games/${DEFAULT_GAME_ID}/players/virtual-player-action`)
                    .send({ virtualPlayerId: DEFAULT_USER_ID })
                    .expect(StatusCodes.BAD_REQUEST);
            });

            it('should call handlePlayAction', async () => {
                const handlePlayActionSpy = chai.spy.on(gamePlayController, 'handlePlayAction', () => {});

                return await supertest(expressApp)
                    .post(`/api/games/${DEFAULT_GAME_ID}/players/virtual-player-action`)
                    .send({ virtualPlayerId: DEFAULT_USER_ID })
                    .then(() => {
                        expect(handlePlayActionSpy).to.have.been.called();
                    });
            });
        });

        describe('POST /games/:gameId/players/:playerId/message', () => {
            it('should return NO_CONTENT', async () => {
                chai.spy.on(gamePlayController, 'handleNewMessage', () => {});

                return await supertest(expressApp)
                    .post(`/api/games/${DEFAULT_GAME_ID}/players/message`)
                    .send({ idUser: DEFAULT_USER_ID })
                    .expect(StatusCodes.NO_CONTENT);
            });

            it('should return BAD_REQUEST on error', async () => {
                chai.spy.on(gamePlayController, 'handleNewMessage', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.BAD_REQUEST);
                });

                return await supertest(expressApp)
                    .post(`/api/games/${DEFAULT_GAME_ID}/players/message`)
                    .send({ idUser: DEFAULT_USER_ID })
                    .expect(StatusCodes.BAD_REQUEST);
            });

            it('should call handleNewMessage', async () => {
                const handleNewMessageSpy = chai.spy.on(gamePlayController, 'handleNewMessage', () => {});

                return await supertest(expressApp)
                    .post(`/api/games/${DEFAULT_GAME_ID}/players/message`)
                    .send({ idUser: DEFAULT_USER_ID })
                    .then(() => {
                        expect(handleNewMessageSpy).to.have.been.called();
                    });
            });
        });

        describe('POST /games/:gameId/players/:playerId/error', () => {
            it('should return NO_CONTENT', async () => {
                chai.spy.on(gamePlayController, 'handleNewError', () => {});

                return await supertest(expressApp)
                    .post(`/api/games/${DEFAULT_GAME_ID}/players/error`)
                    .send({ idUser: DEFAULT_USER_ID })
                    .expect(StatusCodes.NO_CONTENT);
            });

            it('should return BAD_REQUEST on error', async () => {
                chai.spy.on(gamePlayController, 'handleNewError', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.BAD_REQUEST);
                });

                return await supertest(expressApp)
                    .post(`/api/games/${DEFAULT_GAME_ID}/players/error`)
                    .send({ idUser: DEFAULT_USER_ID })
                    .expect(StatusCodes.BAD_REQUEST);
            });

            it('should call handleNewError', async () => {
                const handleNewErrorSpy = chai.spy.on(gamePlayController, 'handleNewError', () => {});

                return await supertest(expressApp)
                    .post(`/api/games/${DEFAULT_GAME_ID}/players/error`)
                    .send({ idUser: DEFAULT_USER_ID })
                    .then(() => {
                        expect(handleNewErrorSpy).to.have.been.called();
                    });
            });
        });

        describe('handlePlayAction', () => {
            let emitToSocketSpy: any;
            let gameUpdateSpy: any;
            let getGameStub: any;
            let gameStub: SinonStubbedInstance<Game>;
            let tileReserveStub: SinonStubbedInstance<TileReserve>;
            let boardStub: SinonStubbedInstance<Board>;

            beforeEach(() => {
                gameStub = createStubInstance(Game);
                tileReserveStub = createStubInstance(TileReserve);
                boardStub = createStubInstance(Board);

                gameStub.player1 = new Player(DEFAULT_PLAYER_ID, DEFAULT_PLAYER_1.publicUser);
                gameStub.player2 = new Player(DEFAULT_PLAYER_ID + '2', DEFAULT_PLAYER_2.publicUser);
                boardStub.grid = DEFAULT_BOARD.map((row) => row.map((s) => ({ ...s })));
                gameStub['tileReserve'] = tileReserveStub as unknown as TileReserve;
                gameStub.board = boardStub as unknown as Board;
                gameStub['id'] = DEFAULT_GAME_ID;
                gameStub.getPlayer.returns(gameStub.player2);

                emitToSocketSpy = chai.spy.on(gamePlayController['socketService'], 'emitToSocket', () => {});
                gameUpdateSpy = chai.spy.on(gamePlayController, 'gameUpdate', () => ({}));
                getGameStub = testingUnit.getStubbedInstance(ActiveGameService).getGame.returns(gameStub as unknown as Game);
            });

            afterEach(() => {
                getGameStub.restore();
            });

            it('should call playAction', async () => {
                const playActionSpy = chai.spy.on(gamePlayController['gamePlayService'], 'playAction', () => [undefined, undefined]);
                await gamePlayController['handlePlayAction'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_DATA);
                expect(playActionSpy).to.have.been.called();
            });

            it('should call emitToSocket if data.input is not empty', async () => {
                chai.spy.on(gamePlayController['gamePlayService'], 'playAction', () => [undefined, undefined, undefined]);
                await gamePlayController['handlePlayAction'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, {
                    type: ActionType.PASS,
                    payload: {},
                    input: '!passer',
                });
                expect(emitToSocketSpy).to.have.been.called();
            });

            it('should NOT call emitToSocket if data.input is empty', async () => {
                chai.spy.on(gamePlayController['gamePlayService'], 'playAction', () => [undefined, undefined, undefined]);
                await gamePlayController['handlePlayAction'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, {
                    type: ActionType.PASS,
                    payload: {},
                    input: '',
                });
                expect(emitToSocketSpy).to.not.have.been.called();
            });

            it('should call gameUpdate if updateData exists', async () => {
                chai.spy.on(gamePlayController['gamePlayService'], 'playAction', () => [{}, undefined, undefined]);
                await gamePlayController['handlePlayAction'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_DATA);
                expect(gameUpdateSpy).to.have.been.called();
            });

            it("should not call gameUpdate if updateData doesn't exist", async () => {
                chai.spy.on(gamePlayController['gamePlayService'], 'playAction', () => [undefined, undefined, undefined]);
                await gamePlayController['handlePlayAction'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_DATA);
                expect(gameUpdateSpy).to.not.have.been.called();
            });

            it("should not call emitToSocket if feedback doesn't exist", async () => {
                chai.spy.on(gamePlayController['gamePlayService'], 'playAction', () => [{}, undefined, undefined]);
                await gamePlayController['handlePlayAction'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_DATA);
                expect(emitToSocketSpy).to.not.have.been.called();
            });

            it('should call handleFeedback  if feedback exists', async () => {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                chai.spy.on(gamePlayController['gamePlayService'], 'playAction', () => [
                    {},
                    { localPlayerFeedback: DEFAULT_FEEDBACK, opponentFeedback: DEFAULT_FEEDBACK, endGameFeedback: [] },
                ]);
                const handleFeedbackSpy = chai.spy.on(gamePlayController, 'handleFeedback');
                await gamePlayController['handlePlayAction'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_DATA);
                expect(handleFeedbackSpy).to.have.been.called();
            });

            it('should throw if data.type is undefined', async () => {
                await expect(
                    gamePlayController['handlePlayAction'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, { payload: DEFAULT_DATA.payload } as ActionData),
                ).to.eventually.rejected;
            });

            it('should throw if data.payload is undefined', async () => {
                await expect(gamePlayController['handlePlayAction'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, { type: DEFAULT_DATA.type } as ActionData)).to
                    .eventually.rejected;
            });

            it('should call emitToSocket in catch if error is generated in treatment', async () => {
                chai.spy.on(gamePlayController['gamePlayService'], 'playAction', () => {
                    throw new Error(DEFAULT_ERROR_MESSAGE);
                });
                await gamePlayController['handlePlayAction'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_DATA);
                expect(emitToSocketSpy).to.have.been.called.with(DEFAULT_PLAYER_ID, 'newMessage', {
                    content: COMMAND_IS_INVALID(DEFAULT_DATA.input) + DEFAULT_ERROR_MESSAGE,
                    senderId: SYSTEM_ERROR_ID,
                    gameId: DEFAULT_GAME_ID,
                });
            });

            it('should throw Exception again if it was generated by Virtual Player action', async () => {
                chai.spy.on(gamePlayController['gamePlayService'], 'playAction', () => {
                    throw new Error(DEFAULT_ERROR_MESSAGE);
                });
                chai.spy.on(isIdVirtualPlayer, 'isIdVirtualPlayer', () => true);

                await expect(gamePlayController['handlePlayAction'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_DATA)).to.eventually.rejected;
            });

            describe('Word not in dictionnary error', () => {
                let handlePlayActionStub: SinonStub;
                beforeEach(() => {
                    gamePlayServiceStub.playAction.throws('error');

                    const handleErrorStub = stub<GamePlayController, any>(gamePlayController, 'handleError');
                    handleErrorStub.callsFake(async () => Promise.resolve());

                    const isWordNotInDictionaryErrorStub = stub<GamePlayController, any>(gamePlayController, 'isWordNotInDictionaryError');
                    isWordNotInDictionaryErrorStub.onFirstCall().returns(true).returns(false);

                    handlePlayActionStub = stub<GamePlayController, any>(gamePlayController, 'handlePlayAction').callThrough();
                });
                it('should call PASS when playAction throw word not in dictionary', async () => {
                    chai.spy.on(gamePlayController['gamePlayService'], 'isGameOver', () => false);

                    await gamePlayController['handlePlayAction']('', '', { type: ActionType.PLACE, payload: { tiles: [] }, input: '' });

                    expect(handlePlayActionStub.calledWith('', '', { type: ActionType.PASS, payload: {}, input: '' })).to.be.true;
                });

                it('should NOT call PASS if game is OVER', async () => {
                    chai.spy.on(gamePlayController['gamePlayService'], 'isGameOver', () => true);

                    await gamePlayController['handlePlayAction']('', '', { type: ActionType.PLACE, payload: { tiles: [] }, input: '' });

                    expect(handlePlayActionStub.calledWith('', '', { type: ActionType.PASS, payload: {}, input: '' })).to.be.false;
                });
            });
        });

        describe('gameUpdate', () => {
            it('should call emitToRoom with gameId', () => {
                gamePlayController['gameUpdate'](DEFAULT_GAME_ID, {} as GameUpdateData);
                expect(socketServiceStub.emitToRoom.calledWith(DEFAULT_GAME_ID, 'gameUpdate' as '_test_event')).to.be.true;
            });

            it('should call triggerVirtualPlayerTurn if next turn is a virtual player turn', () => {
                (gamePlayController['socketService'] as unknown) = Container.get(SocketService);
                spy.on(gamePlayController['socketService'], 'emitToRoom', () => {
                    return;
                });
                spy.on(gamePlayController['activeGameService'], 'getGame', () => {
                    return;
                });
                const triggerVirtualPlayerSpy = spy.on(gamePlayController['virtualPlayerService'], 'triggerVirtualPlayerTurn', () => {
                    return;
                });
                gamePlayController['gameUpdate'](DEFAULT_GAME_ID, DEFAULT_VIRTUAL_PLAYER_TURN_DATA);
                expect(triggerVirtualPlayerSpy).to.have.been.called();
            });
        });

        describe('handleFeedback', () => {
            let gameStub: SinonStubbedInstance<Game>;
            beforeEach(() => {
                gameStub = createStubInstance(Game);
                gameStub.getPlayer.returns({ id: '' } as unknown as Player);
            });

            it('should emit a new message if there is one to the playerId', () => {
                gamePlayController['handleFeedback'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, {
                    localPlayerFeedback: { message: 'mess', isClickable: true },
                    opponentFeedback: {} as unknown as FeedbackMessage,
                    endGameFeedback: [],
                } as FeedbackMessages);
                expect(socketServiceStub.emitToSocket.calledOnce).to.be.true;
            });

            it('should emit a new message if there is one to the opponent', () => {
                activeGameServiceStub.getGame.returns(gameStub as unknown as Game);
                gamePlayController['handleFeedback'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, {
                    localPlayerFeedback: {} as unknown as FeedbackMessage,
                    opponentFeedback: { message: 'mess', isClickable: true },
                    endGameFeedback: [],
                } as FeedbackMessages);
                expect(socketServiceStub.emitToRoomNoSender.calledOnce).to.be.true;
            });

            it('should emit a new message if there is one for the room', () => {
                gamePlayController['handleFeedback'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, {
                    localPlayerFeedback: {} as unknown as FeedbackMessage,
                    opponentFeedback: {} as unknown as FeedbackMessage,
                    endGameFeedback: [{ message: 'mess', isClickable: true }, { isClickable: true }],
                } as FeedbackMessages);
                expect(socketServiceStub.emitToRoom.calledOnce).to.be.true;
            });
        });

        describe('handleNewMessage', () => {
            let emitToRoomSpy: any;

            beforeEach(() => {
                emitToRoomSpy = chai.spy.on(gamePlayController['socketService'], 'emitToRoom', () => {});
            });

            it('should throw if message.senderId is undefined', () => {
                expect(() => gamePlayController['handleNewMessage'](DEFAULT_GAME_ID, { content: DEFAULT_MESSAGE_CONTENT } as Message)).to.throw(
                    SENDER_REQUIRED,
                );
            });

            it('should throw if message.content is undefined', () => {
                expect(() => gamePlayController['handleNewMessage'](DEFAULT_GAME_ID, { senderId: DEFAULT_PLAYER_ID } as Message)).to.throw(
                    CONTENT_REQUIRED,
                );
            });

            it('should call emitToRoom if message is valid', () => {
                const validMessage: Message = {
                    content: DEFAULT_MESSAGE_CONTENT,
                    senderId: DEFAULT_PLAYER_ID,
                    gameId: DEFAULT_GAME_ID,
                };
                gamePlayController['handleNewMessage'](DEFAULT_GAME_ID, validMessage);
                expect(emitToRoomSpy).to.have.been.called();
            });
        });

        describe('tilePlacement', () => {
            let emitToRoomSpy: any;

            beforeEach(() => {
                emitToRoomSpy = chai.spy.on(gamePlayController['socketService'], 'emitToRoomNoSender', () => {});
            });

            it('should call handleTilePlacement if tilePlacement is valid', () => {
                const validTilePlacement: TilePlacement = {
                    tile: {} as Tile,
                    position: { row: 0, column: 0 },
                };

                gamePlayController['handleTilePlacement'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, [validTilePlacement]);
                expect(emitToRoomSpy).to.have.been.called();
            });
        });

        describe('handleNewError', () => {
            let emitToRoomSpy: any;

            beforeEach(() => {
                emitToRoomSpy = chai.spy.on(gamePlayController['socketService'], 'emitToSocket', () => {});
            });

            it('should throw if message.senderId is undefined', () => {
                expect(() =>
                    gamePlayController['handleNewError'](DEFAULT_PLAYER_ID, DEFAULT_GAME_ID, { content: DEFAULT_MESSAGE_CONTENT } as Message),
                ).to.throw(SENDER_REQUIRED);
            });

            it('should throw if message.content is undefined', () => {
                expect(() =>
                    gamePlayController['handleNewError'](DEFAULT_PLAYER_ID, DEFAULT_GAME_ID, { senderId: DEFAULT_PLAYER_ID } as Message),
                ).to.throw(CONTENT_REQUIRED);
            });

            it('should call emitToRoom if message is valid', () => {
                const validMessage: Message = {
                    content: DEFAULT_MESSAGE_CONTENT,
                    senderId: DEFAULT_PLAYER_ID,
                    gameId: DEFAULT_GAME_ID,
                };
                gamePlayController['handleNewError'](DEFAULT_PLAYER_ID, DEFAULT_GAME_ID, validMessage);
                expect(emitToRoomSpy).to.have.been.called();
            });
        });

        describe('handleError', () => {
            let gameStub: SinonStubbedInstance<Game>;
            let delayStub: SinonStub;

            beforeEach(() => {
                socketServiceStub = createStubInstance(SocketService);
                (gamePlayController['socketService'] as unknown) = socketServiceStub;

                gameStub = createStubInstance(Game);
                gameStub.getPlayer.returns(new Player(DEFAULT_PLAYER_1.id, DEFAULT_PLAYER_1.publicUser));

                activeGameServiceStub = createStubInstance(ActiveGameService);
                activeGameServiceStub.getGame.returns(gameStub as unknown as Game);

                (gamePlayController['activeGameService'] as unknown) = activeGameServiceStub;

                delayStub = stub(Delay, 'for');
            });

            afterEach(() => {
                delayStub.restore();
            });

            it('should call delay', async () => {
                chai.spy.on(gamePlayController['gamePlayService'], 'isGameOver', () => false);
                await gamePlayController['handleError'](new Error(INVALID_WORD('word')), '', '', '');
                expect(delayStub.called).to.be.true;
            });

            it('should NOT call emitToSocket if game is over', async () => {
                spy.on(gamePlayController['gamePlayService'], 'isGameOver', () => true);
                const getGameSpy = spy.on(gamePlayController['activeGameService'], 'getGame');
                await gamePlayController['handleError'](new Error(INVALID_WORD('word')), '', '', '');
                expect(getGameSpy.called).to.be.not.ok;
            });

            it('should call emitToSocket if game is not over', async () => {
                spy.on(gamePlayController['gamePlayService'], 'isGameOver', () => false);
                await gamePlayController['handleError'](new Error(), '', '', '');
                expect(socketServiceStub.emitToSocket.called).to.be.true;
            });
        });
    });
});
