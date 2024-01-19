import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthenticationController } from '@app/controllers/authentication-controller/authentication.controller';
import { authenticationSettings } from '@app/utils/settings';
import { PublicUser, UserLoginCredentials, UserSession, UserSignupInformation } from '@common/models/user';
import { Subject } from 'rxjs';
import { UserService } from '@app/services/user-service/user.service';
import { AuthenticationService } from './authentication.service';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { TokenValidation } from '@app/classes/authentication/token-validation';
import { MatDialogModule } from '@angular/material/dialog';

const DEFAULT_TOKEN = 'my-token';
const DEFAULT_CREDENTIALS: UserLoginCredentials = {
    email: 'email',
    password: 'password',
};
const DEFAULT_SIGNUP_INFO: UserSignupInformation = {
    avatar: 'avatar',
    email: 'a@a.a',
    password: 'password',
    username: 'username',
};
const DEFAULT_USER: PublicUser = {
    username: 'username',
    avatar: 'avatar',
    email: 'email@email.email',
};
const DEFAULT_USER_SESSION: UserSession = {
    token: DEFAULT_TOKEN,
    user: DEFAULT_USER,
};

describe('AuthenticationService', () => {
    let service: AuthenticationService;
    let authenticationController: jasmine.SpyObj<AuthenticationController>;

    beforeEach(() => {
        authenticationController = jasmine.createSpyObj('AuthenticationController', ['login', 'signup', 'validateToken']);
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, MatSnackBarModule, MatDialogModule],
            providers: [{ provide: AuthenticationController, useValue: authenticationController }, UserService],
        });
        service = TestBed.inject(AuthenticationService);
    });

    afterEach(() => {
        authenticationSettings.reset();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('login', () => {
        it('should set token if valid', () => {
            const subject = new Subject<UserSession>();
            authenticationController.login.and.returnValue(subject);

            service.login(DEFAULT_CREDENTIALS).subscribe();

            subject.next(DEFAULT_USER_SESSION);

            expect(authenticationSettings.getToken()).toEqual(DEFAULT_TOKEN);
        });

        it('should throw if login is invalid', (done) => {
            const subject = new Subject<UserSession>();
            authenticationController.login.and.returnValue(subject);

            service.login(DEFAULT_CREDENTIALS).subscribe(
                () => {
                    expect(false).toBeTrue();
                    done();
                },
                () => {
                    expect(true).toBeTrue();
                    done();
                },
            );

            subject.error(new Error());
        });
    });

    describe('signup', () => {
        it('should set token if valid', () => {
            const subject = new Subject<UserSession>();
            authenticationController.signup.and.returnValue(subject);

            service.signup(DEFAULT_SIGNUP_INFO).subscribe();

            subject.next(DEFAULT_USER_SESSION);

            expect(authenticationSettings.getToken()).toEqual(DEFAULT_TOKEN);
        });

        it('should throw if signup is invalid', (done) => {
            const subject = new Subject<UserSession>();
            authenticationController.signup.and.returnValue(subject);

            service.signup(DEFAULT_SIGNUP_INFO).subscribe(
                () => {
                    expect(false).toBeTrue();
                    done();
                },
                () => {
                    expect(true).toBeTrue();
                    done();
                },
            );

            subject.error(new Error());
        });
    });

    describe('signOut', () => {
        beforeEach(() => {
            // Login
            const subject = new Subject<UserSession>();
            authenticationController.signup.and.returnValue(subject);

            service.signup(DEFAULT_SIGNUP_INFO).subscribe();

            subject.next(DEFAULT_USER_SESSION);
        });

        it('should remove token', () => {
            service.signOut();
            expect(authenticationSettings.getToken()).toBeUndefined();
        });
    });

    describe('validateToken', () => {
        it('should return Ok if token is valid', (done) => {
            authenticationSettings.setToken(DEFAULT_TOKEN);
            const subject = new Subject<UserSession>();
            authenticationController.validateToken.and.returnValue(subject);

            service.validateToken().subscribe((val) => {
                expect(val).toEqual(TokenValidation.Ok);
                done();
            });

            subject.next(DEFAULT_USER_SESSION);
        });

        it('should return NoToken if no token', (done) => {
            const subject = new Subject<UserSession>();
            authenticationController.validateToken.and.returnValue(subject);

            service.validateToken().subscribe((val) => {
                expect(val).toEqual(TokenValidation.NoToken);
                done();
            });

            subject.next(DEFAULT_USER_SESSION);
        });

        it('should return AlreadyConnected if error is Unauthorized', (done) => {
            authenticationSettings.setToken(DEFAULT_TOKEN);
            const subject = new Subject<UserSession>();
            authenticationController.validateToken.and.returnValue(subject);

            service.validateToken().subscribe((val) => {
                expect(val).toEqual(TokenValidation.AlreadyConnected);
                done();
            });

            subject.error(new HttpErrorResponse({ status: HttpStatusCode.Unauthorized }));
        });

        it('should return UnknownError if token is invalid', (done) => {
            authenticationSettings.setToken(DEFAULT_TOKEN);
            const subject = new Subject<UserSession>();
            authenticationController.validateToken.and.returnValue(subject);

            service.validateToken().subscribe((val) => {
                expect(val).toEqual(TokenValidation.UnknownError);
                done();
            });

            subject.error(new Error());
        });
    });
});
