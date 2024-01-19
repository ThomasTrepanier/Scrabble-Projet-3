export type DisplayDictionaryKeys = keyof { title: string; description: string } | 'title' | 'description' | 'actions';

export type DisplayDictionaryColumns = {
    [Property in DisplayDictionaryKeys]: string;
};

export type DisplayDictionaryColumnsIteratorItem = { key: DisplayDictionaryKeys; label: string };

export enum DictionariesState {
    Ready = 'ready',
    Loading = 'loading',
    Error = 'error',
}
