/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { ActionPass } from '@app/classes/actions';
import { ActionData } from '@app/classes/communication/action-data';
import { GameUpdateData } from '@app/classes/communication/game-update-data';
import Game from '@app/classes/game/game';
import { GameConfig, StartGameData } from '@app/classes/game/game-config';
import Player from '@app/classes/player/player';
import { Square } from '@app/classes/square';
import { AbstractVirtualPlayer } from '@app/classes/virtual-player/abstract-virtual-player/abstract-virtual-player';
import { BeginnerVirtualPlayer } from '@app/classes/virtual-player/beginner-virtual-player/beginner-virtual-player';
import { GAME_SHOULD_CONTAIN_ROUND } from '@app/constants/virtual-player-constants';
import { GameVisibility } from '@common/models/game-visibility';
import { VirtualPlayerLevel } from '@common/models/virtual-player-level';
import * as chai from 'chai';
import { expect } from 'chai';
import * as spies from 'chai-spies';
import { StatusCodes } from 'http-status-codes';
import * as mockttp from 'mockttp';
import { createStubInstance } from 'sinon';
import { VirtualPlayerService } from './virtual-player.service';
import { ActionType } from '@common/models/action';

chai.use(spies);
const DEFAULT_PLAYER1_NAME = 'p1';
const DEFAULT_PLAYER1_ID = 'id1';
const USER1 = { username: 'user1', email: 'email1', avatar: 'avatar1' };
const USER2 = { username: 'user2', email: 'email2', avatar: 'avatar2' };
const USER3 = { username: 'user3', email: 'email3', avatar: 'avatar3' };
const USER4 = { username: 'user4', email: 'email4', avatar: 'avatar4' };
const DEFAULT_PLAYER_1 = new Player(DEFAULT_PLAYER1_NAME, USER1);
const DEFAULT_PLAYER_2 = new Player('2', USER2);
const DEFAULT_PLAYER_3 = new Player('3', USER3);
const DEFAULT_PLAYER_4 = new Player('4', USER4);
const DEFAULT_GAME_ID = 'grossePartie';
const DEFAULT_MAX_ROUND_TIME = 1;

const DEFAULT_GAME_CONFIG: GameConfig = {
    player1: new Player(DEFAULT_PLAYER1_ID, USER1),
    maxRoundTime: DEFAULT_MAX_ROUND_TIME,
    virtualPlayerLevel: VirtualPlayerLevel.Beginner,
    gameVisibility: GameVisibility.Private,
    password: '',
};

const DEFAULT_STARTING_GAME_DATA: StartGameData = {
    ...DEFAULT_GAME_CONFIG,
    gameId: DEFAULT_GAME_ID,
    board: undefined as unknown as Square[][],
    tileReserve: [],
    player1: DEFAULT_GAME_CONFIG.player1.convertToPlayerData(),
    player2: DEFAULT_PLAYER_2.convertToPlayerData(),
    player3: DEFAULT_PLAYER_3.convertToPlayerData(),
    player4: DEFAULT_PLAYER_4.convertToPlayerData(),
    round: { playerData: { id: DEFAULT_PLAYER1_ID }, startTime: new Date(), limitTime: new Date() },
};

const DEFAULT_GAME = {
    player1: DEFAULT_PLAYER_1,
    player2: DEFAULT_PLAYER_2,
    id: DEFAULT_GAME_ID,

    getPlayer: () => {
        return new BeginnerVirtualPlayer(DEFAULT_GAME_ID, DEFAULT_PLAYER1_NAME);
    },
};

const DEFAULT_GAME_UPDATE_DATA: GameUpdateData = {
    player1: DEFAULT_PLAYER_1.convertToPlayerData(),
    player2: DEFAULT_PLAYER_2.convertToPlayerData(),
    isGameOver: false,
};

const PORT_NUMBER = 14111;

describe('VirtualPlayerService', () => {
    let virtualPlayerService: VirtualPlayerService;
    let mockServer: mockttp.Mockttp;

    beforeEach(() => {
        virtualPlayerService = new VirtualPlayerService();
    });

    describe('sendAction', () => {
        const TEST_GAME_ID = 'coocookachoo';
        const TEST_PLAYER_ID = 'IAmTheWalrus';
        let TEST_ACTION: ActionData;
        beforeEach(async () => {
            mockServer = mockttp.getLocal();
            await mockServer.start(PORT_NUMBER);
        });

        afterEach(() => {
            mockServer.stop();
        });

        it('should call fetch', async () => {
            TEST_ACTION = { type: ActionType.PLACE, input: '', payload: {} };
            const endpoint = `/api/games/${TEST_GAME_ID}/players/virtual-player-action`;
            chai.spy.on(virtualPlayerService, 'getEndpoint', () => mockServer.url);
            await mockServer.forPost(endpoint).thenReply(StatusCodes.NO_CONTENT);
            const response = await virtualPlayerService.sendAction(TEST_GAME_ID, TEST_PLAYER_ID, TEST_ACTION);
            expect(response.status).to.equal(StatusCodes.NO_CONTENT);
        });

        it('should call fetch, get an error then fetch with an Action Pass', async () => {
            TEST_ACTION = { type: ActionType.PLACE, input: '', payload: {} };
            const endpoint = `/api/games/${TEST_GAME_ID}/players/virtual-player-action`;
            chai.spy.on(virtualPlayerService, 'getEndpoint', () => mockServer.url);
            await mockServer.forPost(endpoint).once().thenReply(StatusCodes.BAD_REQUEST);
            const sendActionSpy = chai.spy.on(ActionPass, 'createActionData');
            await virtualPlayerService.sendAction(TEST_GAME_ID, TEST_PLAYER_ID, TEST_ACTION);
            expect(sendActionSpy).to.have.been.called();
            mockServer.stop();
        });
    });

    describe('triggerVirtualPlayerTurn', () => {
        it('should throw when game contains no round', () => {
            expect(() => virtualPlayerService.triggerVirtualPlayerTurn(DEFAULT_GAME_UPDATE_DATA, DEFAULT_GAME as unknown as Game)).to.throw(
                GAME_SHOULD_CONTAIN_ROUND,
            );
        });

        it('should call game.getplayer', () => {
            const playerStub = createStubInstance(AbstractVirtualPlayer);
            playerStub.playTurn.resolves();
            const getPlayerSpy = chai.spy.on(DEFAULT_GAME, 'getPlayer', () => {
                return playerStub;
            });
            virtualPlayerService.triggerVirtualPlayerTurn(DEFAULT_STARTING_GAME_DATA, DEFAULT_GAME as unknown as Game);
            expect(getPlayerSpy).to.have.been.called();
        });
    });
});
