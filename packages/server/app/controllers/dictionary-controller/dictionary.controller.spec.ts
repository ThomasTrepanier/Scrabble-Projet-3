// /* eslint-disable dot-notation */
// /* eslint-disable @typescript-eslint/no-empty-function */
// import { Application } from '@app/app';
// import { BasicDictionaryData, DictionarySummary } from '@app/classes/communication/dictionary-data';
// import { HttpException } from '@app/classes/http-exception/http-exception';
// import DictionaryService from '@app/services/dictionary-service/dictionary.service';
// import { ServicesTestingUnit } from '@app/services/service-testing-unit/services-testing-unit.spec';
// import * as chai from 'chai';
// import * as chaiAsPromised from 'chai-as-promised';
// import * as spies from 'chai-spies';
// import { StatusCodes } from 'http-status-codes';
// import { SinonStubbedInstance } from 'sinon';
// import * as supertest from 'supertest';
// import { Container } from 'typedi';
// import { DictionaryController } from './dictionary.controller';

// const expect = chai.expect;

// chai.use(spies);
// chai.use(chaiAsPromised);

// const DEFAULT_EXCEPTION = 'exception';
// const DEFAULT_DICTIONARY_ID = 'dictionaryId';
// const TEST_DICTIONARY_1: DictionarySummary = { id: 'id1', title: 'title1', description: 'description1', isDefault: false };
// const TEST_DICTIONARY_2: DictionarySummary = { id: 'id2', title: 'title2', description: 'description2', isDefault: true };

// describe('DictionaryController', () => {
//     let controller: DictionaryController;
//     let testingUnit: ServicesTestingUnit;
//     let dictionaryServiceStub: SinonStubbedInstance<DictionaryService>;

//     beforeEach(async () => {
//         testingUnit = new ServicesTestingUnit().withMockedAuthentification();
//         await testingUnit.withMockDatabaseService();
//         testingUnit.withStubbedDictionaryService().withStubbedControllers(DictionaryController);
//         dictionaryServiceStub = testingUnit.getStubbedInstance(DictionaryService);
//     });

//     beforeEach(() => {
//         controller = Container.get(DictionaryController);
//     });

//     afterEach(() => {
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

//         describe('POST /dictionary', () => {
//             it('should return CREATED', async () => {
//                 chai.spy.on(controller['dictionaryService'], 'addNewDictionary', () => {});

//                 return supertest(expressApp).post('/api/dictionaries').expect(StatusCodes.CREATED);
//             });

//             it('should return BAD_REQUEST on throw httpException', async () => {
//                 chai.spy.on(controller['dictionaryService'], 'addNewDictionary', () => {
//                     throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.BAD_REQUEST);
//                 });

//                 return supertest(expressApp).post('/api/dictionaries').expect(StatusCodes.BAD_REQUEST);
//             });
//         });

//         describe('PATCH /dictionary', () => {
//             it('should return OK', async () => {
//                 chai.spy.on(controller['dictionaryService'], 'updateDictionary', () => {});

//                 return supertest(expressApp).patch('/api/dictionaries').expect(StatusCodes.NO_CONTENT);
//             });

//             it('should return BAD_REQUEST on throw httpException', async () => {
//                 chai.spy.on(controller['dictionaryService'], 'updateDictionary', () => {
//                     throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.BAD_REQUEST);
//                 });

//                 return supertest(expressApp).patch('/api/dictionaries').expect(StatusCodes.BAD_REQUEST);
//             });
//         });

//         describe('DELETE /dictionary', () => {
//             it('should return OK', async () => {
//                 return supertest(expressApp).delete('/api/dictionaries').expect(StatusCodes.NO_CONTENT);
//             });

//             it('should return BAD_REQUEST on throw httpException', async () => {
//                 dictionaryServiceStub.deleteDictionary.callsFake(() => {
//                     throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.BAD_REQUEST);
//                 });

//                 return supertest(expressApp).delete('/api/dictionaries').expect(StatusCodes.BAD_REQUEST);
//             });
//         });

//         describe('GET /dictionaries/:dictionaryId', () => {
//             const expected: BasicDictionaryData = {
//                 title: 'dictionaryData.title',
//                 description: 'dictionaryData.description',
//                 words: ['dictionaryData.words', 'word2'],
//             };
//             it('should return OK', async () => {
//                 chai.spy.on(controller['dictionaryService'], 'getDictionaryData', () => {
//                     return { ...expected, isDefault: true };
//                 });

//                 return supertest(expressApp).get(`/api/dictionaries/${DEFAULT_DICTIONARY_ID}`).expect(StatusCodes.OK);
//             });

//             it('should return BAD_REQUEST on throw httpException', async () => {
//                 chai.spy.on(controller['dictionaryService'], 'getDictionaryData', () => {
//                     throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.BAD_REQUEST);
//                 });

//                 return supertest(expressApp).get(`/api/dictionaries/${DEFAULT_DICTIONARY_ID}`).expect(StatusCodes.BAD_REQUEST);
//             });

//             it('should have the dictionary in the response body', async () => {
//                 chai.spy.on(controller['dictionaryService'], 'getDictionaryData', () => {
//                     return { ...expected, isDefault: true };
//                 });
//                 return expect((await supertest(expressApp).get('/api/dictionaries/${DEFAULT_DICTIONARY_ID}')).body).to.deep.equal(expected);
//             });
//         });

//         describe('GET /dictionaries/summary', () => {
//             it('should return OK', async () => {
//                 chai.spy.on(controller['dictionaryService'], 'getAllDictionarySummaries', () => {});

//                 return supertest(expressApp).get('/api/dictionaries/summary').expect(StatusCodes.OK);
//             });

//             it('should return BAD_REQUEST on throw httpException', async () => {
//                 chai.spy.on(controller['dictionaryService'], 'getAllDictionarySummaries', () => {
//                     throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.BAD_REQUEST);
//                 });

//                 return supertest(expressApp).get('/api/dictionaries/summary').expect(StatusCodes.BAD_REQUEST);
//             });

//             it('should have the summary in the response body', async () => {
//                 const expected: DictionarySummary[] = [TEST_DICTIONARY_1, TEST_DICTIONARY_2];
//                 chai.spy.on(controller['dictionaryService'], 'getAllDictionarySummaries', () => {
//                     return expected;
//                 });
//                 return expect((await supertest(expressApp).get('/api/dictionaries/summary')).body).to.deep.equal(expected);
//             });
//         });

//         describe('DELETE /dictionaries/reset', () => {
//             it('should return OK', async () => {
//                 return supertest(expressApp).delete('/api/dictionaries/reset').expect(StatusCodes.NO_CONTENT);
//             });

//             it('should return BAD_REQUEST on throw httpException', async () => {
//                 dictionaryServiceStub.restoreDictionaries.callsFake(() => {
//                     throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.BAD_REQUEST);
//                 });

//                 return supertest(expressApp).delete('/api/dictionaries/reset').expect(StatusCodes.BAD_REQUEST);
//             });
//         });
//     });
// });
