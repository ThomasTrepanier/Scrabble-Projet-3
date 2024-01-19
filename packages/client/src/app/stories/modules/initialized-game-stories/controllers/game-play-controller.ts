import { Injectable } from '@angular/core';
import { GameUpdateData } from '@app/classes/communication';
import { Message } from '@app/classes/communication/message';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class GamePlayController {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    sendAction(): void {
        alert('Send action!');
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    sendMessage(): void {}

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    sendError(): void {}

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    handleReconnection(): void {}

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    handleDisconnection(): void {}

    observeGameUpdate(): Observable<GameUpdateData> {
        return new Subject<GameUpdateData>();
    }

    observeNewMessage(): Observable<Message | null> {
        return new Subject<Message | null>();
    }

    observeActionDone(): Observable<void> {
        return new Subject();
    }
}
