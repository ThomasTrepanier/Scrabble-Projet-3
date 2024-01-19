/* eslint-disable  */
type CallbackSignature = (params: any) => void;

export class SocketTestHelper {
    on(event: string, callback: CallbackSignature): SocketTestHelper {
        if (!this.callbacks.has(event)) {
            this.callbacks.set(event, []);
        }

        this.callbacks.get(event)!.push(callback);

        return this;
    }

    emit(event: string, ...params: any): void {
        return;
    }

    disconnect(): void {
        return;
    }

    peerSideEmit(event: string, params?: any): void {
        if (!this.callbacks.has(event)) {
            return;
        }

        for (const callback of this.callbacks.get(event)!) {
            callback(params);
        }
    }

    private callbacks = new Map<string, CallbackSignature[]>();
}
