import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
    CANNOT_VERIFY_USERNAME_UNICITY,
    USERNAME_IS_INVALID,
    USERNAME_IS_REQUIRED,
    USERNAME_IS_TOO_LONG,
} from '@app/constants/authentification-constants';
import { AVATARS } from '@app/constants/avatar-constants';
import { NAME_VALIDATION } from '@app/constants/name-validation';
import { AlertService } from '@app/services/alert-service/alert.service';
import { UserValidatorService } from '@app/services/user-validator/user-validator.service';
import { EditableUserFields } from '@common/models/user';

@Component({
    selector: 'app-user-profile-edit-dialog',
    templateUrl: './user-profile-edit-dialog.component.html',
    styleUrls: ['./user-profile-edit-dialog.component.scss'],
})
export class UserProfileEditDialogComponent implements OnInit {
    form: FormGroup;
    avatars = AVATARS;
    isUsernameTaken: boolean;
    lastUsernameValue: string;
    initialUsernameValue: string;

    constructor(
        private readonly dialogRef: MatDialogRef<UserProfileEditDialogComponent>,
        @Inject(MAT_DIALOG_DATA) private readonly initialValues: EditableUserFields,
        private readonly userValidatorService: UserValidatorService,
        private readonly alertService: AlertService,
    ) {
        this.isUsernameTaken = false;
        this.initialUsernameValue = this.initialValues.username ?? '';

        this.form = new FormGroup({
            username: new FormControl(this.initialValues.username, [
                Validators.required,
                Validators.minLength(1),
                Validators.maxLength(NAME_VALIDATION.maxLength),
                Validators.pattern(NAME_VALIDATION.rule),
                this.usernameTakenValidator(),
            ]),
            avatar: new FormControl(this.initialValues.avatar, [Validators.required]),
        });
    }

    get username(): FormControl {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.form.get('username')! as FormControl;
    }

    get avatarField(): FormControl {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.form.get('avatar')! as FormControl;
    }

    ngOnInit(): void {
        this.username.valueChanges.subscribe(() => {
            if (this.username.value === this.lastUsernameValue) return;
            this.lastUsernameValue = this.username.value;

            if (this.initialUsernameValue === this.username.value) {
                this.isUsernameTaken = false;
                this.username.updateValueAndValidity();
                return;
            }
            this.userValidatorService.validateUsername(this.username.value).subscribe(
                (isAvailable) => {
                    this.isUsernameTaken = !isAvailable;
                    this.username.updateValueAndValidity();
                },
                (error) => {
                    this.alertService.error(CANNOT_VERIFY_USERNAME_UNICITY, { log: error });
                },
            );
        });
    }

    isFormInvalid(): boolean {
        return this.form.invalid;
    }

    onSubmit(): void {
        if (this.form.invalid) return;

        const edits: EditableUserFields = {
            username: this.username.value,
            avatar: this.avatarField.value,
        };
        this.dialogRef.close(edits);
    }

    getUsernameError(): string | undefined {
        if (this.username.hasError('required') || this.username.hasError('minlength')) {
            return USERNAME_IS_REQUIRED;
        }
        if (this.username.hasError('maxlength')) {
            return USERNAME_IS_TOO_LONG(this.username.getError('maxlength').requiredLength, this.username.getError('maxlength').actualLength);
        }
        if (this.username.hasError('pattern')) {
            return USERNAME_IS_INVALID;
        }
        if (this.username.hasError('usernameTaken')) {
            return CANNOT_VERIFY_USERNAME_UNICITY;
        }

        return undefined;
    }

    private usernameTakenValidator(): ValidatorFn {
        return (): ValidationErrors | null => {
            return this.isUsernameTaken ? { usernameTaken: true } : null;
        };
    }
}
