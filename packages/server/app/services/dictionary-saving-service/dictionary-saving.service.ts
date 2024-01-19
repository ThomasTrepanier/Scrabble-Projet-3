import {
    BasicDictionaryData,
    DictionaryData,
    DictionaryEntry,
    DictionaryIndexes,
    DictionarySummary,
    DictionaryUpdateInfo,
} from '@app/classes/communication/dictionary-data';
import { HttpException } from '@app/classes/http-exception/http-exception';
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
import { existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import { StatusCodes } from 'http-status-codes';
import { join } from 'path';
import { Service } from 'typedi';
import { v4 as uuidv4 } from 'uuid';

@Service()
export default class DictionarySavingService {
    private dictionaryIndexes: DictionaryIndexes;

    constructor() {
        this.createDirectory();
        this.dictionaryIndexes = this.readDictionaryIndexes();
    }

    getDictionarySummaries(): DictionarySummary[] {
        return this.dictionaryIndexes.entries.map(this.entryToDictionarySummary);
    }

    getDictionaryById(id: string): DictionaryData {
        const [dictionaryEntry] = this.getEntryFromId(id);

        return { ...this.getDictionaryByFilename(dictionaryEntry.filename), isDefault: dictionaryEntry.isDefault };
    }

    addDictionary(dictionary: BasicDictionaryData): DictionarySummary {
        if (this.dictionaryIndexes.entries.find((entry) => entry.title === dictionary.title))
            throw new HttpException(INVALID_TITLE_ALREADY_USED(dictionary.title), StatusCodes.FORBIDDEN);

        const id = uuidv4();
        const filename = `${id}.json`;

        const dictionaryEntry: DictionaryEntry = {
            title: dictionary.title,
            description: dictionary.description,
            id,
            filename,
            isDefault: false,
        };

        this.writeFile(filename, dictionary);

        this.dictionaryIndexes.entries.push(dictionaryEntry);

        this.updateDictionaryIndex();

        return this.entryToDictionarySummary(dictionaryEntry);
    }

    updateDictionary(updateInfo: DictionaryUpdateInfo): DictionarySummary {
        if (updateInfo.title && this.dictionaryIndexes.entries.find((entry) => entry.title === updateInfo.title))
            throw new HttpException(INVALID_TITLE_ALREADY_USED(updateInfo.title), StatusCodes.FORBIDDEN);

        const [dictionaryEntry, dictionaryEntryIndex] = this.getEntryFromId(updateInfo.id, false);

        const dictionary = this.getDictionaryByFilename(dictionaryEntry.filename);
        this.patchDictionary(dictionaryEntry, dictionary, updateInfo);

        this.writeFile(dictionaryEntry.filename, dictionary);

        this.dictionaryIndexes.entries.splice(dictionaryEntryIndex, 1, dictionaryEntry);
        this.updateDictionaryIndex();

        return this.entryToDictionarySummary(dictionaryEntry);
    }

    deleteDictionaryById(id: string): void {
        const [dictionaryEntry, dictionaryEntryIndex] = this.getEntryFromId(id, false);

        this.dictionaryIndexes.entries.splice(dictionaryEntryIndex, 1);
        this.updateDictionaryIndex();

        this.deleteFile(dictionaryEntry.filename);
    }

    restore(): void {
        this.readDir().forEach((file) => {
            if (file === DEFAULT_DICTIONARY_FILENAME) return;
            this.deleteFile(file);
        });

        this.dictionaryIndexes = this.getDefaultDictionaryIndexFile();

        this.writeFile(DICTIONARY_INDEX_FILENAME, this.dictionaryIndexes);
    }

    private createDirectory(): void {
        const path = join(__dirname, DICTIONARY_DIRECTORY);
        if (!existsSync(path)) {
            mkdirSync(path, { recursive: true });
        }
    }

    private getDictionaryByFilename(filename: string): BasicDictionaryData {
        if (!this.existsFile(filename)) throw new HttpException(NO_DICTIONARY_WITH_NAME(filename), StatusCodes.NOT_FOUND);

        return this.readFile(filename);
    }

    private getEntryFromId(id: string, allowDefault = true): [dictionaryEntry: DictionaryEntry, dictionaryEntryIndex: number] {
        const dictionaryEntryIndex = this.dictionaryIndexes.entries.findIndex((index) => index.id === id);

        if (dictionaryEntryIndex === NOT_FOUND) throw new HttpException(NO_DICTIONARY_WITH_ID(id), StatusCodes.NOT_FOUND);

        const dictionaryEntry = this.dictionaryIndexes.entries[dictionaryEntryIndex];

        if (dictionaryEntry.isDefault && !allowDefault) throw new HttpException(CANNOT_USE_DEFAULT_DICTIONARY, StatusCodes.BAD_REQUEST);

        return [dictionaryEntry, dictionaryEntryIndex];
    }

    private patchDictionary(dictionaryEntry: DictionaryEntry, dictionary: BasicDictionaryData, updateInfo: DictionaryUpdateInfo): void {
        if (updateInfo.title) {
            dictionaryEntry.title = updateInfo.title;
            dictionary.title = updateInfo.title;
        }
        if (updateInfo.description) {
            dictionaryEntry.description = updateInfo.description;
            dictionary.description = updateInfo.description;
        }
    }

    private readDictionaryIndexes(): DictionaryIndexes {
        if (!this.existsFile(DICTIONARY_INDEX_FILENAME)) {
            this.restore();
        }

        return this.readFile(DICTIONARY_INDEX_FILENAME);
    }

    private updateDictionaryIndex(): void {
        this.writeFile(DICTIONARY_INDEX_FILENAME, this.dictionaryIndexes);
    }

    private getDefaultDictionaryIndexFile(): DictionaryIndexes {
        try {
            const dictionary = this.getDictionaryByFilename(DEFAULT_DICTIONARY_FILENAME);
            return {
                entries: [
                    {
                        title: dictionary.title,
                        description: dictionary.description,
                        id: uuidv4(),
                        isDefault: true,
                        filename: DEFAULT_DICTIONARY_FILENAME,
                    },
                ],
            };
        } catch (exception) {
            throw new HttpException(DEFAULT_DICTIONARY_NOT_FOUND, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    private entryToDictionarySummary(dictionaryEntry: DictionaryEntry): DictionarySummary {
        return {
            title: dictionaryEntry.title,
            description: dictionaryEntry.description,
            id: dictionaryEntry.id,
            isDefault: dictionaryEntry.isDefault,
        };
    }

    private readFile<T>(filename: string): T {
        return JSON.parse(readFileSync(this.getAbsolutePath(filename), 'utf-8'));
    }

    private readDir(): string[] {
        return readdirSync(this.getAbsolutePath('/'));
    }

    private writeFile<T>(filename: string, content: T): void {
        writeFileSync(this.getAbsolutePath(filename), JSON.stringify(content));
    }

    private deleteFile(filename: string): void {
        unlinkSync(this.getAbsolutePath(filename));
    }

    private existsFile(filename: string): boolean {
        return existsSync(this.getAbsolutePath(filename));
    }

    private getAbsolutePath(filename: string): string {
        return join(__dirname, DICTIONARY_DIRECTORY, filename);
    }
}
