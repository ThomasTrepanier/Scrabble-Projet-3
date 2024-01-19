import {
    BasicDictionaryData,
    CompleteDictionaryData,
    DictionarySummary,
    DictionaryUpdateInfo,
    DictionaryUsage,
} from '@app/classes/communication/dictionary-data';
import { Dictionary, DictionaryData } from '@app/classes/dictionary';
import { HttpException } from '@app/classes/http-exception/http-exception';
import {
    INVALID_DESCRIPTION_FORMAT,
    INVALID_DICTIONARY_FORMAT,
    INVALID_DICTIONARY_ID,
    INVALID_TITLE_FORMAT,
    MAX_DICTIONARY_DESCRIPTION_LENGTH,
    MAX_DICTIONARY_TITLE_LENGTH,
} from '@app/constants/dictionary-const';
import { NO_DEFAULT_DICTIONARY, ONE_HOUR_IN_MS } from '@app/constants/services-constants/dictionary-const';
import { MAXIMUM_WORD_LENGTH, MINIMUM_WORD_LENGTH } from '@app/constants/services-errors';
import DictionarySavingService from '@app/services/dictionary-saving-service/dictionary-saving.service';
import { env } from '@app/utils/environment/environment';
import Ajv, { ValidateFunction } from 'ajv';
import { StatusCodes } from 'http-status-codes';
import 'mock-fs'; // required when running test. Otherwise compiler cannot resolve fs, path and __dirname
import { Service } from 'typedi';

@Service()
export default class DictionaryService {
    private dictionaryValidator: ValidateFunction<{ [x: string]: unknown }>;
    private activeDictionaries: Map<string, DictionaryUsage> = new Map();

    constructor(private readonly dictionarySavingService: DictionarySavingService) {
        // eslint-disable-next-line no-console
        if (env.isTest) console.warn('DictionaryService should not be used in a test environment');
        this.initializeDictionaries();
    }

    useDictionary(id: string): DictionaryUsage {
        const dictionary: DictionaryUsage | undefined = this.activeDictionaries.get(id);
        if (!dictionary) throw new HttpException(INVALID_DICTIONARY_ID, StatusCodes.NOT_FOUND);

        dictionary.numberOfActiveGames++;
        dictionary.lastUse = new Date();

        return dictionary;
    }

    getDictionary(id: string): Dictionary {
        const dictionaryUsage = this.activeDictionaries.get(id);
        if (dictionaryUsage) return dictionaryUsage.dictionary;
        throw new HttpException(INVALID_DICTIONARY_ID, StatusCodes.NOT_FOUND);
    }

    getDefaultDictionary(): Dictionary {
        const summary = this.getAllDictionarySummaries().find((dictionary) => dictionary.isDefault);

        if (!summary) throw new Error(NO_DEFAULT_DICTIONARY);

        return this.getDictionary(summary.id);
    }

    stopUsingDictionary(id: string, forceDeleteIfUnused: boolean = false): void {
        const dictionaryUsage = this.activeDictionaries.get(id);
        if (!dictionaryUsage) return;
        dictionaryUsage.numberOfActiveGames--;
        this.deleteActiveDictionary(id, forceDeleteIfUnused);
    }

    validateDictionary(dictionaryData: BasicDictionaryData): boolean {
        if (!this.dictionaryValidator) this.createDictionaryValidator();
        return this.dictionaryValidator(dictionaryData) && this.isTitleValid(dictionaryData.title);
    }

    addNewDictionary(basicDictionaryData: BasicDictionaryData): void {
        if (!this.validateDictionary(basicDictionaryData)) throw new HttpException(INVALID_DICTIONARY_FORMAT, StatusCodes.FORBIDDEN);

        this.dictionarySavingService.addDictionary(basicDictionaryData);
    }

    restoreDictionaries(): void {
        this.dictionarySavingService.restore();
    }

    getAllDictionarySummaries(): DictionarySummary[] {
        const summaries = this.dictionarySavingService.getDictionarySummaries();

        summaries.forEach((summary) => this.initializeDictionary(summary.id));

        return summaries;
    }

    updateDictionary(updateInfo: DictionaryUpdateInfo): void {
        if (updateInfo.description && !this.isDescriptionValid(updateInfo.description))
            throw new HttpException(INVALID_DESCRIPTION_FORMAT, StatusCodes.FORBIDDEN);

        if (updateInfo.title && !this.isTitleValid(updateInfo.title)) throw new HttpException(INVALID_TITLE_FORMAT, StatusCodes.FORBIDDEN);

        this.dictionarySavingService.updateDictionary(updateInfo);
    }

    deleteDictionary(dictionaryId: string): void {
        this.dictionarySavingService.deleteDictionaryById(dictionaryId);

        const dictionaryUsage: DictionaryUsage | undefined = this.activeDictionaries.get(dictionaryId);

        if (dictionaryUsage) {
            dictionaryUsage.isDeleted = true;
            this.deleteActiveDictionary(dictionaryId);
        }
    }

    getDictionaryData(id: string): DictionaryData {
        return this.dictionarySavingService.getDictionaryById(id);
    }

    private initializeDictionaries(): void {
        const dictionariesId: string[] = this.getDictionariesId();
        dictionariesId.forEach((id: string) => this.initializeDictionary(id));
    }

    private getDictionariesId(): string[] {
        return this.dictionarySavingService.getDictionarySummaries().map((summary) => summary.id);
    }

    private initializeDictionary(id: string): void {
        if (this.activeDictionaries.has(id)) return;

        const dictionaryData: CompleteDictionaryData = { ...this.getDictionaryData(id), id };

        const dictionary = { numberOfActiveGames: 0, dictionary: new Dictionary(dictionaryData), isDeleted: false };
        this.activeDictionaries.set(id, dictionary);
    }

    private isTitleValid(title: string): boolean {
        return title.length < MAX_DICTIONARY_TITLE_LENGTH;
    }

    private isDescriptionValid(description: string): boolean {
        return description.length < MAX_DICTIONARY_DESCRIPTION_LENGTH;
    }

    private createDictionaryValidator(): void {
        const ajv = new Ajv();

        const schema = {
            type: 'object',
            properties: {
                title: { type: 'string', maxLength: MAX_DICTIONARY_TITLE_LENGTH },
                description: { type: 'string', maxLength: MAX_DICTIONARY_DESCRIPTION_LENGTH },
                words: {
                    type: 'array',
                    minItems: 1,
                    items: {
                        type: 'string',
                        pattern: `^[a-z]{${MINIMUM_WORD_LENGTH},${MAXIMUM_WORD_LENGTH}}$`,
                    },
                },
            },
            required: ['title', 'description', 'words'],
            additionalProperties: false,
        };

        this.dictionaryValidator = ajv.compile(schema);
    }

    private deleteActiveDictionary(dictionaryId: string, forceDeleteIfUnused: boolean = false): void {
        const dictionaryUsage: DictionaryUsage | undefined = this.activeDictionaries.get(dictionaryId);
        if (!dictionaryUsage) throw new HttpException(INVALID_DICTIONARY_ID, StatusCodes.NOT_FOUND);

        if (this.shouldDeleteActiveDictionary(dictionaryUsage, forceDeleteIfUnused)) {
            this.activeDictionaries.delete(dictionaryId);
        }
    }

    private shouldDeleteActiveDictionary(dictionaryUsage: DictionaryUsage, forceDeleteIfUnused: boolean = false): boolean {
        return (
            dictionaryUsage.numberOfActiveGames <= 0 && dictionaryUsage.isDeleted && (forceDeleteIfUnused || this.notUsedInLastHour(dictionaryUsage))
        );
    }

    private notUsedInLastHour(dictionaryUsage: DictionaryUsage): boolean {
        return dictionaryUsage.lastUse === undefined || Date.now() - dictionaryUsage.lastUse.getTime() > ONE_HOUR_IN_MS;
    }
}
