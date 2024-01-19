/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import Player from '@app/classes/player/player';
import { BeginnerVirtualPlayer } from '@app/classes/virtual-player/beginner-virtual-player/beginner-virtual-player';
import { ExpertVirtualPlayer } from '@app/classes/virtual-player/expert-virtual-player/expert-virtual-player';
import { NotificationService } from '@app/services/notification-service/notification.service';
import { ServicesTestingUnit } from '@app/services/service-testing-unit/services-testing-unit.spec';
import { VirtualPlayerLevel } from '@common/models/virtual-player-level';
import * as chai from 'chai';
import * as spies from 'chai-spies';
import { Container } from 'typedi';
import { VirtualPlayerFactory } from './virtual-player-factory';

chai.use(spies);

const PLAYER_1: Player = { publicUser: { username: 'player1' } } as Player;

describe('VirtualPlayerFactory', () => {
    let service: VirtualPlayerFactory;
    let testingUnit: ServicesTestingUnit;

    beforeEach(async () => {
        testingUnit = new ServicesTestingUnit().withStubbed(NotificationService, {
            initalizeAdminApp: undefined,
            sendNotification: Promise.resolve(' '),
        });
        await testingUnit.withMockDatabaseService();
    });

    beforeEach(() => {
        service = Container.get(VirtualPlayerFactory);
    });

    describe('generateVirtualPlayer', () => {
        it('should return a beginner virtual player if the level is beginner', () => {
            const result = service.generateVirtualPlayer('gameId', VirtualPlayerLevel.Beginner, []);
            chai.expect(result).to.be.an.instanceOf(BeginnerVirtualPlayer);
        });

        it('should return an expert virtual player if the level is expert', () => {
            const result = service.generateVirtualPlayer('gameId', VirtualPlayerLevel.Expert, []);
            chai.expect(result).to.be.an.instanceOf(ExpertVirtualPlayer);
        });

        it('virtualPlayer should have a random name not matching any of the players in the game', () => {
            const players: Player[] = [PLAYER_1];
            const result = service.generateVirtualPlayer('gameId', VirtualPlayerLevel.Expert, players);
            chai.expect(players.map((player) => player.publicUser.username)).to.not.include(result.publicUser.username);
        });
    });
});
