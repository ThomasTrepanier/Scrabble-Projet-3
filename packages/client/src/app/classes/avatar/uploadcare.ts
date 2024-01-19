export interface Update {
    then: (callback: (document: ImageDocument) => void) => void;
    done: (callback: (document: ImageDocument) => void) => void;
}

export interface ImageDocument {
    cdnUrl: string;
    name: string;
    size: number;
    uuid: string;
}

export enum ImageDocumentProgressState {
    Ready = 'ready',
    Uploading = 'Uploading',
}

export interface ImageDocumentProgress {
    progress: number;
    uploadProgress: number;
    state: ImageDocumentProgressState;
}
