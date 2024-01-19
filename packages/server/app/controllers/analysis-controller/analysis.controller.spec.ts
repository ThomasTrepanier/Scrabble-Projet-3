/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-unused-expressions */
/* eslint-disable dot-notation */
import { Application } from '@app/app';
import { HttpException } from '@app/classes/http-exception/http-exception';
import { AnalysisPersistenceService } from '@app/services/analysis-persistence-service/analysis-persistence.service';
import { NotificationService } from '@app/services/notification-service/notification.service';
import { ServicesTestingUnit } from '@app/services/service-testing-unit/services-testing-unit.spec';
import { AnalysisRequestInfoType } from '@common/models/analysis';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import { StatusCodes } from 'http-status-codes';
import { SinonStubbedInstance } from 'sinon';
import * as supertest from 'supertest';
import { Container } from 'typedi';
import { AnalysisController } from './analysis.controller';

const expect = chai.expect;
chai.use(spies);
chai.use(chaiAsPromised);

const DEFAULT_EXCEPTION = 'exception';
const DEFAULT_GAME_ID = 'defaultgameid';

describe('AnalysisController', () => {
    let controller: AnalysisController;
    let analysisPersistenceServiceStub: SinonStubbedInstance<AnalysisPersistenceService>;
    let testingUnit: ServicesTestingUnit;

    beforeEach(async () => {
        testingUnit = new ServicesTestingUnit().withMockedAuthentification().withStubbed(NotificationService, {
            initalizeAdminApp: undefined,
            sendNotification: Promise.resolve(' '),
        });
        await testingUnit.withMockDatabaseService();
        testingUnit.withStubbedDictionaryService().withStubbedControllers(AnalysisController);
        analysisPersistenceServiceStub = testingUnit.setStubbed(AnalysisPersistenceService);
    });

    beforeEach(() => {
        controller = Container.get(AnalysisController);
    });

    afterEach(() => {
        testingUnit.restore();
    });

    it('controller should create', () => {
        expect(controller).to.exist;
    });

    describe('configureRouter', () => {
        let expressApp: Express.Application;

        beforeEach(() => {
            const app = Container.get(Application);
            expressApp = app.app;
        });

        describe('GET /analysis/:gameId', () => {
            it('should return NO_CONTENT', async () => {
                chai.spy.on(controller, 'handleRequestAnalysis', () => {
                    return;
                });

                return supertest(expressApp).get(`/api/analysis/${DEFAULT_GAME_ID}`).expect(StatusCodes.OK);
            });

            it('should return INTERNAL_SERVER_ERROR on throw httpException', async () => {
                chai.spy.on(controller, 'handleRequestAnalysis', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.INTERNAL_SERVER_ERROR);
                });

                return supertest(expressApp).get(`/api/analysis/${DEFAULT_GAME_ID}`).expect(StatusCodes.INTERNAL_SERVER_ERROR);
            });
        });
    });

    describe('handleRequestAnalysis', () => {
        it('should call gameHistoriesService.requestAnalysis', async () => {
            analysisPersistenceServiceStub.requestAnalysis.resolves();
            await controller['handleRequestAnalysis'](1, 1, AnalysisRequestInfoType.ID_GAME);
            expect(analysisPersistenceServiceStub.requestAnalysis.called).to.be.true;
        });
    });
});
