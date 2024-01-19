import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UserLoginCredentials } from '@common/models/user';

@Component({
    selector: 'app-login-container',
    templateUrl: './login-container.component.html',
    styleUrls: ['./login-container.component.scss'],
})
export class LoginContainerComponent {
    @Output() login: EventEmitter<UserLoginCredentials> = new EventEmitter();

    loginForm: FormGroup;
    isPasswordShown: boolean = false;

    constructor() {
        this.loginForm = new FormGroup({
            email: new FormControl('', [Validators.required]),
            password: new FormControl('', [Validators.required]),
        });
    }

    onSubmit(): void {
        if (this.loginForm.invalid) return;

        const userCredentials: UserLoginCredentials = {
            email: this.loginForm.get('email')?.value,
            password: this.loginForm.get('password')?.value,
        };

        this.login.next(userCredentials);
    }
}
