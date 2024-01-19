import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable, OnDestroy } from '@angular/core';
import SocketService from '@app/services/socket-service/socket.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class PlayerLeavesController implements OnDestroy {
    private resetGameEvent: EventEmitter<string> = new EventEmitter();
    private serviceDestroyed$: Subject<boolean> = new Subject();

    constructor(private http: HttpClient, public socketService: SocketService) {
        this.configureSocket();
    }

    ngOnDestroy(): void {
        this.serviceDestroyed$.next(true);
        this.serviceDestroyed$.complete();
    }

    handleLeaveGame(gameId: string): void {
        const endpoint = `${environment.serverUrl}/games/${gameId}/players/leave`;
        this.http.delete(endpoint).subscribe();
    }

    subscribeToResetGameEvent(serviceDestroyed$: Subject<boolean>, callback: () => void): void {
        this.resetGameEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }

    private configureSocket(): void {
        this.socketService.on('cleanup', () => {
            this.resetGameEvent.emit();
        });
    }
}
