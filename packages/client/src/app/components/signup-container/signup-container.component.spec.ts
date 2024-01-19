/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserSignupInformation } from '@common/models/user';
import { IconComponent } from '@app/components/icon/icon.component';
import { SignupContainerComponent } from './signup-container.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SrcDirective } from '@app/directives/src-directive/src.directive';

const DEFAULT_CREDENTIALS: UserSignupInformation = {
    avatar: 'avatar',
    username: 'Ahmad',
    password: 'Faour#103',
    email: 'jdg@machine.epm',
};

const INVALID_EMAIL = '69';
const INVALID_USERNAME = '';

describe('SignupContainerComponent', () => {
    let component: SignupContainerComponent;
    let fixture: ComponentFixture<SignupContainerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SignupContainerComponent, IconComponent, SrcDirective],
            imports: [MatTooltipModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SignupContainerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    const setValidFormValues = () => {
        component.signupForm.patchValue({ ...DEFAULT_CREDENTIALS, confirmPassword: DEFAULT_CREDENTIALS.password });
    };

    const setInvalidFormValues = () => {
        component.signupForm.patchValue({ ...DEFAULT_CREDENTIALS, confirmPassword: `${DEFAULT_CREDENTIALS.password}-invalid` });
    };

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('signupForm', () => {
        it('should be created', () => {
            expect(component.signupForm).toBeTruthy();
        });
    });

    describe('onSubmit', () => {
        it('should set hasBeenSubmitted to true', () => {
            component['hasBeenSubmitted'] = false;
            component.onSubmit();

            expect(component['hasBeenSubmitted']).toBeTrue();
        });

        describe('HAPPY PATH - Form is valid', () => {
            it('should emit user credentials', () => {
                const signupSpy = spyOn(component.signup, 'next').and.callFake(() => {});

                setValidFormValues();
                component.onSubmit();
                expect(signupSpy).toHaveBeenCalledWith(DEFAULT_CREDENTIALS);
            });
        });

        describe('SAD PATH - Form is invalid', () => {
            it('should NOT emit user credentials', () => {
                const signupSpy = spyOn(component.signup, 'next').and.callFake(() => {});

                component.signupForm.patchValue({ ...DEFAULT_CREDENTIALS, confirmPassword: `${DEFAULT_CREDENTIALS.password}-invalid` });
                component.onSubmit();
                expect(signupSpy).not.toHaveBeenCalled();
            });

            it('should mark all fields as touched', () => {
                const touchedSpy = spyOn(component.signupForm, 'markAllAsTouched').and.callFake(() => {});

                component.signupForm.patchValue({ ...DEFAULT_CREDENTIALS, confirmPassword: `${DEFAULT_CREDENTIALS.password}-invalid` });
                component.onSubmit();
                expect(touchedSpy).toHaveBeenCalled();
            });
        });
    });

    describe('isFormValid', () => {
        it('should return true if form has NOT been submitted', () => {
            setInvalidFormValues();
            component['hasBeenSubmitted'] = false;

            expect(component.isFormValid()).toBeTrue();
        });

        it('should return true if form is valid', () => {
            setValidFormValues();
            component['hasBeenSubmitted'] = false;

            expect(component.isFormValid()).toBeTrue();
        });

        it('should return false if form is invalid or has been submitted', () => {
            setInvalidFormValues();
            component['hasBeenSubmitted'] = true;

            expect(component.isFormValid()).toBeFalse();
        });
    });

    describe('handleEmailLoseFocus', () => {
        let checkEmailSpy: any;

        beforeEach(() => {
            checkEmailSpy = spyOn(component.checkEmailUnicity, 'next').and.callFake(() => {});
        });

        describe('HAPPY-PATH - Email is valid', () => {
            it('should emit checkEmailUnicity event', () => {
                setValidFormValues();
                const expectedEmail = component.signupForm.get('email')?.value;

                component.handleEmailLoseFocus();

                expect(checkEmailSpy).toHaveBeenCalledWith(expectedEmail);
            });
        });

        describe('SAD-PATH - Email is invalid', () => {
            it('should NOT emit checkEmailUnicity event', () => {
                component.signupForm.get('email')?.patchValue(INVALID_EMAIL);

                component.handleEmailLoseFocus();

                expect(checkEmailSpy).not.toHaveBeenCalled();
            });
        });
    });

    describe('handleUsernameLoseFocus', () => {
        let checkUsernameSpy: any;

        beforeEach(() => {
            checkUsernameSpy = spyOn(component.checkUsernameUnicity, 'next').and.callFake(() => {});
        });

        describe('HAPPY-PATH - Username is valid', () => {
            it('should emit checkUsernameUnicity event', () => {
                setValidFormValues();
                const expectedUsername = component.signupForm.get('username')?.value;

                component.handleUsernameLoseFocus();

                expect(checkUsernameSpy).toHaveBeenCalledWith(expectedUsername);
            });
        });

        describe('SAD-PATH - Username is invalid', () => {
            it('should NOT emit checkUsernameUnicity event', () => {
                component.signupForm.get('username')?.patchValue(INVALID_USERNAME);

                component.handleUsernameLoseFocus();

                expect(checkUsernameSpy).not.toHaveBeenCalled();
            });
        });
    });
});
