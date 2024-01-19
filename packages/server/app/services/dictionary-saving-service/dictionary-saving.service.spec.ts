/* eslint-disable max-lines */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { BasicDictionaryData, DictionaryEntry, DictionaryIndexes, DictionaryUpdateInfo } from '@app/classes/communication/dictionary-data';
import {
    CANNOT_USE_DEFAULT_DICTIONARY,
    DEFAULT_DICTIONARY_FILENAME,
    DEFAULT_DICTIONARY_NOT_FOUND,
    DICTIONARY_DIRECTORY,
    DICTIONARY_INDEX_FILENAME,
    INVALID_TITLE_ALREADY_USED,
    NO_DICTIONARY_WITH_ID,
    NO_DICTIONARY_WITH_NAME,
} from '@app/constants/dictionary-const';
import { NOT_FOUND } from '@app/constants/game-constants';
import { ServicesTestingUnit } from '@app/services/service-testing-unit/services-testing-unit.spec';
import { expect } from 'chai';
import { existsSync, readdirSync, unlinkSync, writeFileSync } from 'fs';
import { join } from 'path';
import { SinonStub, stub } from 'sinon';
import { Container } from 'typedi';
import DictionarySavingService from './dictionary-saving.service';

const DEFAULT_DICTIONARY: BasicDictionaryData = {
    title: 'default dictionary',
    description: 'default description',
    words: ['aa', 'bb', 'cc'],
};

const DICTIONARY_1: BasicDictionaryData = {
    title: 'dictionary 1',
    description: 'description 1',
    words: ['aa', 'bb', 'cc'],
};

const DEFAULT_ID = 'super cool id';

const DEFAULT_ENTRY: DictionaryEntry = {
    title: 'default dictionary',
    description: 'default description',
    id: DEFAULT_ID,
    filename: 'name.json',
    isDefault: false,
};

const DEFAULT_UPDATE_INFO: DictionaryUpdateInfo = {
    id: DEFAULT_ID,
};

describe('DictionarySavingService', () => {
    let service: DictionarySavingService;
    let testingUnit: ServicesTestingUnit;

    beforeEach(() => {
        const directory = join(__dirname, DICTIONARY_DIRECTORY);
        testingUnit = new ServicesTestingUnit().withMockedFileSystem({
            [directory]: {
                [DEFAULT_DICTIONARY_FILENAME]: JSON.stringify(DEFAULT_DICTIONARY),
            },
        });
    });

    beforeEach(() => {
        service = Container.get(DictionarySavingService);
    });

    afterEach(() => {
        testingUnit.restore();
    });

    describe('getDictionarySummaries', () => {
        it('should call entryToDictionarySummary for every entries', () => {
            const entryToDictionarySummaryStub = stub(service, 'entryToDictionarySummary' as any);
            const n = 4;

            service['dictionaryIndexes'].entries = [];
            for (let i = 0; i < n; ++i) {
                service['dictionaryIndexes'].entries.push({ ...DEFAULT_ENTRY });
            }

            service.getDictionarySummaries();

            expect(entryToDictionarySummaryStub.callCount).to.equal(n);
        });
    });

    describe('getDictionaryById', () => {
        let getEntryFromIdStub: SinonStub;
        let getDictionaryByFilenameStub: SinonStub;
        let entry: { filename: string };

        beforeEach(() => {
            entry = { filename: 'das-a-filename.supercoolextension' };
            getEntryFromIdStub = stub(service, 'getEntryFromId' as any).returns([entry]);
            getDictionaryByFilenameStub = stub(service, 'getDictionaryByFilename' as any);
        });

        it('should return dictionary', () => {
            getEntryFromIdStub.callThrough();
            getDictionaryByFilenameStub.callThrough();

            const dictionary = service.addDictionary(DICTIONARY_1);
            const result = service.getDictionaryById(dictionary.id);

            expect(result).to.deep.equal({ ...DICTIONARY_1, isDefault: false });
        });

        it('should call getEntryFromId', () => {
            service.getDictionaryById(DEFAULT_ID);

            expect(getEntryFromIdStub.calledWithExactly(DEFAULT_ID)).to.be.true;
        });

        it('should call getDictionaryByFilename with getEntryFromId filename', () => {
            getEntryFromIdStub.returns([entry]);

            service.getDictionaryById(DEFAULT_ID);

            expect(getDictionaryByFilenameStub.calledWithExactly(entry.filename)).to.be.true;
        });

        it('should return getDictionaryByFilename result', () => {
            const dictionary = { ...DICTIONARY_1 };

            getDictionaryByFilenameStub.returns(dictionary);
            getEntryFromIdStub.returns([{ isDefault: false }]);

            const result = service.getDictionaryById(DEFAULT_ID);

            expect(result).to.deep.equal({ ...dictionary, isDefault: false });
        });
    });

    describe('addDictionary', () => {
        let writeFileStub: SinonStub;
        let entriesPushStub: SinonStub;
        let updateDictionaryIndexStub: SinonStub;
        let entryToDictionarySummaryStub: SinonStub;

        beforeEach(() => {
            writeFileStub = stub(service, 'writeFile' as any);
            entriesPushStub = stub(service['dictionaryIndexes'].entries, 'push');
            updateDictionaryIndexStub = stub(service, 'updateDictionaryIndex' as any);
            entryToDictionarySummaryStub = stub(service, 'entryToDictionarySummary' as any);
        });

        it('should add dictionary', () => {
            writeFileStub.callThrough();
            entriesPushStub.callThrough();
            updateDictionaryIndexStub.callThrough();
            entryToDictionarySummaryStub.callThrough();

            const initialNumberOfFiles = readdirSync(join(__dirname, DICTIONARY_DIRECTORY)).length;

            const dictionarySummary = service.addDictionary(DICTIONARY_1);

            expect(service.getDictionarySummaries().find((s) => s.id === dictionarySummary.id)).to.exist;
            expect(readdirSync(join(__dirname, DICTIONARY_DIRECTORY)).length).to.equal(initialNumberOfFiles + 1);
        });

        it('should call writeFile with filename and dictionary', () => {
            entryToDictionarySummaryStub.callThrough();
            const result = service.addDictionary(DICTIONARY_1);
            const filename = `${result.title}-${result.id}.json`;

            expect(writeFileStub.calledWithExactly(filename, DICTIONARY_1));
        });

        it('should call entries.push with entry', () => {
            entryToDictionarySummaryStub.callsFake((e) => e);
            const entry = service.addDictionary(DICTIONARY_1);

            expect(entriesPushStub.calledWithExactly(entry));
        });

        it('should call updateDictionaryIndex after entries.push', () => {
            service.addDictionary(DICTIONARY_1);

            expect(updateDictionaryIndexStub.calledImmediatelyAfter(entriesPushStub));
        });

        it('should call entryToDictionarySummary and return its value', () => {
            const dictionarySummary = 'totally a dictionary summary, trust me bro';
            entryToDictionarySummaryStub.returns(dictionarySummary);

            const result = service.addDictionary(DICTIONARY_1);

            expect(entryToDictionarySummaryStub.called).to.be.true;
            expect(result).to.equal(dictionarySummary);
        });

        it('should throw if name exists', () => {
            entryToDictionarySummaryStub.callThrough();
            expect(() => service.addDictionary(DEFAULT_DICTIONARY)).to.throw(INVALID_TITLE_ALREADY_USED(DEFAULT_DICTIONARY.title));
        });
    });

    describe('updateDictionary', () => {
        let entry: DictionaryEntry;
        let entryIndex: number;
        let dictionary: BasicDictionaryData;
        let updateInfo: DictionaryUpdateInfo;
        let getEntryFromIdStub: SinonStub;
        let getDictionaryByFilenameStub: SinonStub;
        let patchDictionaryStub: SinonStub;
        let writeFileStub: SinonStub;
        let entriesSpliceStub: SinonStub;
        let updateDictionaryIndexStub: SinonStub;
        let entryToDictionarySummaryStub: SinonStub;

        beforeEach(() => {
            entry = { ...DEFAULT_ENTRY };
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            entryIndex = 69;
            dictionary = { ...DEFAULT_DICTIONARY };
            updateInfo = { ...DEFAULT_UPDATE_INFO };

            getEntryFromIdStub = stub(service, 'getEntryFromId' as any).returns([entry, entryIndex]);
            getDictionaryByFilenameStub = stub(service, 'getDictionaryByFilename' as any).returns(dictionary);
            patchDictionaryStub = stub(service, 'patchDictionary' as any);
            writeFileStub = stub(service, 'writeFile' as any);
            entriesSpliceStub = stub(service['dictionaryIndexes'].entries, 'splice');
            updateDictionaryIndexStub = stub(service, 'updateDictionaryIndex' as any);
            entryToDictionarySummaryStub = stub(service, 'entryToDictionarySummary' as any);
        });

        it('should update dictionary', () => {
            getEntryFromIdStub.callThrough();
            getDictionaryByFilenameStub.callThrough();
            patchDictionaryStub.callThrough();
            writeFileStub.callThrough();
            entriesSpliceStub.callThrough();
            updateDictionaryIndexStub.callThrough();
            entryToDictionarySummaryStub.callThrough();

            const newTitle = 'very new and very original title';
            const newDescription = 'yes, I am a description and I am different from before';

            const dictionarySummary = service.addDictionary(DICTIONARY_1);
            updateInfo = {
                id: dictionarySummary.id,
                title: newTitle,
                description: newDescription,
            };

            service.updateDictionary(updateInfo);

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const updatedSummary = service.getDictionarySummaries().find((s) => s.id === dictionarySummary.id)!;
            const updatedDictionary = service.getDictionaryById(dictionarySummary.id);

            expect(updatedSummary.title).to.equal(newTitle);
            expect(updatedSummary.description).to.equal(newDescription);
            expect(updatedDictionary.title).to.equal(newTitle);
            expect(updatedDictionary.description).to.equal(newDescription);
        });

        it('should call getEntryFromId with info id', () => {
            service.updateDictionary(updateInfo);

            expect(getEntryFromIdStub.calledWithExactly(updateInfo.id, false)).to.be.true;
        });

        it('should throw if same title is given', () => {
            updateInfo.title = DEFAULT_DICTIONARY.title;
            expect(() => service.updateDictionary(updateInfo)).to.throw(INVALID_TITLE_ALREADY_USED(DEFAULT_DICTIONARY.title));
        });

        it('should call getDictionaryByFilename with entry filename', () => {
            service.updateDictionary(updateInfo);

            expect(getDictionaryByFilenameStub.calledWithExactly(entry.filename)).to.be.true;
        });

        it('should call patchDictionary with entry, dictionary and info', () => {
            service.updateDictionary(updateInfo);

            expect(patchDictionaryStub.calledWithExactly(entry, dictionary, updateInfo)).to.be.true;
        });

        it('should call writeFile with entry filename and dictionary', () => {
            service.updateDictionary(updateInfo);

            expect(writeFileStub.calledWithExactly(entry.filename, dictionary));
        });

        it('should call entries.splice with index and entry', () => {
            service.updateDictionary(updateInfo);

            expect(entriesSpliceStub.calledWithExactly(entryIndex, 1, entry));
        });

        it('should call updateDictionaryIndex', () => {
            service.updateDictionary(updateInfo);

            expect(updateDictionaryIndexStub.calledImmediatelyAfter(entriesSpliceStub));
        });

        it('should call entryToDictionarySummary with entry and returns its result', () => {
            const dictionarySummary = 'ah yes, it is I, a dictionary summary (and nobody else)';
            entryToDictionarySummaryStub.returns(dictionarySummary);

            const result = service.updateDictionary(updateInfo);

            expect(entryToDictionarySummaryStub.calledWithExactly(entry));
            expect(result).to.equal(dictionarySummary);
        });
    });

    describe('deleteDictionaryById', () => {
        let entry: DictionaryEntry;
        let entryIndex: number;
        let getEntryFromIdStub: SinonStub;
        let entriesSpliceStub: SinonStub;
        let updateDictionaryIndexStub: SinonStub;
        let deleteFileStub: SinonStub;

        beforeEach(() => {
            entry = { ...DEFAULT_ENTRY };
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            entryIndex = 17;

            getEntryFromIdStub = stub(service, 'getEntryFromId' as any).returns([entry, entryIndex]);
            entriesSpliceStub = stub(service['dictionaryIndexes'].entries, 'splice');
            updateDictionaryIndexStub = stub(service, 'updateDictionaryIndex' as any);
            deleteFileStub = stub(service, 'deleteFile' as any);
        });

        it('should delete dictionary', () => {
            getEntryFromIdStub.callThrough();
            entriesSpliceStub.callThrough();
            updateDictionaryIndexStub.callThrough();
            deleteFileStub.callThrough();

            const initialNumberOfFiles = readdirSync(join(__dirname, DICTIONARY_DIRECTORY)).length;

            const dictionarySummary = service.addDictionary(DICTIONARY_1);

            expect(service.getDictionarySummaries().find((s) => s.id === dictionarySummary.id)).to.exist;
            expect(readdirSync(join(__dirname, DICTIONARY_DIRECTORY)).length).to.equal(initialNumberOfFiles + 1);

            service.deleteDictionaryById(dictionarySummary.id);

            expect(service.getDictionarySummaries().find((s) => s.id === dictionarySummary.id)).to.not.exist;
            expect(readdirSync(join(__dirname, DICTIONARY_DIRECTORY)).length).to.equal(initialNumberOfFiles);
        });

        it('should call getEntryFromId with info id', () => {
            service.deleteDictionaryById(DEFAULT_ID);

            expect(getEntryFromIdStub.calledWithExactly(DEFAULT_ID, false)).to.be.true;
        });

        it('should call splice with entryIndex', () => {
            service.deleteDictionaryById(DEFAULT_ID);

            expect(entriesSpliceStub.calledWithExactly(entryIndex, 1));
        });

        it('should call updateDictionaryIndex', () => {
            service.deleteDictionaryById(DEFAULT_ID);

            expect(updateDictionaryIndexStub.calledImmediatelyAfter(entriesSpliceStub)).to.be.true;
        });

        it('should call deleteFile with entry filename', () => {
            service.deleteDictionaryById(DEFAULT_ID);

            expect(deleteFileStub.calledWithExactly(entry.filename)).to.be.true;
        });
    });

    describe('restore', () => {
        let indexes: DictionaryIndexes;
        let readDirStub: SinonStub;
        let deleteFileStub: SinonStub;
        let getDefaultDictionaryIndexFileStub: SinonStub;
        let writeFileStub: SinonStub;

        beforeEach(() => {
            indexes = { entries: [] };

            readDirStub = stub(service, 'readDir' as any).returns([]);
            deleteFileStub = stub(service, 'deleteFile' as any);
            getDefaultDictionaryIndexFileStub = stub(service, 'getDefaultDictionaryIndexFile' as any).returns(indexes);
            writeFileStub = stub(service, 'writeFile' as any);
        });

        it('should restore to default values', () => {
            readDirStub.callThrough();
            deleteFileStub.callThrough();
            getDefaultDictionaryIndexFileStub.callThrough();
            writeFileStub.callThrough();

            writeFileSync(join(__dirname, DICTIONARY_DIRECTORY, 'interesting-file.txt'), 'i am very interesting');
            writeFileSync(join(__dirname, DICTIONARY_DIRECTORY, 'other-file-is-lying.txt'), 'they boring af');
            unlinkSync(join(__dirname, DICTIONARY_DIRECTORY, DICTIONARY_INDEX_FILENAME));

            expect(readdirSync(join(__dirname, DICTIONARY_DIRECTORY)).length).to.equal(3);
            expect(existsSync(join(__dirname, DICTIONARY_DIRECTORY, DICTIONARY_INDEX_FILENAME))).to.be.false;

            service.restore();

            expect(readdirSync(join(__dirname, DICTIONARY_DIRECTORY)).length).to.equal(2);
            expect(existsSync(join(__dirname, DICTIONARY_DIRECTORY, DICTIONARY_INDEX_FILENAME))).to.be.true;

            const summaries = service.getDictionarySummaries();
            expect(summaries).to.have.length(1);
            expect(summaries[0].title).to.equal(DEFAULT_DICTIONARY.title);
            expect(summaries[0].description).to.equal(DEFAULT_DICTIONARY.description);
            expect(summaries[0].isDefault).to.be.true;
        });

        it('should call readDir', () => {
            service.restore();

            expect(readDirStub.called).to.be.true;
        });

        it('should call deleteFile with every files from dir expect default dictionary', () => {
            const files = ['I is file.png', 'moissi.gif', 'I am harry styles.yeahright'];
            const filesWithDefault = [...files, DEFAULT_DICTIONARY_FILENAME];
            readDirStub.returns(filesWithDefault);

            service.restore();

            for (const file of files) {
                expect(deleteFileStub.calledWithExactly(file));
            }
            expect(deleteFileStub.calledWith(DEFAULT_DICTIONARY_FILENAME)).to.be.false;
        });

        it('should call getDefaultDictionaryIndexFile', () => {
            service.restore();

            expect(getDefaultDictionaryIndexFileStub.called).to.be.true;
        });

        it('should call writeFile with index filename and indexes', () => {
            service.restore();

            expect(writeFileStub.calledWithExactly(DICTIONARY_INDEX_FILENAME, indexes));
        });
    });

    describe('getDictionaryByFilename', () => {
        let filename: string;
        let existsFileStub: SinonStub;
        let readFileStub: SinonStub;

        beforeEach(() => {
            filename = 'very real filename that refers to a very real dictionary.r';
            existsFileStub = stub(service, 'existsFile' as any).returns(true);
            readFileStub = stub(service, 'readFile' as any);
        });

        it('should call existsFile with filename', () => {
            service['getDictionaryByFilename'](filename);

            expect(existsFileStub.calledWithExactly(filename));
        });

        it('should call readFile with filename', () => {
            const dictionary = 'i am the very real dictionary that the filename game (.dictionary)';
            readFileStub.returns(dictionary);

            const result = service['getDictionaryByFilename'](filename);

            expect(readFileStub.calledWithExactly(filename));
            expect(result).to.equal(dictionary);
        });

        it('should throw if does not exists', () => {
            existsFileStub.returns(false);

            expect(() => service['getDictionaryByFilename'](filename)).to.throw(NO_DICTIONARY_WITH_NAME(filename));
            expect(readFileStub.called).to.be.false;
        });
    });

    describe('getEntryFromId', () => {
        let index: number;
        let entry: DictionaryEntry;
        let entriesFindIndexStub: SinonStub;

        beforeEach(() => {
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            index = 12;
            entry = { ...DEFAULT_ENTRY };

            service['dictionaryIndexes'].entries = new Array(index + 1).fill(undefined);

            entriesFindIndexStub = stub(service['dictionaryIndexes'].entries, 'findIndex').returns(index);

            service['dictionaryIndexes'].entries[index] = entry;
        });

        it('should call findIndex', () => {
            service['getEntryFromId'](DEFAULT_ID);

            expect(entriesFindIndexStub.called).to.be.true;
        });

        it('should return index and entry at index', () => {
            const [resEntry, resIndex] = service['getEntryFromId'](DEFAULT_ID);

            expect(resEntry).to.equal(entry);
            expect(resIndex).to.equal(index);
        });

        it('should throw if not found', () => {
            entriesFindIndexStub.returns(NOT_FOUND);

            expect(() => service['getEntryFromId'](DEFAULT_ID)).to.throw(NO_DICTIONARY_WITH_ID(DEFAULT_ID));
        });

        it('should throw if dont allow default and is default', () => {
            service['dictionaryIndexes'].entries[index].isDefault = true;

            expect(() => service['getEntryFromId'](DEFAULT_ID, false)).to.throw(CANNOT_USE_DEFAULT_DICTIONARY);
        });
    });

    describe('patchDictionary', () => {
        let startEntry: DictionaryEntry;
        let entry: DictionaryEntry;
        let startDictionary: BasicDictionaryData;
        let dictionary: BasicDictionaryData;
        let updateInfo: DictionaryUpdateInfo;

        beforeEach(() => {
            startEntry = { ...DEFAULT_ENTRY };
            entry = { ...DEFAULT_ENTRY };
            startDictionary = { ...DEFAULT_DICTIONARY };
            dictionary = { ...DEFAULT_DICTIONARY };
            updateInfo = { ...DEFAULT_UPDATE_INFO };
        });

        it('should not change if title and description are undefined', () => {
            service['patchDictionary'](entry, dictionary, updateInfo);

            expect(entry).to.deep.equal(startEntry);
            expect(dictionary).to.deep.equal(startDictionary);
        });

        it('should change if title is defined', () => {
            const title = 'das a new cool title';
            updateInfo.title = title;
            service['patchDictionary'](entry, dictionary, updateInfo);

            expect(entry).to.not.deep.equal(startEntry);
            expect(dictionary).to.not.deep.equal(startDictionary);
            expect(entry.title).to.equal(title);
            expect(dictionary.title).to.equal(title);
        });

        it('should change if description is defined', () => {
            const description = 'das a new cool description';
            updateInfo.description = description;
            service['patchDictionary'](entry, dictionary, updateInfo);

            expect(entry).to.not.deep.equal(startEntry);
            expect(dictionary).to.not.deep.equal(startDictionary);
            expect(entry.description).to.equal(description);
            expect(dictionary.description).to.equal(description);
        });
    });

    describe('readDictionaryIndexes', () => {
        let existsFileStub: SinonStub;
        let restoreStub: SinonStub;
        let readFileStub: SinonStub;

        beforeEach(() => {
            existsFileStub = stub(service, 'existsFile' as any).returns(true);
            restoreStub = stub(service, 'restore');
            readFileStub = stub(service, 'readFile' as any);
        });

        it('should call existsFile with indexes filename', () => {
            service['readDictionaryIndexes']();

            expect(existsFileStub.calledWithExactly(DICTIONARY_INDEX_FILENAME)).to.be.true;
        });

        it('should call readFile with indexes filename', () => {
            service['readDictionaryIndexes']();

            expect(readFileStub.calledWithExactly(DICTIONARY_INDEX_FILENAME)).to.be.true;
        });

        it('should not call restore if exists', () => {
            service['readDictionaryIndexes']();

            expect(restoreStub.called).to.be.false;
        });

        it('should call restore if does not exists', () => {
            existsFileStub.returns(false);

            service['readDictionaryIndexes']();

            expect(restoreStub.called).to.be.true;
        });
    });

    describe('updateDictionaryIndex', () => {
        it('should call writeFile with index filename and indexes', () => {
            const writeFileStub = stub(service, 'writeFile' as any);
            const indexes: DictionaryIndexes = { entries: [] };
            service['dictionaryIndexes'] = indexes;

            service['updateDictionaryIndex']();

            expect(writeFileStub.calledWithExactly(DICTIONARY_INDEX_FILENAME, indexes));
        });
    });

    describe('getDefaultDictionaryIndexFile', () => {
        let getDictionaryByFilenameStub: SinonStub;

        beforeEach(() => {
            getDictionaryByFilenameStub = stub(service, 'getDictionaryByFilename' as any).returns({ ...DEFAULT_DICTIONARY });
        });

        it('should return dictionary indexes with only default dictionary', () => {
            const result = service['getDefaultDictionaryIndexFile']();

            expect(result.entries).to.have.length(1);
            expect(result.entries[0].title).to.equal(DEFAULT_DICTIONARY.title);
            expect(result.entries[0].description).to.equal(DEFAULT_DICTIONARY.description);
            expect(result.entries[0].filename).to.equal(DEFAULT_DICTIONARY_FILENAME);
            expect(result.entries[0].isDefault).to.be.true;
            expect(result.entries[0].id).to.exist;
        });

        it('should throw if no default dictionary', () => {
            getDictionaryByFilenameStub.throws('');

            expect(() => service['getDefaultDictionaryIndexFile']()).to.throw(DEFAULT_DICTIONARY_NOT_FOUND);
        });
    });

    describe('entryToDictionarySummary', () => {
        it('should convert', () => {
            const result = service['entryToDictionarySummary']({ ...DEFAULT_ENTRY });

            expect(result).to.deep.equal({
                title: DEFAULT_ENTRY.title,
                description: DEFAULT_ENTRY.description,
                id: DEFAULT_ENTRY.id,
                isDefault: DEFAULT_ENTRY.isDefault,
            });
        });
    });

    describe('readFile', () => {
        it('is should read file from file system', () => {
            const content = { a: 'b' };
            const filename = 'file.json';

            writeFileSync(join(__dirname, DICTIONARY_DIRECTORY, filename), JSON.stringify(content));

            expect(service['readFile'](filename)).to.deep.equal(content);
        });
    });

    describe('readDir', () => {
        it('should get file names from dictionary directory', () => {
            expect(service['readDir']()).to.deep.equal([DEFAULT_DICTIONARY_FILENAME, DICTIONARY_INDEX_FILENAME]);
        });
    });

    describe('deleteFile', () => {
        it('should delete file', () => {
            const filename = join(__dirname, DICTIONARY_DIRECTORY, DICTIONARY_INDEX_FILENAME);

            expect(existsSync(filename)).to.be.true;

            service['deleteFile'](DICTIONARY_INDEX_FILENAME);

            expect(existsSync(filename)).to.be.false;
        });
    });

    describe('existsFile', () => {
        it('should check if it exists', () => {
            const filename = join(__dirname, DICTIONARY_DIRECTORY, DICTIONARY_INDEX_FILENAME);

            expect(service['existsFile'](DICTIONARY_INDEX_FILENAME)).to.equal(existsSync(filename));
        });
    });

    describe('getAbsolutePath', () => {
        it('should return path', () => {
            const filename = 'yup.nop';

            expect(service['getAbsolutePath'](filename)).to.equal(join(__dirname, DICTIONARY_DIRECTORY, filename));
        });
    });
});
