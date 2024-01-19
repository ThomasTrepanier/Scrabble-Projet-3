/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Board } from '@app/classes/board';
import { DictionarySummary } from '@app/classes/communication/dictionary-data';
import { Dictionary } from '@app/classes/dictionary';
import Range from '@app/classes/range/range';
import { Tile } from '@app/classes/tile';
import { AbstractWordFinding, WordFindingBeginner, WordFindingHint, WordFindingRequest, WordFindingUseCase } from '@app/classes/word-finding';
import WordFindingExpert from '@app/classes/word-finding/word-finding-expert/word-finding-expert';
import { PartialWordFindingParameters } from '@app/classes/word-finding/word-finding-types';
import { TEST_DICTIONARY } from '@app/constants/dictionary-tests-const';
import DictionaryService from '@app/services/dictionary-service/dictionary.service';
import { ServicesTestingUnit } from '@app/services/service-testing-unit/services-testing-unit.spec';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { createStubInstance, SinonStub, SinonStubbedInstance, stub } from 'sinon';
import { Container } from 'typedi';
import WordFindingService from './word-finding.service';

const TEST_ID = 'TEST_ID';

describe('WordFindingService', () => {
    let findWordsStub: SinonStub;
    let service: WordFindingService;
    let boardStub: SinonStubbedInstance<Board>;
    let tiles: Tile[];
    let request: WordFindingRequest;
    let testingUnit: ServicesTestingUnit;

    beforeEach(() => {
        testingUnit = new ServicesTestingUnit().withStubbedDictionaryService();
    });

    beforeEach(() => {
        sinon.restore();
        service = Container.get(WordFindingService);
        findWordsStub = stub(AbstractWordFinding.prototype, 'findWords').callsFake(() => []);

        boardStub = createStubInstance(Board);
        tiles = [];
        request = {
            useCase: WordFindingUseCase.Beginner,
            pointRange: new Range(0, 1),
            pointHistory: new Map(),
        };
    });

    afterEach(() => {
        sinon.restore();
        Container.reset();
        findWordsStub.restore();
        testingUnit.restore();
    });

    describe('getWordFindingInstance', () => {
        let params: PartialWordFindingParameters;
        let dictionaryServiceStub: SinonStubbedInstance<DictionaryService>;
        let dictionaryStub: SinonStubbedInstance<Dictionary>;
        beforeEach(() => {
            dictionaryStub = createStubInstance(Dictionary);
            dictionaryStub.summary = { id: TEST_ID } as unknown as DictionarySummary;
            dictionaryServiceStub = createStubInstance(DictionaryService);
            dictionaryServiceStub['getDictionary'].returns(dictionaryStub as unknown as Dictionary);
            (service['dictionaryService'] as unknown) = dictionaryServiceStub as unknown as DictionaryService;
            params = [boardStub as unknown as Board, tiles, request];
        });

        it('should return WordFindingHint if useCase is hint', () => {
            const result = service['getWordFindingInstance'](WordFindingUseCase.Hint, TEST_DICTIONARY.id, params);
            expect(result).to.be.instanceOf(WordFindingHint);
        });

        it('should return WordFindingBeginner if useCase is beginner', () => {
            const result = service['getWordFindingInstance'](WordFindingUseCase.Beginner, TEST_DICTIONARY.id, params);
            expect(result).to.be.instanceOf(WordFindingBeginner);
        });

        it('should return WordFindingExpert if useCase is expert', () => {
            const result = service['getWordFindingInstance'](WordFindingUseCase.Expert, TEST_DICTIONARY.id, params);
            expect(result).to.be.instanceOf(WordFindingExpert);
        });
    });
});
