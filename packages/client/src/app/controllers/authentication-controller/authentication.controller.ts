import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractController } from '@app/controllers/abstract-controller';
import { UserFieldValidation, UserLoginCredentials, UserSession, UserSignupInformation } from '@common/models/user';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AuthenticationController extends AbstractController {
    constructor(private readonly http: HttpClient) {
        super('/authentification');
    }

    login(credentials: UserLoginCredentials): Observable<UserSession> {
        return this.http.post<UserSession>(this.url('/login'), credentials);
    }

    signup(credentials: UserSignupInformation): Observable<UserSession> {
        return this.http.post<UserSession>(this.url('/signup'), credentials);
    }

    validateToken(token: string): Observable<UserSession> {
        return this.http.post<UserSession>(this.url('/validate'), { token });
    }

    validateUsername(username: string): Observable<UserFieldValidation> {
        return this.http.post<UserFieldValidation>(this.url('/validateUsername'), { username });
    }

    validateEmail(email: string): Observable<UserFieldValidation> {
        return this.http.post<UserFieldValidation>(this.url('/validateEmail'), { email });
    }
}
