import { Application } from '@app/app';
import DatabaseService from '@app/services/database-service/database.service';
import { NotificationService } from '@app/services/notification-service/notification.service';
import { ServicesTestingUnit } from '@app/services/service-testing-unit/services-testing-unit.spec';
import { StatusCodes } from 'http-status-codes';
import { SinonStubbedInstance } from 'sinon';
import * as supertest from 'supertest';
import { Container } from 'typedi';
import { DatabaseController } from './database.controller';

describe('DatabaseController', () => {
    let expressApp: Express.Application;
    let databaseServiceStub: SinonStubbedInstance<DatabaseService>;
    let testingUnit: ServicesTestingUnit;

    beforeEach(() => {
        testingUnit = new ServicesTestingUnit()
            .withStubbedDictionaryService()
            .withStubbedControllers(DatabaseController)
            .withStubbed(NotificationService, {
                initalizeAdminApp: undefined,
                sendNotification: Promise.resolve(' '),
            });
        databaseServiceStub = testingUnit.setStubbed(DatabaseService);
    });

    beforeEach(() => {
        expressApp = Container.get(Application).app;
    });

    afterEach(() => {
        testingUnit.restore();
    });

    describe('/api/database/is-connected', () => {
        it('should send NO_CONTENT', async () => {
            databaseServiceStub.pingDb.resolves();
            return supertest(expressApp).get('/api/database/is-connected').expect(StatusCodes.NO_CONTENT);
        });

        it('should send INTERNAL_SERVER_ERROR if error', async () => {
            databaseServiceStub.pingDb.rejects();
            return supertest(expressApp).get('/api/database/is-connected').expect(StatusCodes.INTERNAL_SERVER_ERROR);
        });
    });
});
