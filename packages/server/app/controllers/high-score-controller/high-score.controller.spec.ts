// /* eslint-disable no-unused-expressions */
// /* eslint-disable @typescript-eslint/no-unused-expressions */
// /* eslint-disable @typescript-eslint/no-empty-function */
// /* eslint-disable dot-notation */
// import { Application } from '@app/app';
// import { HttpException } from '@app/classes/http-exception/http-exception';
// import HighScoresService from '@app/services/high-score-service/high-score.service';
// import { ServicesTestingUnit } from '@app/services/service-testing-unit/services-testing-unit.spec';
// import { SocketService } from '@app/services/socket-service/socket.service';
// import * as chai from 'chai';
// import * as chaiAsPromised from 'chai-as-promised';
// import * as spies from 'chai-spies';
// import { StatusCodes } from 'http-status-codes';
// import { afterEach } from 'mocha';
// import { SinonStubbedInstance } from 'sinon';
// import * as supertest from 'supertest';
// import { Container } from 'typedi';
// import { HighScoresController } from '..';

// const expect = chai.expect;

// chai.use(spies);
// chai.use(chaiAsPromised);

// const DEFAULT_PLAYER_ID = 'playerId';

// const DEFAULT_EXCEPTION = 'exception';

// describe('HighScoresController', () => {
//     let controller: HighScoresController;
//     let testingUnit: ServicesTestingUnit;
//     let socketServiceStub: SinonStubbedInstance<SocketService>;
//     let highScoreServicesStub: SinonStubbedInstance<HighScoresService>;

//     beforeEach(async () => {
//         testingUnit = new ServicesTestingUnit().withMockedAuthentification();
//         await testingUnit.withMockDatabaseService();
//         testingUnit.withStubbedDictionaryService().withStubbedControllers(HighScoresController);
//         socketServiceStub = testingUnit.setStubbed(SocketService);
//         highScoreServicesStub = testingUnit.setStubbed(HighScoresService);
//     });

//     beforeEach(() => {
//         controller = Container.get(HighScoresController);
//     });

//     afterEach(() => {
//         testingUnit.restore();
//     });

//     it('should create', () => {
//         expect(controller).to.exist;
//     });

//     describe('configureRouter', () => {
//         let expressApp: Express.Application;

//         beforeEach(() => {
//             const app = Container.get(Application);
//             expressApp = app.app;
//         });

//         describe('GET /highScores/:playerId', () => {
//             it('should return NO_CONTENT', async () => {
//                 chai.spy.on(controller, 'handleHighScoresRequest', () => {});

//                 return await supertest(expressApp).get(`/api/highScores/${DEFAULT_PLAYER_ID}`).expect(StatusCodes.NO_CONTENT);
//             });

//             it('should return INTERNAL_SERVER_ERROR on throw httpException', async () => {
//                 chai.spy.on(controller, 'handleHighScoresRequest', () => {
//                     throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.INTERNAL_SERVER_ERROR);
//                 });

//                 return await supertest(expressApp).get(`/api/highScores/${DEFAULT_PLAYER_ID}`).expect(StatusCodes.INTERNAL_SERVER_ERROR);
//             });
//         });

//         describe('DELETE /highScores', () => {
//             it('should return NO_CONTENT', async () => {
//                 return supertest(expressApp)
//                     .delete('/api/highScores')
//                     .expect(StatusCodes.NO_CONTENT)
//                     .then(() => expect(highScoreServicesStub.resetHighScores.called).to.be.true);
//             });

//             it('should return INTERNAL_SERVER_ERROR on throw httpException', async () => {
//                 highScoreServicesStub.resetHighScores.callsFake(() => {
//                     throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.INTERNAL_SERVER_ERROR);
//                 });

//                 return supertest(expressApp).delete('/api/highScores').expect(StatusCodes.INTERNAL_SERVER_ERROR);
//             });
//         });
//     });

//     describe('handleHighScoresRequest', () => {
//         it('should call socketService.emitToSocket', async () => {
//             await controller['handleHighScoresRequest'](DEFAULT_PLAYER_ID);
//             expect(socketServiceStub.emitToSocket.called).to.be.true;
//             expect(highScoreServicesStub.getAllHighScore.called).to.be.true;
//         });
//     });
// });
