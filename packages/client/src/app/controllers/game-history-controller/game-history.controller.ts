import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GameHistoryForUser } from '@common/models/game-history';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class GameHistoryController {
    private endpoint = `${environment.serverUrl}/gameHistories`;

    constructor(private readonly http: HttpClient) {}

    getGameHistories(): Observable<GameHistoryForUser[]> {
        return this.http.get<GameHistoryForUser[]>(this.endpoint);
    }

    resetGameHistories(): Observable<void> {
        return this.http.delete<void>(this.endpoint);
    }
}
