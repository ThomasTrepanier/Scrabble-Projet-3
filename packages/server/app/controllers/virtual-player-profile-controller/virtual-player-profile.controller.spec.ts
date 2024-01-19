// /* eslint-disable @typescript-eslint/no-empty-function */
// /* eslint-disable dot-notation */
// import { Application } from '@app/app';
// import { HttpException } from '@app/classes/http-exception/http-exception';
// import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';
// import { ServicesTestingUnit } from '@app/services/service-testing-unit/services-testing-unit.spec';
// import VirtualPlayerProfilesService from '@app/services/virtual-player-profile-service/virtual-player-profile.service';
// import { VirtualPlayer } from '@common/models/virtual-player';
// import * as chai from 'chai';
// import * as chaiAsPromised from 'chai-as-promised';
// import * as spies from 'chai-spies';
// import { StatusCodes } from 'http-status-codes';
// import { afterEach } from 'mocha';
// import * as sinon from 'sinon';
// import { SinonStubbedInstance } from 'sinon';
// import * as supertest from 'supertest';
// import { Container } from 'typedi';
// import { VirtualPlayerProfilesController } from './virtual-player-profile.controller';

// const expect = chai.expect;

// chai.use(spies);
// chai.use(chaiAsPromised);

// const DEFAULT_EXCEPTION = 'exception';
// const DEFAULT_PLAYER_ID_1 = 1;
// const DEFAULT_PLAYER_ID_2 = 2;

// const DEFAULT_PROFILE_1: VirtualPlayer = {
//     name: 'Brun',
//     level: VirtualPlayerLevel.Beginner,
//     isDefault: true,
//     idVirtualPlayer: DEFAULT_PLAYER_ID_1,
// };

// const DEFAULT_PROFILE_2: VirtualPlayer = {
//     name: 'Vert',
//     level: VirtualPlayerLevel.Expert,
//     isDefault: true,
//     idVirtualPlayer: DEFAULT_PLAYER_ID_2,
// };

// const CUSTOM_PROFILE_1: VirtualPlayer = {
//     name: 'Rouge',
//     level: VirtualPlayerLevel.Beginner,
//     isDefault: false,
//     idVirtualPlayer: DEFAULT_PLAYER_ID_1,
// };

// const CUSTOM_PROFILE_2: VirtualPlayer = {
//     name: 'Turquoise',
//     level: VirtualPlayerLevel.Expert,
//     isDefault: false,
//     idVirtualPlayer: DEFAULT_PLAYER_ID_2,
// };

// const DEFAULT_PROFILES: VirtualPlayer[] = [DEFAULT_PROFILE_1, DEFAULT_PROFILE_2];
// const CUSTOM_PROFILES: VirtualPlayer[] = [CUSTOM_PROFILE_1, CUSTOM_PROFILE_2];
// const ALL_PROFILES: VirtualPlayer[] = DEFAULT_PROFILES.concat(CUSTOM_PROFILES);

// describe('VirtualPlayerProfilesController', () => {
//     let controller: VirtualPlayerProfilesController;
//     let testingUnit: ServicesTestingUnit;
//     let virtualPlayerProfileServiceStub: SinonStubbedInstance<VirtualPlayerProfilesService>;

//     beforeEach(async () => {
//         testingUnit = new ServicesTestingUnit().withMockedAuthentification();
//         await testingUnit.withMockDatabaseService();
//         testingUnit.withStubbedDictionaryService().withStubbedControllers(VirtualPlayerProfilesController);
//         virtualPlayerProfileServiceStub = testingUnit.setStubbed(VirtualPlayerProfilesService);
//     });

//     beforeEach(() => {
//         controller = Container.get(VirtualPlayerProfilesController);
//     });

//     afterEach(() => {
//         sinon.restore();
//         chai.spy.restore();
//         testingUnit.restore();
//     });

//     it('should create', () => {
//         // eslint-disable-next-line @typescript-eslint/no-unused-expressions, no-unused-expressions
//         expect(controller).to.exist;
//     });

//     describe('configureRouter', () => {
//         let expressApp: Express.Application;

//         beforeEach(() => {
//             const app = Container.get(Application);
//             expressApp = app.app;
//         });

//         describe('GET /virtualPlayerProfiles', () => {
//             it('should return OK on valid request', async () => {
//                 virtualPlayerProfileServiceStub.getAllVirtualPlayerProfiles.resolves(ALL_PROFILES);

//                 return supertest(expressApp)
//                     .get('/api/virtualPlayerProfiles')
//                     .expect(StatusCodes.OK)
//                     .then(() => expect(virtualPlayerProfileServiceStub.getAllVirtualPlayerProfiles.called).to.be.true);
//             });

//             it('should return have gameHistories attribute in body', async () => {
//                 virtualPlayerProfileServiceStub.getAllVirtualPlayerProfiles.resolves(ALL_PROFILES);

//                 return expect((await supertest(expressApp).get('/api/virtualPlayerProfiles')).body).to.have.property('virtualPlayerProfiles');
//             });

//             it('should return INTERNAL_SERVER_ERROR on throw httpException', async () => {
//                 virtualPlayerProfileServiceStub.getAllVirtualPlayerProfiles.callsFake(() => {
//                     throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.INTERNAL_SERVER_ERROR);
//                 });

//                 return supertest(expressApp).get('/api/virtualPlayerProfiles').expect(StatusCodes.INTERNAL_SERVER_ERROR);
//             });
//         });

//         describe('GET /virtualPlayerProfiles/:level', () => {
//             it('should return OK on valid request', async () => {
//                 virtualPlayerProfileServiceStub.getVirtualPlayerProfilesFromLevel.resolves(ALL_PROFILES);

//                 return supertest(expressApp)
//                     .get(`/api/virtualPlayerProfiles/${VirtualPlayerLevel.Beginner}`)
//                     .expect(StatusCodes.OK)
//                     .then(() => expect(virtualPlayerProfileServiceStub.getVirtualPlayerProfilesFromLevel.called).to.be.true);
//             });

//             it('should return have gameHistories attribute in body', async () => {
//                 virtualPlayerProfileServiceStub.getVirtualPlayerProfilesFromLevel.resolves(ALL_PROFILES);

//                 return expect((await supertest(expressApp).get(`/api/virtualPlayerProfiles/${VirtualPlayerLevel.Expert}`)).body).to.have.property(
//                     'virtualPlayerProfiles',
//                 );
//             });

//             it('should throw if level is invalid', async () => {
//                 return supertest(expressApp).get('/api/virtualPlayerProfiles/autre').expect(StatusCodes.BAD_REQUEST);
//             });

//             it('should return INTERNAL_SERVER_ERROR on throw httpException', async () => {
//                 virtualPlayerProfileServiceStub.getVirtualPlayerProfilesFromLevel.callsFake(() => {
//                     throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.INTERNAL_SERVER_ERROR);
//                 });

//                 return supertest(expressApp)
//                     .get(`/api/virtualPlayerProfiles/${VirtualPlayerLevel.Beginner}`)
//                     .expect(StatusCodes.INTERNAL_SERVER_ERROR);
//             });
//         });

//         describe('POST /virtualPlayerProfiles', () => {
//             it('should return OK on valid request', async () => {
//                 return supertest(expressApp)
//                     .post('/api/virtualPlayerProfiles')
//                     .send({ virtualPlayerData: CUSTOM_PROFILE_1 })
//                     .expect(StatusCodes.CREATED)
//                     .then(() => expect(virtualPlayerProfileServiceStub.addVirtualPlayerProfile.called).to.be.true);
//             });

//             it('should throw if virtualPlayerData is not provided', async () => {
//                 return supertest(expressApp)
//                     .post('/api/virtualPlayerProfiles')
//                     .send({ virtualPlayerData: undefined })
//                     .expect(StatusCodes.BAD_REQUEST);
//             });

//             it('should return INTERNAL_SERVER_ERROR on throw httpException', async () => {
//                 virtualPlayerProfileServiceStub.addVirtualPlayerProfile.callsFake(() => {
//                     throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.INTERNAL_SERVER_ERROR);
//                 });

//                 return supertest(expressApp)
//                     .post('/api/virtualPlayerProfiles')
//                     .send({ virtualPlayerData: CUSTOM_PROFILE_1 })
//                     .expect(StatusCodes.INTERNAL_SERVER_ERROR);
//             });
//         });

//         describe('PATCH /virtualPlayerProfiles/:profileId', () => {
//             it('should return NO_CONTENT on valid request', async () => {
//                 return supertest(expressApp)
//                     .patch(`/api/virtualPlayerProfiles/${DEFAULT_PLAYER_ID_1}`)
//                     .send({ profileData: { name: CUSTOM_PROFILE_1.name } })
//                     .expect(StatusCodes.NO_CONTENT)
//                     .then(() => expect(virtualPlayerProfileServiceStub.updateVirtualPlayerProfile.called).to.be.true);
//             });

//             it('should throw if newName is not provided', async () => {
//                 return supertest(expressApp)
//                     .patch(`/api/virtualPlayerProfiles/${DEFAULT_PLAYER_ID_1}`)
//                     .send({ profileData: { name: undefined } })
//                     .expect(StatusCodes.BAD_REQUEST);
//             });

//             it('should return INTERNAL_SERVER_ERROR on throw httpException', async () => {
//                 virtualPlayerProfileServiceStub.updateVirtualPlayerProfile.callsFake(() => {
//                     throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.INTERNAL_SERVER_ERROR);
//                 });

//                 return supertest(expressApp)
//                     .patch(`/api/virtualPlayerProfiles/${DEFAULT_PLAYER_ID_1}`)
//                     .send({ newName: CUSTOM_PROFILE_1.name })
//                     .expect(StatusCodes.INTERNAL_SERVER_ERROR);
//             });
//         });

//         describe('DELETE /virtualPlayerProfiles', () => {
//             it('should return NO_CONTENT', async () => {
//                 return supertest(expressApp)
//                     .delete('/api/virtualPlayerProfiles')
//                     .expect(StatusCodes.NO_CONTENT)
//                     .then(() => expect(virtualPlayerProfileServiceStub.resetVirtualPlayerProfiles.called).to.be.true);
//             });

//             it('should return INTERNAL_SERVER_ERROR on throw httpException', async () => {
//                 virtualPlayerProfileServiceStub.resetVirtualPlayerProfiles.callsFake(() => {
//                     throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.INTERNAL_SERVER_ERROR);
//                 });

//                 return supertest(expressApp).delete('/api/virtualPlayerProfiles').expect(StatusCodes.INTERNAL_SERVER_ERROR);
//             });
//         });

//         describe('DELETE /virtualPlayerProfiles/:profileId', () => {
//             it('should return NO_CONTENT', async () => {
//                 return supertest(expressApp)
//                     .delete(`/api/virtualPlayerProfiles/${DEFAULT_PLAYER_ID_1}`)
//                     .expect(StatusCodes.NO_CONTENT)
//                     .then(() => expect(virtualPlayerProfileServiceStub.deleteVirtualPlayerProfile.called).to.be.true);
//             });

//             it('should return INTERNAL_SERVER_ERROR on throw httpException', async () => {
//                 virtualPlayerProfileServiceStub.deleteVirtualPlayerProfile.callsFake(() => {
//                     throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.INTERNAL_SERVER_ERROR);
//                 });

//                 return supertest(expressApp).delete(`/api/virtualPlayerProfiles/${DEFAULT_PLAYER_ID_1}`).expect(StatusCodes.INTERNAL_SERVER_ERROR);
//             });
//         });
//     });
// });
