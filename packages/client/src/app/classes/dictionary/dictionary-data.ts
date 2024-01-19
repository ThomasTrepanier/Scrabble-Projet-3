export interface BasicDictionaryData {
    title: string;
    description: string;
    words: string[];
}

export interface DictionaryData {
    title: string;
    description: string;
    words: string[];
}

export interface DictionaryUpdateInfo {
    id: string;
    title?: string;
    description?: string;
}
