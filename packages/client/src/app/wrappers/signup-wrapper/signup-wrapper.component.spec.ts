import { Location } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { SignupContainerComponent } from '@app/components/signup-container/signup-container.component';
import { ROUTE_HOME } from '@app/constants/routes-constants';
import { SrcDirective } from '@app/directives/src-directive/src.directive';
import { AlertService } from '@app/services/alert-service/alert.service';
import { AuthenticationService } from '@app/services/authentication-service/authentication.service';
import { UserValidatorService } from '@app/services/user-validator/user-validator.service';
import { UserSession, UserSignupInformation } from '@common/models/user';
import { Subject } from 'rxjs';
import { SignupWrapperComponent } from './signup-wrapper.component';

const USER_CREDENTIALS: UserSignupInformation = {
    avatar: 'avatar',
    email: 'email',
    password: 'password',
    username: 'username',
};

@Component({
    template: '<p>Bonjour</p>',
})
export class DefaultComponent {}

describe('SignupWrapperComponent', () => {
    let component: SignupWrapperComponent;
    let fixture: ComponentFixture<SignupWrapperComponent>;
    let authenticationService: jasmine.SpyObj<AuthenticationService>;
    let userValidatorService: jasmine.SpyObj<UserValidatorService>;

    beforeEach(async () => {
        authenticationService = jasmine.createSpyObj(AuthenticationService, ['signup']);
        userValidatorService = jasmine.createSpyObj(UserValidatorService, ['validateEmail', 'validateUsername']);

        await TestBed.configureTestingModule({
            declarations: [SignupWrapperComponent, SignupContainerComponent, SrcDirective],
            imports: [
                HttpClientTestingModule,
                RouterTestingModule.withRoutes([{ path: 'home', component: DefaultComponent }]),
                MatSnackBarModule,
                MatMenuModule,
                BrowserAnimationsModule,
            ],
            providers: [
                { provide: AuthenticationService, useValue: authenticationService },
                { provide: UserValidatorService, useValue: userValidatorService },
                AlertService,
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SignupWrapperComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('handleSignup', () => {
        it('should navigate to home on signup', fakeAsync(() => {
            const location = TestBed.inject(Location);
            const signupSubject = new Subject<UserSession>();
            authenticationService.signup.and.returnValue(signupSubject);

            component.handleSignup(USER_CREDENTIALS);

            signupSubject.next();

            tick();

            expect(location.path()).toEqual(ROUTE_HOME);
        }));

        it('should call error on error', () => {
            const signupSubject = new Subject<UserSession>();
            authenticationService.signup.and.returnValue(signupSubject);

            const alertService = TestBed.inject(AlertService);
            const spy = spyOn(alertService, 'error');

            component.handleSignup(USER_CREDENTIALS);

            signupSubject.error(new Error());

            expect(spy).toHaveBeenCalled();
        });
    });

    describe('handleCheckEmailUnicity', () => {
        it('should set isEmailTaken to false if is available', () => {
            const isAvailable = true;
            const validateEmailSubject = new Subject<boolean>();
            component.isEmailTaken = undefined as unknown as boolean;
            userValidatorService.validateEmail.and.returnValue(validateEmailSubject);

            component.handleCheckEmailUnicity('');

            validateEmailSubject.next(isAvailable);

            expect(component.isEmailTaken).toEqual(!isAvailable);
        });

        it('should set isEmailTaken to true if is no available', () => {
            const isAvailable = false;
            const validateEmailSubject = new Subject<boolean>();
            component.isEmailTaken = undefined as unknown as boolean;
            userValidatorService.validateEmail.and.returnValue(validateEmailSubject);

            component.handleCheckEmailUnicity('');

            validateEmailSubject.next(isAvailable);

            expect(component.isEmailTaken).toEqual(!isAvailable);
        });

        it('should call error on error', () => {
            const validateEmailSubject = new Subject<boolean>();
            userValidatorService.validateEmail.and.returnValue(validateEmailSubject);

            const alertService = TestBed.inject(AlertService);
            const spy = spyOn(alertService, 'error');

            component.handleCheckEmailUnicity('');

            validateEmailSubject.error(new Error());

            expect(spy).toHaveBeenCalled();
        });
    });

    describe('handleCheckUsernameUnicity', () => {
        it('should set isUsernameTaken to false if is available', () => {
            const isAvailable = true;
            const validateUsernameSubject = new Subject<boolean>();
            component.isUsernameTaken = undefined as unknown as boolean;
            userValidatorService.validateUsername.and.returnValue(validateUsernameSubject);

            component.handleCheckUsernameUnicity('');

            validateUsernameSubject.next(isAvailable);

            expect(component.isUsernameTaken).toEqual(!isAvailable);
        });

        it('should set isUsernameTaken to true if is no available', () => {
            const isAvailable = false;
            const validateUsernameSubject = new Subject<boolean>();
            component.isUsernameTaken = undefined as unknown as boolean;
            userValidatorService.validateUsername.and.returnValue(validateUsernameSubject);

            component.handleCheckUsernameUnicity('');

            validateUsernameSubject.next(isAvailable);

            expect(component.isUsernameTaken).toEqual(!isAvailable);
        });

        it('should call error on error', () => {
            const validateUsernameSubject = new Subject<boolean>();
            userValidatorService.validateUsername.and.returnValue(validateUsernameSubject);

            const alertService = TestBed.inject(AlertService);
            const spy = spyOn(alertService, 'error');

            component.handleCheckUsernameUnicity('');

            validateUsernameSubject.error(new Error());

            expect(spy).toHaveBeenCalled();
        });
    });
});
