import { Injectable } from '@angular/core';
import { BehaviorSubject, of, Observable } from 'rxjs';
import { DatabaseService } from '@app/services/database-service/database.service';
import { AppState, InitializeState } from '@app/classes/connection-state-service/connection-state';
import {
    INVALID_CONNECTION_CONTENT,
    INVALID_CONNECTION_RETURN,
    INVALID_CONNECTION_TITLE,
    RECONNECTION_DELAY,
    RECONNECTION_RETRIES,
    STATE_ERROR_DATABASE_NOT_CONNECTED_MESSAGE,
    STATE_ERROR_DATABASE_NOT_CONNECTED_MESSAGE_TRY_AGAIN,
    STATE_LOADING_MESSAGE,
} from '@app/constants/services-errors';
import { catchError, delay, map, retryWhen, take } from 'rxjs/operators';
import { AuthenticationService } from '@app/services/authentication-service/authentication.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DefaultDialogComponent } from '@app/components/default-dialog/default-dialog.component';
import { TokenValidation } from '@app/classes/authentication/token-validation';
import { ROUTE_LOGIN } from '@app/constants/routes-constants';

@Injectable({
    providedIn: 'root',
})
export class InitializerService {
    state: BehaviorSubject<AppState>;

    constructor(
        private readonly databaseService: DatabaseService,
        private readonly authenticationService: AuthenticationService,
        private readonly router: Router,
        private readonly dialog: MatDialog,
    ) {
        this.state = new BehaviorSubject<AppState>({
            state: InitializeState.Loading,
            message: STATE_LOADING_MESSAGE,
        });
    }

    initialize(): void {
        (async () => {
            const connectedToDatabase = await this.pingDatabase().toPromise();

            if (!connectedToDatabase) {
                this.state.next({
                    state: InitializeState.Error,
                    message: STATE_ERROR_DATABASE_NOT_CONNECTED_MESSAGE_TRY_AGAIN,
                });

                return;
            }

            const validation = await this.authenticationService.validateToken().toPromise();

            if (validation === TokenValidation.AlreadyConnected) {
                this.handleInvalidConnection();
            } else {
                // Force reactivate guard to redirect if needed
                this.router.navigate([this.router.url], { queryParams: { redirect: true } });

                this.state.next({ state: InitializeState.Ready });
            }
        })();
    }

    private pingDatabase(): Observable<boolean> {
        return this.databaseService.ping().pipe(
            retryWhen((errors) => {
                this.state.next({
                    state: InitializeState.Trying,
                    message: STATE_ERROR_DATABASE_NOT_CONNECTED_MESSAGE,
                });
                return errors.pipe(delay(RECONNECTION_DELAY), take(RECONNECTION_RETRIES));
            }),
            map(() => true),
            catchError(() => of(false)),
            take(1),
        );
    }

    private handleInvalidConnection(): void {
        this.dialog.open(DefaultDialogComponent, {
            closeOnNavigation: true,
            disableClose: true,
            data: {
                title: INVALID_CONNECTION_TITLE,
                content: INVALID_CONNECTION_CONTENT,
                buttons: [
                    {
                        content: INVALID_CONNECTION_RETURN,
                        closeDialog: true,
                        action: () => {
                            this.authenticationService.signOut();
                            this.router.navigate([ROUTE_LOGIN]);
                            this.state.next({ state: InitializeState.Ready });
                        },
                    },
                ],
            },
        });
    }
}
