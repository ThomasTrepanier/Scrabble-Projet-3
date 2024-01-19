import { Injectable } from '@angular/core';
import { GameHistoryController } from '@app/controllers/game-history-controller/game-history.controller';
import { catchError, retry } from 'rxjs/operators';
import { GameHistoryForUser } from '@common/models/game-history';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class GameHistoryService {
    constructor(private readonly gameHistoryController: GameHistoryController) {}

    getGameHistories(): Observable<GameHistoryForUser[]> {
        return this.gameHistoryController.getGameHistories().pipe(retry(1));
    }

    async resetGameHistories(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.gameHistoryController
                .resetGameHistories()
                .pipe(
                    retry(1),
                    catchError((error, caught) => {
                        reject(error);
                        return caught;
                    }),
                )
                .subscribe(() => {
                    resolve();
                });
        });
    }
}
