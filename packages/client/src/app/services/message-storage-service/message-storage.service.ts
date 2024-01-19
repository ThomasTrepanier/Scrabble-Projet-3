import { Injectable } from '@angular/core';
import { Message } from '@app/classes/communication/message';
import { MESSAGE_STORAGE_KEY } from '@app/constants/session-storage-constants';

@Injectable({
    providedIn: 'root',
})
export class MessageStorageService {
    constructor() {
        this.initializeMessages();
    }

    initializeMessages(): void {
        if (!window.sessionStorage.getItem(MESSAGE_STORAGE_KEY)) window.sessionStorage.setItem(MESSAGE_STORAGE_KEY, JSON.stringify([]));
    }

    getMessages(): Message[] {
        const localMessages = window.sessionStorage.getItem(MESSAGE_STORAGE_KEY);
        return localMessages ? JSON.parse(localMessages) : [];
    }

    saveMessage(newMessage: Message): void {
        const localMessages: Message[] = this.getMessages();
        localMessages.push(newMessage);
        window.sessionStorage.setItem(MESSAGE_STORAGE_KEY, JSON.stringify(localMessages));
    }

    resetMessages(): void {
        window.sessionStorage.clear();
    }
}
