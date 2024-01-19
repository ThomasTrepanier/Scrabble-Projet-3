/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable dot-notation */
import { GameConfig } from '@app/classes/game/game-config';
import WaitingRoom from '@app/classes/game/waiting-room';
import Player from '@app/classes/player/player';
import { GROUP_CHANNEL } from '@app/constants/chat';
import { ActiveGameService } from '@app/services/active-game-service/active-game.service';
import { ServicesTestingUnit } from '@app/services/service-testing-unit/services-testing-unit.spec';
import * as chai from 'chai';
import { expect, spy } from 'chai';
import * as spies from 'chai-spies';
import * as sinon from 'sinon';
import { SinonStubbedInstance } from 'sinon';
import { Container } from 'typedi';
import * as uuid from 'uuid';
import { ChatService } from '@app/services/chat-service/chat.service';
import { CreateGameService } from './create-game.service';
import { VirtualPlayerLevel } from '@common/models/virtual-player-level';
import { GameVisibility } from '@common/models/game-visibility';
import { GroupData } from '@common/models/group';

chai.use(spies);

const DEFAULT_PLAYER_ID = 'playerId';
const DEFAULT_USER_ID = 1;

const DEFAULT_MAX_ROUND_TIME = 1;
const USER1 = { username: 'user1', email: 'email1', avatar: 'avatar1' };

const DEFAULT_GAME_CONFIG: GameConfig = {
    player1: new Player(DEFAULT_PLAYER_ID, USER1),
    maxRoundTime: DEFAULT_MAX_ROUND_TIME,
    virtualPlayerLevel: VirtualPlayerLevel.Beginner,
    gameVisibility: GameVisibility.Private,
    password: '',
};

const DEFAULT_GROUP_DATA: GroupData = {
    user1: USER1,
    maxRoundTime: DEFAULT_MAX_ROUND_TIME,
    virtualPlayerLevel: VirtualPlayerLevel.Beginner,
    gameVisibility: GameVisibility.Private,
    password: '',
    numberOfObservers: 0,
};

describe('CreateGameService', () => {
    let createGameService: CreateGameService;
    let activeGameServiceStub: SinonStubbedInstance<ActiveGameService>;
    let testingUnit: ServicesTestingUnit;

    beforeEach(() => {
        testingUnit = new ServicesTestingUnit().withStubbed(ChatService);
        activeGameServiceStub = testingUnit.setStubbed(ActiveGameService);
        activeGameServiceStub.beginGame.resolves();
        createGameService = Container.get(CreateGameService);
        spy.on(uuid, 'v4', () => {
            return '';
        });
    });

    afterEach(() => {
        chai.spy.restore();
        sinon.restore();
        testingUnit.restore();
    });

    describe('createMultiplayerGame', () => {
        let chatServiceStub: SinonStubbedInstance<ChatService>;

        beforeEach(() => {
            spy.on(createGameService, 'generateGameConfig', () => {
                return DEFAULT_GAME_CONFIG;
            });
            chatServiceStub = testingUnit.getStubbedInstance(ChatService);
            chatServiceStub.createChannel.resolves({ ...GROUP_CHANNEL, idChannel: 1, canQuit: true, default: false, private: true });
        });

        it('should return waiting room with config and channel id', async () => {
            const newWaitingRoom = await createGameService.createMultiplayerGame(DEFAULT_GROUP_DATA, DEFAULT_USER_ID, '');
            expect(newWaitingRoom).to.be.an.instanceof(WaitingRoom);
            expect(newWaitingRoom['config']).to.deep.equal(DEFAULT_GAME_CONFIG);
            expect(newWaitingRoom['groupChannelId']).to.equal(1);
        });
    });

    describe('generateGameConfig', () => {
        it('should call generateGameConfig', () => {
            const configSpy = spy.on(createGameService, 'generateGameConfig');
            createGameService.createMultiplayerGame(DEFAULT_GROUP_DATA, DEFAULT_USER_ID, '');
            expect(configSpy).to.have.been.called();
        });
    });
});
