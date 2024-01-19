import { Dictionary } from '@app/classes/dictionary';

export interface BasicDictionaryData {
    title: string;
    description: string;
    words: string[];
}

export interface DictionaryData extends BasicDictionaryData {
    isDefault: boolean;
}

export interface CompleteDictionaryData extends DictionaryData {
    id: string;
}

export interface DictionaryUsage {
    dictionary: Dictionary;
    numberOfActiveGames: number;
    isDeleted: boolean;
    lastUse?: Date;
}

export interface DictionarySummary {
    title: string;
    description: string;
    id: string;
    isDefault: boolean;
}

export interface DictionaryUpdateInfo {
    id: string;
    title?: string;
    description?: string;
}

export interface DictionaryEntry extends DictionarySummary {
    filename: string;
}

export interface DictionaryIndexes {
    entries: DictionaryEntry[];
}
