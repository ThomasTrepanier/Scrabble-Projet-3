/* eslint-disable dot-notation */
import { Application } from '@app/app';
import { NotificationService } from '@app/services/notification-service/notification.service';
import { ServerActionService } from '@app/services/server-action-service/server-action.service';
import { ServicesTestingUnit } from '@app/services/service-testing-unit/services-testing-unit.spec';
import { UserService } from '@app/services/user-service/user-service';
import { ServerActionCreation, ServerActionType } from '@common/models/server-action';
import { User } from '@common/models/user';
import { StatusCodes } from 'http-status-codes';
import * as supertest from 'supertest';
import { Container } from 'typedi';

const DEFAULT_USER: User = {
    idUser: 1,
    avatar: 'the-way-of-the-water',
    email: 'me@me.com',
    password: '123',
    username: 'username',
};

describe('ServerActionController', () => {
    let expressApp: Express.Application;
    let userService: UserService;
    let serverActionService: ServerActionService;
    let testingUnit: ServicesTestingUnit;

    beforeEach(async () => {
        testingUnit = new ServicesTestingUnit()
            .withStubbedDictionaryService()
            .withMockedAuthentification()
            .withStubbed(NotificationService, {
                initalizeAdminApp: undefined,
                sendNotification: Promise.resolve(' '),
            });
        await testingUnit.withMockDatabaseService();
    });

    beforeEach(() => {
        expressApp = Container.get(Application).app;
        userService = Container.get(UserService);
        serverActionService = Container.get(ServerActionService);
    });

    afterEach(() => {
        testingUnit.restore();
    });

    describe('/api/server-actions', () => {
        describe('GET', () => {
            it('should return user actions', async () => {
                await userService['table'].insert(DEFAULT_USER);
                await serverActionService.addAction({
                    idUser: DEFAULT_USER.idUser,
                    actionType: ServerActionType.LOGIN,
                    timestamp: new Date(0),
                } as ServerActionCreation);
                await serverActionService.addAction({
                    idUser: DEFAULT_USER.idUser,
                    actionType: ServerActionType.LOGOUT,
                    timestamp: new Date(0),
                } as ServerActionCreation);

                return supertest(expressApp).get('/api/server-actions').send({ idUser: DEFAULT_USER.idUser }).expect(StatusCodes.OK);
            });
        });
    });
});
