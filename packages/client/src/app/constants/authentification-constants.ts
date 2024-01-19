import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const PASSWORD_REGEX = new RegExp('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[!@#\\$&*~]).{8,}$');
export const PASSWORD_MAX_LENGTH = 50;
export const EMAIL_MAX_LENGTH = 40;

export const matchValidator = (source: string, target: string): ValidatorFn => {
    return (control: AbstractControl): ValidationErrors | null => {
        const sourceCtrl = control.get(source);
        const targetCtrl = control.get(target);

        return sourceCtrl && targetCtrl && sourceCtrl.value !== targetCtrl.value ? { mismatch: true } : null;
    };
};

export const USER_ALREADY_LOGGED = 'Cet utilisateur est déjà connecté';
export const INVALID_CREDENTIALS = 'Identifiants invalides';
export const INVALID_SIGNUP_INFORMATION = 'Certains champs sont invalides';
export const LOGIN_ERROR = 'Erreur lors de la connexion';
export const SIGNUP_ERROR = 'Erreur lors de la création du compte';

export const USERNAME_IS_INVALID = 'Le pseudonyme est invalide';
export const USERNAME_IS_REQUIRED = 'Le pseudonyme ne peut pas être vide';
export const USERNAME_IS_TOO_LONG = (max: number, actual: number) => `Le pseudonyme est trop long (maximum: ${max}, actuel: ${actual})`;

export const CANNOT_VERIFY_EMAIL_UNICITY = 'Le courriel est déjà utilisé';
export const CANNOT_VERIFY_USERNAME_UNICITY = 'Le pseudonyme est déjà utilisé';
