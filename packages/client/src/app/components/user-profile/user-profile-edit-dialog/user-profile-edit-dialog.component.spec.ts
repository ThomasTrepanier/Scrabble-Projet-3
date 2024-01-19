import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SrcDirective } from '@app/directives/src-directive/src.directive';
import { AlertService } from '@app/services/alert-service/alert.service';
import { AuthenticationService } from '@app/services/authentication-service/authentication.service';
import { UserService } from '@app/services/user-service/user.service';

import { UserProfileEditDialogComponent } from './user-profile-edit-dialog.component';

describe('UserProfileEditDialogComponent', () => {
    let component: UserProfileEditDialogComponent;
    let fixture: ComponentFixture<UserProfileEditDialogComponent>;
    let dialogRef: jasmine.SpyObj<MatDialogRef<UserProfileEditDialogComponent>>;

    beforeEach(async () => {
        dialogRef = jasmine.createSpyObj(MatDialogRef, ['close']);

        await TestBed.configureTestingModule({
            declarations: [UserProfileEditDialogComponent, SrcDirective],
            imports: [HttpClientTestingModule, MatSnackBarModule, ReactiveFormsModule, BrowserAnimationsModule, MatDialogModule],
            providers: [
                {
                    provide: AuthenticationService,
                    useValue: jasmine.createSpyObj(AuthenticationService, ['signup', 'validateEmail', 'validateUsername']),
                },
                { provide: MAT_DIALOG_DATA, useValue: {} },
                { provide: MatDialogRef, useValue: dialogRef },
                AlertService,
                UserService,
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(UserProfileEditDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('onSubmit', () => {
        it('should call close', () => {
            component.username.setValue('username');
            component.avatarField.setValue('avatar');

            component.onSubmit();

            expect(dialogRef.close).toHaveBeenCalled();
        });
    });

    describe('getUsernameError', () => {
        it('should return undefined if on error', () => {
            component.username.setValue('username');
            component.avatarField.setValue('avatar');

            expect(component.getUsernameError()).toBeUndefined();
        });
    });
});
