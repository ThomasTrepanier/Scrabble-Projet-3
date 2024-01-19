import { Injectable } from '@angular/core';
import { AuthenticationController } from '@app/controllers/authentication-controller/authentication.controller';
import { authenticationSettings, puzzleSettings } from '@app/utils/settings';
import { UserLoginCredentials, UserSession, UserSignupInformation } from '@common/models/user';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import SocketService from '@app/services/socket-service/socket.service';
import { UserService } from '@app/services/user-service/user.service';
import { TokenValidation } from '@app/classes/authentication/token-validation';
import { StatusError } from '@common/models/error';

@Injectable({
    providedIn: 'root',
})
export class AuthenticationService {
    constructor(
        private readonly authenticationController: AuthenticationController,
        private readonly userService: UserService,
        private readonly socketService: SocketService,
    ) {
        this.socketService.socketError.subscribe(this.handleSocketError.bind(this));
    }

    login(credentials: UserLoginCredentials): Observable<UserSession> {
        return this.authenticationController.login(credentials).pipe(tap(this.handleUserSessionInitialisation.bind(this)));
    }

    signup(credentials: UserSignupInformation): Observable<UserSession> {
        return this.authenticationController.signup(credentials).pipe(tap(this.handleUserSessionInitialisation.bind(this)));
    }

    signOut(): void {
        authenticationSettings.remove('token');
        this.socketService.disconnect();
        this.userService.user.next(undefined);
    }

    validateToken(): Observable<TokenValidation> {
        const token = authenticationSettings.getToken();

        if (!token) {
            authenticationSettings.remove('token');
            return of(TokenValidation.NoToken);
        }

        return this.authenticationController.validateToken(token).pipe(
            map((session) => {
                this.handleUserSessionInitialisation(session);
                return TokenValidation.Ok;
            }),
            catchError((err: HttpErrorResponse) => {
                if (err.status === HttpStatusCode.Unauthorized) {
                    return of(TokenValidation.AlreadyConnected);
                } else {
                    authenticationSettings.remove('token');
                    return of(TokenValidation.UnknownError);
                }
            }),
        );
    }

    private handleUserSessionInitialisation(session: UserSession): void {
        authenticationSettings.setToken(session.token);
        this.userService.user.next(session.user);
        this.socketService.connectSocket();

        if (session.user.username !== authenticationSettings.getUsername()) {
            authenticationSettings.setUsername(session.user.username);
            puzzleSettings.reset();
        }
    }

    private handleSocketError({ status }: StatusError): void {
        if (status === HttpStatusCode.Unauthorized) {
            this.signOut();
        }
    }
}
