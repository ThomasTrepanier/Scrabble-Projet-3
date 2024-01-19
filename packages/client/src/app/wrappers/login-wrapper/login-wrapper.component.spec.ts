import { Location } from '@angular/common';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { LoginContainerComponent } from '@app/components/login-container/login-container.component';
import { INVALID_CREDENTIALS, LOGIN_ERROR, USER_ALREADY_LOGGED } from '@app/constants/authentification-constants';
import { ROUTE_HOME } from '@app/constants/routes-constants';
import { AlertService } from '@app/services/alert-service/alert.service';
import { AuthenticationService } from '@app/services/authentication-service/authentication.service';
import { UserLoginCredentials, UserSession } from '@common/models/user';
import { Subject } from 'rxjs';
import { LoginWrapperComponent } from './login-wrapper.component';

const USER_CREDENTIALS: UserLoginCredentials = {
    email: 'email',
    password: 'password',
};

@Component({
    template: '<p>Bonjour</p>',
})
export class DefaultComponent {}

describe('LoginWrapperComponent', () => {
    let component: LoginWrapperComponent;
    let fixture: ComponentFixture<LoginWrapperComponent>;
    let authenticationService: jasmine.SpyObj<AuthenticationService>;

    beforeEach(async () => {
        authenticationService = jasmine.createSpyObj(AuthenticationService, ['login']);

        await TestBed.configureTestingModule({
            declarations: [LoginWrapperComponent, LoginContainerComponent],
            imports: [
                HttpClientTestingModule,
                RouterTestingModule.withRoutes([{ path: 'home', component: DefaultComponent }]),
                MatSnackBarModule,
                BrowserAnimationsModule,
            ],
            providers: [{ provide: AuthenticationService, useValue: authenticationService }, AlertService],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LoginWrapperComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('handleLogin', () => {
        it('should navigate to home on login', fakeAsync(() => {
            const location = TestBed.inject(Location);
            const loginSubject = new Subject<UserSession>();
            authenticationService.login.and.returnValue(loginSubject);

            component.handleLogin(USER_CREDENTIALS);

            loginSubject.next();

            tick();

            expect(location.path()).toEqual(ROUTE_HOME);
        }));

        describe('should call error on error', () => {
            let loginSubject: Subject<UserSession>;
            let spy: unknown;

            beforeEach(() => {
                loginSubject = new Subject<UserSession>();
                authenticationService.login.and.returnValue(loginSubject);

                const alertService = TestBed.inject(AlertService);
                spy = spyOn(alertService, 'error');
                component.handleLogin(USER_CREDENTIALS);
            });

            it('with error INVALID_CREDENTIALS if status is NotAcceptable', () => {
                const expectedErrorMessage = 'Error';
                loginSubject.error(new HttpErrorResponse({ error: expectedErrorMessage, status: HttpStatusCode.NotAcceptable }));
                expect(spy).toHaveBeenCalledWith(INVALID_CREDENTIALS, { log: expectedErrorMessage });
            });

            it('with error USER_ALREADY_LOGGED if status is Unauthorized', () => {
                const expectedErrorMessage = 'Error';
                loginSubject.error(new HttpErrorResponse({ error: expectedErrorMessage, status: HttpStatusCode.Unauthorized }));
                expect(spy).toHaveBeenCalledWith(USER_ALREADY_LOGGED, { log: expectedErrorMessage });
            });

            it('with generic error if status is other', () => {
                const expectedErrorMessage = 'Error';
                loginSubject.error(new HttpErrorResponse({ error: expectedErrorMessage, status: HttpStatusCode.InternalServerError }));
                expect(spy).toHaveBeenCalledWith(LOGIN_ERROR, { log: expectedErrorMessage });
            });
        });
    });
});
