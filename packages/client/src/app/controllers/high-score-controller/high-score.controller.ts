import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import SocketService from '@app/services/socket-service/socket.service';
import { HighScoreWithPlayers } from '@common/models/high-score';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class HighScoresController {
    private endpoint = `${environment.serverUrl}/highScores`;
    private highScoresListEvent: Subject<HighScoreWithPlayers[]> = new Subject<HighScoreWithPlayers[]>();

    constructor(private http: HttpClient, public socketService: SocketService) {
        this.configureSocket();
    }

    handleGetHighScores(): void {
        this.http.get(`${this.endpoint}`).subscribe();
    }

    resetHighScores(): void {
        this.http.delete(this.endpoint).subscribe(() => this.handleGetHighScores());
    }

    subscribeToHighScoresListEvent(serviceDestroyed$: Subject<boolean>, callback: (highScores: HighScoreWithPlayers[]) => void): void {
        this.highScoresListEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }

    private configureSocket(): void {
        this.socketService.on('highScoresList', (highScores: HighScoreWithPlayers[]) => {
            this.highScoresListEvent.next(highScores);
        });
    }
}
