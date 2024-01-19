/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-unused-expressions */
import { Application } from '@app/app';
import { ConnectedUser } from '@app/classes/user/connected-user';
import { CHANNEL_TABLE, CHAT_HISTORY_TABLE, USER_TABLE } from '@app/constants/services-constants/database-const';
import { AuthentificationService } from '@app/services/authentification-service/authentification.service';
import DatabaseService from '@app/services/database-service/database.service';
import { ServicesTestingUnit } from '@app/services/service-testing-unit/services-testing-unit.spec';
import { Channel } from '@common/models/chat/channel';
import { ChatHistoryMessage, ChatMessage } from '@common/models/chat/chat-message';
import { PublicUser, User } from '@common/models/user';
import { expect } from 'chai';
import { Knex } from 'knex';
import * as Sinon from 'sinon';
import { Container } from 'typedi';
import { ChatHistoryService } from './chat-history.service';

const USER: User = {
    idUser: 1,
    email: 'bob@example.com',
    username: 'Bob',
    password: '',
    avatar: '',
};

const PUBLIC_USER: PublicUser = {
    email: USER.email,
    username: USER.username,
    avatar: '',
};

const testChannel: Channel = {
    idChannel: 0,
    name: 'test',
    canQuit: true,
    private: false,
    default: false,
};
const expectedMessage: ChatMessage = {
    sender: PUBLIC_USER,
    content: 'message cool',
    date: new Date(),
};

const message = {
    idChannel: testChannel.idChannel,
    message: expectedMessage,
};

describe('ChatHistoryService', () => {
    afterEach(() => {
        Sinon.restore();
    });

    let service: ChatHistoryService;
    let testingUnit: ServicesTestingUnit;
    let databaseService: DatabaseService;
    let chatHistoryTable: () => Knex.QueryBuilder<ChatHistoryMessage>;
    let userTable: () => Knex.QueryBuilder<User>;
    let channelTable: () => Knex.QueryBuilder<Channel>;

    beforeEach(async () => {
        testingUnit = new ServicesTestingUnit()
            .withStubbedPrototypes(Application, { bindRoutes: undefined })
            .withStubbed(AuthentificationService, undefined, { connectedUsers: new ConnectedUser() });
        await testingUnit.withMockDatabaseService();
        databaseService = Container.get(DatabaseService);
        userTable = () => databaseService.knex<User>(USER_TABLE);
        chatHistoryTable = () => databaseService.knex<ChatHistoryMessage>(CHAT_HISTORY_TABLE);
        channelTable = () => databaseService.knex<Channel>(CHANNEL_TABLE);
    });

    beforeEach(() => {
        service = Container.get(ChatHistoryService);
    });

    afterEach(() => {
        testingUnit.restore();
    });

    it('should create', () => {
        expect(service).to.exist;
    });

    describe('saveMessage', () => {
        it('should save a message in the database', async () => {
            await userTable().insert(USER);
            await channelTable().insert(testChannel);

            await service.saveMessage(message);

            const savedMessage = await chatHistoryTable().select('*').where('idChannel', testChannel.idChannel);
            expect(savedMessage).to.have.lengthOf(1);
            expect(savedMessage[0]).to.deep.include({
                idChannel: testChannel.idChannel,
                content: expectedMessage.content,
            });
        });
    });

    describe('getChannelHistory', () => {
        it('should return the history of a channel', async () => {
            await userTable().insert(USER);
            await channelTable().insert(testChannel);

            await service.saveMessage(message);

            const channelHistory = await service.getChannelHistory(testChannel.idChannel);
            expect(channelHistory).to.have.lengthOf(1);
            expect(channelHistory[0]).to.deep.include({
                idChannel: testChannel.idChannel,
                message: expectedMessage,
            });
        });

        describe('deleteChannelHistory', () => {
            it('should delete the history of a channel', async () => {
                await userTable().insert(USER);
                await channelTable().insert(testChannel);

                await service.saveMessage(message);

                await service.deleteChannelHistory(testChannel.idChannel);

                const channelHistory = await service.getChannelHistory(testChannel.idChannel);
                expect(channelHistory).to.have.lengthOf(0);
            });
        });
    });
});
