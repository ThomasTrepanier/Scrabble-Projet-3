/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable max-lines */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable dot-notation */
import { BasicDictionaryData, DictionarySummary, DictionaryUpdateInfo, DictionaryUsage } from '@app/classes/communication/dictionary-data';
import { Dictionary, DictionaryData } from '@app/classes/dictionary';
import { INVALID_DESCRIPTION_FORMAT, INVALID_DICTIONARY_FORMAT, INVALID_DICTIONARY_ID, INVALID_TITLE_FORMAT } from '@app/constants/dictionary-const';
import { ONE_HOUR_IN_MS } from '@app/constants/services-constants/dictionary-const';
import DictionarySavingService from '@app/services/dictionary-saving-service/dictionary-saving.service';
import { ServicesTestingUnit } from '@app/services/service-testing-unit/services-testing-unit.spec';
import { ValidateFunction } from 'ajv';
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';
import * as sinon from 'sinon';
import { SinonStub, SinonStubbedInstance, stub } from 'sinon';
import { Container } from 'typedi';
import {
    ADDITIONAL_PROPERTY_DICTIONARY,
    DEFAULT_SUMMARY,
    DICTIONARY_1,
    DICTIONARY_1_ID,
    INVALID_ARRAY_TYPES_DICTIONARY,
    INVALID_TYPES_DICTIONARY,
    INVALID_WORDS_DICTIONARY_1,
    INVALID_WORDS_DICTIONARY_2,
    INVALID_WORDS_DICTIONARY_3,
    INVALID_WORDS_DICTIONARY_4,
    INVALID_WORDS_DICTIONARY_5,
    INVALID_WORDS_DICTIONARY_6,
    LONG_TITLE_DICTIONARY,
    MISSING_PROPERTY_DICTIONARY,
    VALID_DICTIONARY,
} from './dictionary-test.service.spec';
import DictionaryService from './dictionary.service';

const DEFAULT_ID = 'id';

chai.use(chaiAsPromised); // this allows us to test for rejection

describe('DictionaryService', () => {
    let service: DictionaryService;
    let testingUnit: ServicesTestingUnit;
    let dictionarySavingServiceStub: SinonStubbedInstance<DictionarySavingService>;

    beforeEach(async () => {
        testingUnit = new ServicesTestingUnit();
        await testingUnit.withMockDatabaseService();
        dictionarySavingServiceStub = testingUnit.setStubbed(DictionarySavingService, {
            getDictionarySummaries: [],
        });
    });

    beforeEach(async () => {
        service = Container.get(DictionaryService);
    });

    afterEach(async () => {
        chai.spy.restore();
        sinon.restore();
        testingUnit.restore();
    });

    describe('useDictionary', () => {
        const BASE_DICTIONARY_USAGE: DictionaryUsage = { dictionary: {} as unknown as Dictionary, numberOfActiveGames: 1, isDeleted: false };
        const BASE_DICTIONARY_ID = 'id1';

        beforeEach(() => {
            service['activeDictionaries'].set(BASE_DICTIONARY_ID, BASE_DICTIONARY_USAGE);
        });

        it('should increment the number of active games, update lastUse and return the correct dictionary', () => {
            const spy = chai.spy.on(service, 'getDbDictionary', () => {
                return {} as unknown as DictionaryData;
            });
            BASE_DICTIONARY_USAGE.lastUse = undefined;

            expect(service.useDictionary(BASE_DICTIONARY_ID)).to.deep.equal(BASE_DICTIONARY_USAGE);
            expect(BASE_DICTIONARY_USAGE.numberOfActiveGames).to.equal(2);
            expect(BASE_DICTIONARY_USAGE.lastUse).not.to.be.undefined;
            expect(service['activeDictionaries'].size).to.equal(1);
            expect(spy).not.to.have.called();
        });

        it('should throw if dictionary is not active', () => {
            expect(() => service.useDictionary('invalid-id')).to.throw(INVALID_DICTIONARY_ID);
        });
    });

    describe('getDictionary', () => {
        const BASE_DICTIONARY_ID = 'id1';
        const BASE_DICTIONARY_USAGE: DictionaryUsage = {
            dictionary: { summary: { id: BASE_DICTIONARY_ID } } as unknown as Dictionary,
            numberOfActiveGames: 1,
            isDeleted: false,
        };
        beforeEach(() => {
            service['activeDictionaries'].set(BASE_DICTIONARY_ID, BASE_DICTIONARY_USAGE);
        });

        it('should return the dictionary if it exists', () => {
            expect(service.getDictionary(BASE_DICTIONARY_ID)).to.deep.equal(BASE_DICTIONARY_USAGE.dictionary);
        });

        it('should throw if the dictionaryId is not a key of the map', () => {
            const result = () => service.getDictionary('allo');
            expect(result).to.throw(INVALID_DICTIONARY_ID);
        });
    });

    describe('stopUsingDictionary', () => {
        const BASE_DICTIONARY_ID = 'id1';
        const BASE_DICTIONARY_USAGE: DictionaryUsage = {
            dictionary: { summary: { id: BASE_DICTIONARY_ID } } as unknown as Dictionary,
            numberOfActiveGames: 1,
            isDeleted: false,
        };

        let deleteSpy: sinon.SinonStub;

        beforeEach(() => {
            service['activeDictionaries'].clear();
            service['activeDictionaries'].set(BASE_DICTIONARY_ID, BASE_DICTIONARY_USAGE);
            deleteSpy = stub(service, <any>'deleteActiveDictionary').callsFake(() => {});
        });

        it('should decrement a dictionary that had more than 1 active game', async () => {
            BASE_DICTIONARY_USAGE.numberOfActiveGames = 3;
            service.stopUsingDictionary(BASE_DICTIONARY_ID);
            expect(BASE_DICTIONARY_USAGE.numberOfActiveGames).to.equal(2);
            service.stopUsingDictionary(BASE_DICTIONARY_ID);
            expect(BASE_DICTIONARY_USAGE.numberOfActiveGames).to.equal(1);
        });

        it('should not do anything if the dictionaryId is not a key of the map', async () => {
            service.stopUsingDictionary('BASE_DICTIONARY_ID');
            expect(BASE_DICTIONARY_USAGE.numberOfActiveGames).to.equal(1);
            expect(deleteSpy.called).to.be.false;
        });

        it('should call deleteActiveDictionary', async () => {
            service.stopUsingDictionary(BASE_DICTIONARY_ID);
            expect(deleteSpy.called).to.be.true;
        });
    });

    describe('validateDictionary', () => {
        it('should create the dictionary validator if it was not done before', async () => {
            service['dictionaryValidator'] = undefined as unknown as ValidateFunction<{ [x: string]: unknown }>;
            const spyCreate = chai.spy.on(service, 'createDictionaryValidator', () => {
                service['dictionaryValidator'] = ((x: string) => {
                    return x;
                }) as unknown as ValidateFunction<{ [x: string]: unknown }>;
            });

            await service.validateDictionary(DICTIONARY_1);
            expect(spyCreate).to.have.been.called;
        });

        it('should not create the dictionary validator if was done before', async () => {
            service['dictionaryValidator'] = service['dictionaryValidator'] = ((x: string) => {
                return x;
            }) as unknown as ValidateFunction<{ [x: string]: unknown }>;
            const spyCreate = chai.spy.on(service, 'createDictionaryValidator', () => {});

            await service.validateDictionary(DICTIONARY_1);
            expect(spyCreate).not.to.have.been.called;
        });
    });

    describe('addNewDictionary', () => {
        let newDictionary: BasicDictionaryData;
        let validateDictionaryStub: SinonStub;

        beforeEach(() => {
            newDictionary = { ...DICTIONARY_1 };
            validateDictionaryStub = stub(service, 'validateDictionary').returns(true);
        });

        it('should throw if the dictionary is not valid ', async () => {
            validateDictionaryStub.returns(false);
            expect(() => service.addNewDictionary(newDictionary)).to.throw(INVALID_DICTIONARY_FORMAT);
        });

        it('should add the dictionary if the title is unique', async () => {
            service.addNewDictionary(newDictionary);
            expect(dictionarySavingServiceStub.addDictionary.calledWithExactly(newDictionary)).to.be.true;
        });
    });

    describe('resetDbDictionaries', () => {
        it('should call restore', () => {
            service.restoreDictionaries();
            expect(dictionarySavingServiceStub.restore.called).to.be.true;
        });
    });

    describe('getAllDictionarySummaries', () => {
        const nSummaries = 8;
        let summaries: DictionarySummary[];
        let initializeDictionaryStub: SinonStub;

        beforeEach(() => {
            summaries = [];

            for (let i = 0; i < nSummaries; ++i) {
                summaries.push({ ...DEFAULT_SUMMARY });
            }

            dictionarySavingServiceStub.getDictionarySummaries.returns(summaries);
            initializeDictionaryStub = stub(service, 'initializeDictionary' as any);
        });

        it('should call getDictionarySummaries and return its values', () => {
            const result = service.getAllDictionarySummaries();

            expect(dictionarySavingServiceStub.getDictionarySummaries.called).to.be.true;
            expect(result).to.equal(summaries);
        });

        it('should call initializeDictionary for every summary', () => {
            service.getAllDictionarySummaries();

            for (const summary of summaries) {
                expect(initializeDictionaryStub.calledWithExactly(summary));
            }
        });
    });

    describe('updateDictionary', () => {
        let updateInfo: DictionaryUpdateInfo;
        let isDescriptionValidStub: SinonStub;
        let isTitleValidStub: SinonStub;

        beforeEach(() => {
            updateInfo = {
                id: 'id',
                title: 'a',
                description: 'b',
            };
            isDescriptionValidStub = stub(service, 'isDescriptionValid' as any).returns(true);
            isTitleValidStub = stub(service, 'isTitleValid' as any).returns(true);
        });

        it('should call updateDictionary with updateInfo', () => {
            service.updateDictionary(updateInfo);

            expect(dictionarySavingServiceStub.updateDictionary.calledWithExactly(updateInfo)).to.be.true;
        });

        it('should throw if title is invalid', () => {
            isTitleValidStub.returns(false);

            expect(() => service.updateDictionary(updateInfo)).to.throw(INVALID_TITLE_FORMAT);
        });

        it('should throw if description is invalid', () => {
            isDescriptionValidStub.returns(false);

            expect(() => service.updateDictionary(updateInfo)).to.throw(INVALID_DESCRIPTION_FORMAT);
        });
    });

    describe('deleteDictionary', () => {
        let deleteActiveDictionaryStub: SinonStub;

        beforeEach(() => {
            deleteActiveDictionaryStub = stub(service, 'deleteActiveDictionary' as any);
        });

        it('should call deleteDictionaryById', () => {
            service.deleteDictionary(DEFAULT_ID);

            expect(dictionarySavingServiceStub.deleteDictionaryById.calledWithExactly(DEFAULT_ID)).to.be.true;
        });

        it('should set dictionary to deleted and call deleteActiveDictionary', () => {
            const dictionary: DictionaryUsage = { isDeleted: false } as DictionaryUsage;
            service['activeDictionaries'].set(DEFAULT_ID, dictionary);

            service.deleteDictionary(DEFAULT_ID);

            expect(dictionary.isDeleted).to.be.true;
            expect(deleteActiveDictionaryStub.calledWith(DEFAULT_ID)).to.be.true;
        });
    });

    describe('getDbDictionary', () => {
        it('should call getDictionaryById and returns its value', () => {
            const dictionary = { ...DICTIONARY_1 };
            dictionarySavingServiceStub.getDictionaryById.returns(dictionary);
            const result = service.getDictionaryData(DEFAULT_ID);

            expect(dictionarySavingServiceStub.getDictionaryById.calledWith(DEFAULT_ID));
            expect(result).to.equal(dictionary);
        });
    });

    describe('initializeDictionaries', () => {
        const fakeIds: string[] = ['id1', 'id2', 'id3'];
        let initializeDictionaryStub: SinonStub;

        beforeEach(() => {
            stub(service, 'getDictionariesId' as any).returns(fakeIds);
            initializeDictionaryStub = stub(service, 'initializeDictionary' as any);
        });

        it('should call initializeDictionary with every id', async () => {
            service['initializeDictionaries']();
            fakeIds.forEach((id: string) => expect(initializeDictionaryStub.calledWith(id)).to.be.true);
        });
    });

    describe('getDictionariesId', () => {
        it('should return ids from getDictionarySummaries', () => {
            const fakeIds: string[] = ['id1', 'id2', 'id3'];
            dictionarySavingServiceStub.getDictionarySummaries.returns(fakeIds.map((id) => ({ id } as DictionarySummary)));

            expect(service['getDictionariesId']()).to.deep.equal(fakeIds);
        });
    });

    describe('initializeDictionary', () => {
        let getDbStub: SinonStub;

        beforeEach(() => {
            getDbStub = stub(service, <any>'getDictionaryData').returns(DICTIONARY_1);
        });

        it('should not add dictionary if it is already in array', () => {
            service['activeDictionaries'].set(DICTIONARY_1_ID, {} as unknown as DictionaryUsage);
            service['initializeDictionary'](DICTIONARY_1_ID);
            expect(getDbStub.called).to.be.false;
        });

        it('should create a new dictionary and add it to the map ', async () => {
            service['initializeDictionary'](DICTIONARY_1_ID);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const result: DictionaryUsage = service['activeDictionaries'].get(DICTIONARY_1_ID)!;

            expect(result.dictionary.summary.id).to.equal(DICTIONARY_1_ID);
            expect(result.dictionary.summary.title).to.equal(DICTIONARY_1.title);
            expect(result.isDeleted).to.be.false;
        });
    });

    describe('isTitleValid', () => {
        it('should return true if the title is short', async () => {
            expect(await service['isTitleValid']('IAmShortAndUnique')).to.be.true;
        });

        it('should return false if the title is long', async () => {
            expect(await service['isTitleValid']('uniquqweqweqweqweqweqwewqqweetitle')).to.be.false;
        });
    });

    describe('isDescriptionValid', () => {
        it('should return true if the description is short', async () => {
            expect(service['isDescriptionValid']('shortdescription')).to.be.true;
        });

        it('should return false if the description is unique and long', () => {
            expect(
                service['isDescriptionValid'](
                    `uniquqweqweqweqweqweqwewqqweedescriptionsdaofhdsfjsdhfosdhfosdfhsdohfsdhifoihsdfhiosdhiofsdihfhidsiohf
                    hdsifhisdoihfhdsifihodsihfhisdhiofsdih`,
                ),
            ).to.be.false;
        });
    });

    describe('createDictionaryValidator', () => {
        const dictionariesToTest: [BasicDictionaryData, boolean, string][] = [
            [VALID_DICTIONARY, true, 'VALID_DICTIONARY'],
            [INVALID_TYPES_DICTIONARY, false, 'INVALID_TYPES_DICTIONARY'],
            [LONG_TITLE_DICTIONARY, false, 'LONG_TITLE_DICTIONARY'],
            [MISSING_PROPERTY_DICTIONARY, false, 'MISSING_PROPERTY_DICTIONARY'],
            [INVALID_ARRAY_TYPES_DICTIONARY, false, 'INVALID_ARRAY_TYPES_DICTIONARY'],
            [ADDITIONAL_PROPERTY_DICTIONARY, false, 'ADDITIONNAL_PROPERTY_DICTIONARY'],
            [INVALID_WORDS_DICTIONARY_1, false, 'INVALID_WORDS_DICTIONARY_1'],
            [INVALID_WORDS_DICTIONARY_2, false, 'INVALID_WORDS_DICTIONARY_2'],
            [INVALID_WORDS_DICTIONARY_3, false, 'INVALID_WORDS_DICTIONARY_3'],
            [INVALID_WORDS_DICTIONARY_4, false, 'INVALID_WORDS_DICTIONARY_4'],
            [INVALID_WORDS_DICTIONARY_5, false, 'INVALID_WORDS_DICTIONARY_5'],
            [INVALID_WORDS_DICTIONARY_6, false, 'INVALID_WORDS_DICTIONARY_6'],
        ];
        const DICTIONARY = 0;
        const EXPECTED = 1;
        const TEST_DESCRIPTION = 2;

        for (const test of dictionariesToTest) {
            it(`should return ${test[EXPECTED]} for a ${test[TEST_DESCRIPTION]}`, async () => {
                expect(await service['validateDictionary'](test[DICTIONARY])).to.equal(test[EXPECTED]);
            });
        }
    });

    describe('deleteActiveDictionary', () => {
        let dictionaryId: string;
        let shouldDeleteStub: SinonStub;

        beforeEach(async () => {
            dictionaryId = service['activeDictionaries'].keys()[0];
            service['activeDictionaries'].set(dictionaryId, {} as unknown as DictionaryUsage);
            shouldDeleteStub = stub(service, <any>'shouldDeleteActiveDictionary').returns(true);
        });

        it('should call shouldDeleteActiveDictionary with appropriate arguments', () => {
            service['deleteActiveDictionary'](dictionaryId, true);
            expect(shouldDeleteStub.calledWith({}, true)).to.be.true;
        });

        it('should delete dictionary if predicate is true', () => {
            service['deleteActiveDictionary'](dictionaryId);
            expect(service['activeDictionaries'].has(dictionaryId)).to.be.false;
        });

        it('should not delete dictionary if predicate is false', () => {
            shouldDeleteStub.returns(false);
            service['deleteActiveDictionary'](dictionaryId);
            expect(service['activeDictionaries'].has(dictionaryId)).to.be.true;
        });

        it('should throw if dictionary is not in active dictionaries', () => {
            expect(() => service['deleteActiveDictionary']('invalid-id')).to.throw(INVALID_DICTIONARY_ID);
        });
    });

    describe('shouldDeleteActiveDictionary', () => {
        const dictionaryUsage: DictionaryUsage = {
            dictionary: undefined as unknown as Dictionary,
            numberOfActiveGames: 0,
            isDeleted: true,
            lastUse: undefined,
        };
        let notUsedStub: SinonStub;

        beforeEach(() => {
            notUsedStub = stub(service, <any>'notUsedInLastHour').returns(false);
        });

        it('should return true if no active games, isDeleted and forceDelete', () => {
            expect(service['shouldDeleteActiveDictionary'](dictionaryUsage, true)).to.be.true;
        });

        it('should return true if no active games, isDeleted, no force delete but last use more than 1 hour ago', () => {
            dictionaryUsage.lastUse = new Date();
            notUsedStub.returns(true);
            expect(service['shouldDeleteActiveDictionary'](dictionaryUsage, false)).to.be.true;
        });

        it('should return false if still active games', () => {
            dictionaryUsage.numberOfActiveGames = 1;
            expect(service['shouldDeleteActiveDictionary'](dictionaryUsage, false)).to.be.false;
        });

        it('should return false if not deleted on database', () => {
            dictionaryUsage.isDeleted = false;
            expect(service['shouldDeleteActiveDictionary'](dictionaryUsage, false)).to.be.false;
        });

        it('should return false if used in last hour', () => {
            notUsedStub.returns(true);
            expect(service['shouldDeleteActiveDictionary'](dictionaryUsage)).to.be.false;
        });
    });

    describe('notUsedInLastHour', () => {
        const dictionaryUsage: DictionaryUsage = {
            dictionary: undefined as unknown as Dictionary,
            numberOfActiveGames: 0,
            isDeleted: true,
            lastUse: undefined,
        };

        it('should return true if no last use', () => {
            expect(service['notUsedInLastHour'](dictionaryUsage)).to.be.true;
        });

        it('should return true if last use was more than an hour ago', () => {
            dictionaryUsage.lastUse = new Date(Date.now() - ONE_HOUR_IN_MS * 2);
            expect(service['notUsedInLastHour'](dictionaryUsage)).to.be.true;
        });

        it('should return false if last use was less than an hour ago', () => {
            dictionaryUsage.lastUse = new Date(Date.now() - ONE_HOUR_IN_MS / 2);
            expect(service['notUsedInLastHour'](dictionaryUsage)).to.be.false;
        });
    });
});
