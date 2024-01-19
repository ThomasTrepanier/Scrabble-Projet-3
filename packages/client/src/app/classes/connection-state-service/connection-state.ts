export enum ConnectionState {
    Loading = 'Loading',
    Connected = 'Connected',
    Error = 'Error',
}

export enum InitializeState {
    Loading = 'loading',
    Trying = 'trying',
    Error = 'error',
    Ready = 'ready',
}

export interface AppState {
    state: InitializeState;
    message?: string;
}
