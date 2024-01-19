import { Injectable } from '@angular/core';
import { AuthenticationController } from '@app/controllers/authentication-controller/authentication.controller';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class UserValidatorService {
    constructor(private readonly authenticationController: AuthenticationController) {}

    validateUsername(username: string): Observable<boolean> {
        return this.authenticationController.validateUsername(username).pipe(map((res) => res.isAvailable));
    }

    validateEmail(email: string): Observable<boolean> {
        return this.authenticationController.validateEmail(email).pipe(map((res) => res.isAvailable));
    }
}
