import { BasicDictionaryData, CompleteDictionaryData, DictionaryData, DictionarySummary } from '@app/classes/communication/dictionary-data';
import { Dictionary } from '@app/classes/dictionary';
import { createStubInstance } from 'sinon';
import DictionaryService from './dictionary.service';

const TEST_TITLE = 'Test dictionary';
const TEST_WORDS = ['ab', 'abc', 'abcd', 'abcde'];
export const TEST_DICTIONARY: CompleteDictionaryData = {
    title: TEST_TITLE,
    description: 'Dictionary for testing',
    words: TEST_WORDS,
    isDefault: true,
    id: 'id',
};

const getDictionaryTestService = (dictionary: Dictionary = new Dictionary(TEST_DICTIONARY)) =>
    createStubInstance(DictionaryService, {
        getDictionary: dictionary,
    });

export { getDictionaryTestService };

export const DICTIONARY_1: DictionaryData = {
    title: 'title1',
    description: 'description1',
    words: ['word11', 'word12'],
    isDefault: true,
};

export const DICTIONARY_1_ID = 'id-dictionary1';

export const DICTIONARY_2: DictionaryData = {
    title: 'title2',
    description: 'description2',
    words: ['word21', 'word22'],
    isDefault: false,
};

export const DICTIONARY_3: DictionaryData = {
    title: 'title3',
    description: 'description3',
    words: ['word31', 'word32'],
    isDefault: false,
};

export const INITIAL_DICTIONARIES: DictionaryData[] = [DICTIONARY_1, DICTIONARY_2, DICTIONARY_3];

export const NEW_VALID_DICTIONARY: DictionaryData = {
    title: 'newtitle',
    description: 'newdescription',
    words: ['newword1', 'newword2'],
    isDefault: false,
};

export const NEW_INVALID_DICTIONARY: DictionaryData = {
    title: DICTIONARY_2.title,
    description: 'newdescription',
    words: ['newword1', 'newword2'],
    isDefault: false,
};

export const VALID_DICTIONARY: BasicDictionaryData = {
    title: 'validUniqueTitle',
    description: 'valid Desicrition',
    words: ['aa', 'zythums'],
};

export const SAME_TITLE_DICTIONARY: BasicDictionaryData = {
    title: 'title1',
    description: 'valid Desicrition',
    words: ['aa', 'zythums'],
};

export const MISSING_PROPERTY_DICTIONARY: BasicDictionaryData = {
    description: 'valid Desicrition',
    words: ['aa', 'zythums'],
} as unknown as BasicDictionaryData;

export const LONG_TITLE_DICTIONARY: BasicDictionaryData = {
    title: 'title is very longggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg',
    description: 'valid Desicrition',
    words: ['aa', 'zythums'],
};

export const INVALID_TYPES_DICTIONARY: BasicDictionaryData = {
    title: ['validUniqueTitle'],
    description: 123,
    words: ['aa', 'zythums'],
} as unknown as BasicDictionaryData;

export const INVALID_ARRAY_TYPES_DICTIONARY: BasicDictionaryData = {
    title: 'validUniqueTitle',
    description: 'valid Desicrition',
    words: [1, [], true],
} as unknown as BasicDictionaryData;

export const ADDITIONAL_PROPERTY_DICTIONARY: BasicDictionaryData = {
    title: 'validUniqueTitle',
    description: 'valid Desicrition',
    words: ['aa', 'zythums'],
    isDefault: true,
} as unknown as BasicDictionaryData;

export const INVALID_WORDS_DICTIONARY_1: BasicDictionaryData = {
    title: 'validUniqueTitle',
    description: 'valid Desicrition',
    words: [' s '],
};

export const INVALID_WORDS_DICTIONARY_2: BasicDictionaryData = {
    title: 'validUniqueTitle',
    description: 'valid Desicrition',
    words: ['école'],
};

export const INVALID_WORDS_DICTIONARY_3: BasicDictionaryData = {
    title: 'validUniqueTitle',
    description: 'valid Desicrition',
    words: ["l'a!"],
};

export const INVALID_WORDS_DICTIONARY_4: BasicDictionaryData = {
    title: 'validUniqueTitle',
    description: 'valid Desicrition',
    words: ['MAJUSCULE'],
};

export const INVALID_WORDS_DICTIONARY_5: BasicDictionaryData = {
    title: 'validUniqueTitle',
    description: 'valid Desicrition',
    words: ['troplongggggggggggggggggggggggggggggggggggggggggg'],
};

export const INVALID_WORDS_DICTIONARY_6: BasicDictionaryData = {
    title: 'validUniqueTitle',
    description: 'valid Desicrition',
    words: ['a'],
};

export const DEFAULT_SUMMARY: DictionarySummary = {
    title: 'dictionary',
    description: 'description',
    id: 'id',
    isDefault: false,
};
