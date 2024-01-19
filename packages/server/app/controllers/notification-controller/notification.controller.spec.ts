/* eslint-disable dot-notation */
import { Application } from '@app/app';
import { NotificationService } from '@app/services/notification-service/notification.service';
import { ServicesTestingUnit } from '@app/services/service-testing-unit/services-testing-unit.spec';
import { UserService } from '@app/services/user-service/user-service';
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

describe('NotificationController', () => {
    let expressApp: Express.Application;
    let testingUnit: ServicesTestingUnit;
    let userService: UserService;

    beforeEach(async () => {
        testingUnit = new ServicesTestingUnit()
            .withStubbedDictionaryService()
            .withMockedAuthentification()
            .withStubbed(NotificationService, {
                initalizeAdminApp: undefined,
                sendNotification: Promise.resolve(' '),
                addMobileUserToken: true,
                toggleNotifications: false,
            });
        await testingUnit.withMockDatabaseService();
    });

    beforeEach(() => {
        expressApp = Container.get(Application).app;
        userService = Container.get(UserService);
    });

    afterEach(() => {
        testingUnit.restore();
    });

    describe('/api/notification', () => {
        describe('POST', () => {
            it('should return notification settings of user', async () => {
                await userService['table'].insert(DEFAULT_USER);
                return supertest(expressApp)
                    .post('/api/notification')
                    .send({ firebaseToken: 'mytoken', idUser: DEFAULT_USER.idUser })
                    .expect(StatusCodes.OK, 'true');
            });

            it('should return 500 if no user param', async () => {
                return supertest(expressApp).post('/api/notification').send({ firebaseToken: 'mytoken' }).expect(StatusCodes.INTERNAL_SERVER_ERROR);
            });
        });
    });

    describe('/api/notification/toggle', () => {
        describe('POST', () => {
            it('should return false', async () => {
                return supertest(expressApp).post('/api/notification/toggle').send({ idUser: DEFAULT_USER.idUser }).expect(StatusCodes.OK, 'false');
            });
        });
    });
});
