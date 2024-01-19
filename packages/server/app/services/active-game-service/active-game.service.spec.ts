/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { DictionarySummary } from '@app/classes/communication/dictionary-data';
import Game from '@app/classes/game/game';
import { ReadyGameConfig } from '@app/classes/game/game-config';
import Player from '@app/classes/player/player';
import { PLAYER_LEFT_GAME } from '@app/constants/controllers-errors';
import { INVALID_PLAYER_ID_FOR_GAME, NO_GAME_FOUND_WITH_ID } from '@app/constants/services-errors';
import { ChatService } from '@app/services/chat-service/chat.service';
import { NotificationService } from '@app/services/notification-service/notification.service';
import { ServicesTestingUnit } from '@app/services/service-testing-unit/services-testing-unit.spec';
import { GameVisibility } from '@common/models/game-visibility';
import { Observer } from '@common/models/observer';
import { VirtualPlayerLevel } from '@common/models/virtual-player-level';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import * as Sinon from 'sinon';
import { SinonStubbedInstance } from 'sinon';
import { Container } from 'typedi';
import { ActiveGameService } from './active-game.service';

const expect = chai.expect;

chai.use(spies);
chai.use(chaiAsPromised);

const USER1 = { username: 'user1', email: 'email1', avatar: 'avatar1' };
const USER2 = { username: 'user2', email: 'email2', avatar: 'avatar2' };
const USER3 = { username: 'user3', email: 'email3', avatar: 'avatar3' };
const USER4 = { username: 'user4', email: 'email4', avatar: 'avatar4' };
const USER5 = { username: 'user5', email: 'email5', avatar: 'avatar5' };

const DEFAULT_PLAYER_1 = new Player('id1', USER1);
const DEFAULT_PLAYER_2 = new Player('id2', USER2);
const DEFAULT_PLAYER_3 = new Player('id3', USER3);
const DEFAULT_PLAYER_4 = new Player('id4', USER4);
const DEFAULT_PLAYER_OBSERVER = new Player('id5', USER5);
const DEFAULT_ID = 'gameId';
const DEFAULT_GAME_CHANNEL_ID = 1;
const DEFAULT_MULTIPLAYER_CONFIG: ReadyGameConfig = {
    player1: DEFAULT_PLAYER_1,
    player2: DEFAULT_PLAYER_2,
    player3: DEFAULT_PLAYER_3,
    player4: DEFAULT_PLAYER_4,
    maxRoundTime: 1,
    gameVisibility: GameVisibility.Private,
    virtualPlayerLevel: VirtualPlayerLevel.Beginner,
    dictionarySummary: {} as unknown as DictionarySummary,
    password: '',
};
const DEFAULT_OBSERVER: Observer = {
    publicUser: USER5,
    id: 'id5',
};
const DEFAULT_GAME = {
    player1: DEFAULT_PLAYER_1,
    player2: DEFAULT_PLAYER_2,
    player3: DEFAULT_PLAYER_3,
    player4: DEFAULT_PLAYER_4,
    id: DEFAULT_ID,
    gameIsOver: false,

    getId: () => DEFAULT_ID,
    getPlayers: () => [DEFAULT_PLAYER_1, DEFAULT_PLAYER_2, DEFAULT_PLAYER_3, DEFAULT_PLAYER_4],
    createStartGameData: () => undefined,
    areGameOverConditionsMet: () => true,
};

describe('ActiveGameService', () => {
    let activeGameService: ActiveGameService;
    let testingUnit: ServicesTestingUnit;

    beforeEach(async () => {
        testingUnit = new ServicesTestingUnit().withStubbed(ChatService).withStubbed(NotificationService, {
            initalizeAdminApp: undefined,
            sendNotification: Promise.resolve(' '),
        });
        await testingUnit.withMockDatabaseService();
    });

    beforeEach(async () => {
        activeGameService = Container.get(ActiveGameService);
    });

    afterEach(async () => {
        chai.spy.restore();
        Sinon.restore();
        testingUnit.restore();
    });

    afterEach(() => {
        chai.spy.restore();
        testingUnit.restore();
    });

    it('should create', () => {
        expect(activeGameService).to.exist;
    });

    it('should instantiate empty activeGame list', () => {
        expect(activeGameService['activeGames']).to.exist;
        expect(activeGameService['activeGames']).to.be.empty;
    });

    describe('beginGame', () => {
        let spy: unknown;

        beforeEach(() => {
            spy = chai.spy.on(Game, 'createGame', async () => Promise.resolve(DEFAULT_GAME));
            chai.spy.on(activeGameService, 'setPlayerElo', async () => Promise.resolve(true));
        });

        afterEach(() => {
            chai.spy.restore(Game);
        });

        it('should add a game to activeGame list', async () => {
            expect(activeGameService['activeGames']).to.be.empty;
            await activeGameService.beginGame(DEFAULT_ID, DEFAULT_GAME_CHANNEL_ID, DEFAULT_MULTIPLAYER_CONFIG, []);
            expect(activeGameService['activeGames']).to.have.lengthOf(1);
        });

        it('should call Game.createGame', async () => {
            await activeGameService.beginGame(DEFAULT_ID, DEFAULT_GAME_CHANNEL_ID, DEFAULT_MULTIPLAYER_CONFIG, []);
            expect(spy).to.have.been.called();
        });
    });

    describe('getGame', () => {
        beforeEach(async () => {
            chai.spy.on(Game, 'createMultiplayerGame', async () => Promise.resolve(DEFAULT_GAME));
            await activeGameService.beginGame(DEFAULT_ID, DEFAULT_GAME_CHANNEL_ID, DEFAULT_MULTIPLAYER_CONFIG, [DEFAULT_OBSERVER]);
        });

        afterEach(() => {
            chai.spy.restore(Game);
        });

        it('should return game with player1 ID', () => {
            expect(activeGameService.getGame(DEFAULT_ID, DEFAULT_PLAYER_1.id)).to.exist;
        });

        it('should return game with player2 ID', () => {
            expect(activeGameService.getGame(DEFAULT_ID, DEFAULT_PLAYER_2.id)).to.exist;
        });

        it('should throw is ID is invalid', () => {
            const invalidId = 'invalidId';
            expect(() => activeGameService.getGame(invalidId, DEFAULT_PLAYER_1.id)).to.throw(NO_GAME_FOUND_WITH_ID);
        });

        it('should throw is player ID is invalid', () => {
            const invalidId = 'invalidId';
            expect(() => activeGameService.getGame(DEFAULT_ID, invalidId)).to.throw(INVALID_PLAYER_ID_FOR_GAME);
        });
    });

    describe('removeGame', () => {
        beforeEach(async () => {
            chai.spy.on(Game, 'createMultiplayerGame', async () => Promise.resolve(DEFAULT_GAME));
            await activeGameService.beginGame(DEFAULT_ID, DEFAULT_GAME_CHANNEL_ID, DEFAULT_MULTIPLAYER_CONFIG, []);
        });

        afterEach(() => {
            chai.spy.restore(Game);
        });

        it('should remove from list with player1 ID', () => {
            expect(activeGameService['activeGames']).to.have.lengthOf(1);
            activeGameService.removeGame(DEFAULT_ID, DEFAULT_PLAYER_1.id);
            expect(activeGameService['activeGames']).to.be.empty;
        });

        it('should remove from list with player2 ID', () => {
            expect(activeGameService['activeGames']).to.have.lengthOf(1);
            activeGameService.removeGame(DEFAULT_ID, DEFAULT_PLAYER_2.id);
            expect(activeGameService['activeGames']).to.be.empty;
        });

        it('should throw and return undefined ', () => {
            chai.spy.on(activeGameService, 'getGame', () => {
                throw new Error();
            });
            activeGameService.removeGame(DEFAULT_ID, DEFAULT_PLAYER_2.id);
            const spy = chai.spy.on(activeGameService['activeGames'], 'indexOf');
            expect(spy).not.to.have.been.called();
        });
    });

    it('isGameOver should return if the game with the game id provided is over', () => {
        chai.spy.on(activeGameService, 'getGame', () => DEFAULT_GAME);
        expect(activeGameService.isGameOver(DEFAULT_ID, DEFAULT_PLAYER_1.id)).to.be.equal(DEFAULT_GAME.gameIsOver);
    });

    describe('handlePlayerLeaves', () => {
        let gameStub: SinonStubbedInstance<Game>;
        let emitToSocketSpy: unknown;
        let emitToRoomSpy: unknown;
        let removeFromRoomSpy: unknown;
        let isGameOverSpy: unknown;
        let playerLeftEventSpy: unknown;
        let chatServiceStub: SinonStubbedInstance<ChatService>;

        beforeEach(() => {
            gameStub = Sinon.createStubInstance(Game);
            gameStub.getPlayer.returns(DEFAULT_PLAYER_1);
            Sinon.stub(activeGameService, 'getGame').returns(gameStub as unknown as Game);
            emitToSocketSpy = chai.spy.on(activeGameService['socketService'], 'emitToSocket', () => {});
            emitToRoomSpy = chai.spy.on(activeGameService['socketService'], 'emitToRoom', () => {});
            removeFromRoomSpy = chai.spy.on(activeGameService['socketService'], 'removeFromRoom', () => {});
            chai.spy.on(activeGameService, 'removeGame', () => {});
            chatServiceStub = testingUnit.getStubbedInstance(ChatService);
            chatServiceStub.quitChannel.callsFake(async () => {});
        });

        it("should disconnect user from group's channel", async () => {
            gameStub.getGroupChannelId.returns(DEFAULT_GAME_CHANNEL_ID);

            await activeGameService['handlePlayerLeaves'](DEFAULT_ID, DEFAULT_PLAYER_1.id);
            expect(chatServiceStub.quitChannel.calledWith(gameStub.getGroupChannelId(), DEFAULT_PLAYER_1.id)).to.be.true;
        });

        it('should remove player who leaves from socket room', async () => {
            chai.spy.on(activeGameService['socketService'], 'doesRoomExist', () => true);

            await activeGameService['handlePlayerLeaves'](DEFAULT_ID, DEFAULT_PLAYER_1.id);
            expect(removeFromRoomSpy).to.have.been.called();
        });

        it('should emit cleanup event to socket', async () => {
            chai.spy.on(activeGameService['socketService'], 'doesRoomExist', () => true);
            await activeGameService['handlePlayerLeaves'](DEFAULT_ID, DEFAULT_PLAYER_1.id);
            expect(emitToSocketSpy).to.have.been.called();
        });

        it('should not emit player left event if the game is over', async () => {
            chai.spy.on(activeGameService['socketService'], 'doesRoomExist', () => true);
            isGameOverSpy = chai.spy.on(activeGameService, 'isGameOver', () => true);
            playerLeftEventSpy = chai.spy.on(activeGameService.playerLeftEvent, 'emit', () => {});

            await activeGameService['handlePlayerLeaves'](DEFAULT_ID, DEFAULT_PLAYER_1.id);
            expect(isGameOverSpy).to.have.been.called();
            expect(playerLeftEventSpy).to.not.have.been.called();
        });

        it('should emit player left event if the game is still ongoing', async () => {
            chai.spy.on(activeGameService['socketService'], 'doesRoomExist', () => true);
            isGameOverSpy = chai.spy.on(activeGameService, 'isGameOver', () => false);
            playerLeftEventSpy = chai.spy.on(activeGameService.playerLeftEvent, 'emit', () => {});

            await activeGameService['handlePlayerLeaves'](DEFAULT_ID, DEFAULT_PLAYER_1.id);
            expect(playerLeftEventSpy).to.have.been.called.with('playerLeftGame', DEFAULT_ID, DEFAULT_PLAYER_1.id);
        });

        it('should send message explaining the user left with new VP message if game is NOT over', async () => {
            chai.spy.on(activeGameService['socketService'], 'doesRoomExist', () => true);
            isGameOverSpy = chai.spy.on(activeGameService, 'isGameOver', () => false);
            playerLeftEventSpy = chai.spy.on(activeGameService.playerLeftEvent, 'emit', () => {});

            await activeGameService['handlePlayerLeaves'](DEFAULT_ID, DEFAULT_PLAYER_1.id);
            const expectedArg = {
                content: `${DEFAULT_PLAYER_1.publicUser.username} ${PLAYER_LEFT_GAME(false)}`,
                senderId: 'system',
                gameId: DEFAULT_ID,
            };
            expect(emitToRoomSpy).to.have.been.called.with(DEFAULT_ID, 'newMessage', expectedArg);
        });

        it('should send message explaining the user left without VP message if game IS over', async () => {
            chai.spy.on(activeGameService['socketService'], 'doesRoomExist', () => true);
            isGameOverSpy = chai.spy.on(activeGameService, 'isGameOver', () => true);
            playerLeftEventSpy = chai.spy.on(activeGameService.playerLeftEvent, 'emit', () => {});

            await activeGameService['handlePlayerLeaves'](DEFAULT_ID, DEFAULT_PLAYER_1.id);
            const expectedArg = {
                content: `${DEFAULT_PLAYER_1.publicUser.username} ${PLAYER_LEFT_GAME(true)}`,
                senderId: 'system',
                gameId: DEFAULT_ID,
            };
            expect(emitToRoomSpy).to.have.been.called.with(DEFAULT_ID, 'newMessage', expectedArg);
        });
        it('should call replace player', async () => {
            gameStub.observers = [DEFAULT_OBSERVER];
            gameStub.player1 = DEFAULT_PLAYER_1;
            gameStub.getPlayerByNumber.returns(DEFAULT_PLAYER_2);

            const observerToPlayerSpy = chai.spy.on(activeGameService, 'observerToPlayer', () => {
                DEFAULT_PLAYER_OBSERVER;
            });

            gameStub.replacePlayer.returns({});
            const setEloSpy = chai.spy.on(activeGameService, 'setPlayerElo', () => {});
            await activeGameService['handleReplaceVirtualPlayer'](DEFAULT_ID, DEFAULT_PLAYER_1.id, 3);
            expect(observerToPlayerSpy).to.have.been.called;
            expect(setEloSpy).to.have.been.called;
        });
    });
});
