import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
    CANNOT_VERIFY_EMAIL_UNICITY,
    CANNOT_VERIFY_USERNAME_UNICITY,
    INVALID_SIGNUP_INFORMATION,
    SIGNUP_ERROR,
} from '@app/constants/authentification-constants';
import { ROUTE_HOME } from '@app/constants/routes-constants';
import { AlertService } from '@app/services/alert-service/alert.service';
import { AuthenticationService } from '@app/services/authentication-service/authentication.service';
import { UserValidatorService } from '@app/services/user-validator/user-validator.service';
import { UserSignupInformation } from '@common/models/user';

@Component({
    selector: 'app-signup-wrapper',
    templateUrl: './signup-wrapper.component.html',
    styleUrls: ['./signup-wrapper.component.scss'],
})
export class SignupWrapperComponent {
    isEmailTaken: boolean = false;
    isUsernameTaken: boolean = false;

    constructor(
        private readonly authenticationService: AuthenticationService,
        private readonly userValidatorService: UserValidatorService,
        private readonly alertService: AlertService,
        private readonly router: Router,
    ) {}

    handleSignup(userCredentials: UserSignupInformation): void {
        this.authenticationService.signup(userCredentials).subscribe(
            () => {
                this.router.navigate([ROUTE_HOME]);
            },
            (error: HttpErrorResponse) => {
                this.alertService.error(error.status === HttpStatusCode.NotAcceptable ? INVALID_SIGNUP_INFORMATION : SIGNUP_ERROR);
                this.handleCheckEmailUnicity(userCredentials.email);
                this.handleCheckUsernameUnicity(userCredentials.username);
            },
        );
    }

    handleCheckEmailUnicity(email: string): void {
        this.userValidatorService.validateEmail(email).subscribe(
            (isAvailable) => (this.isEmailTaken = !isAvailable),
            (error) => {
                this.alertService.error(CANNOT_VERIFY_EMAIL_UNICITY, { log: error });
            },
        );
    }

    handleCheckUsernameUnicity(username: string): void {
        this.userValidatorService.validateUsername(username).subscribe(
            (isAvailable) => (this.isUsernameTaken = !isAvailable),
            (error) => {
                this.alertService.error(CANNOT_VERIFY_USERNAME_UNICITY, { log: error });
            },
        );
    }
}
