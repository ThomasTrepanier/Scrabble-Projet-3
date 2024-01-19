export type DisplayGameHistoryKeys = string;

export type DisplayGameHistoryColumns = {
    [Property in DisplayGameHistoryKeys]: string;
};

export type DisplayGameHistoryColumnsIteratorItem = { key: DisplayGameHistoryKeys; label: string };

export enum GameHistoryState {
    Ready = 'ready',
    Loading = 'loading',
    Error = 'error',
}
