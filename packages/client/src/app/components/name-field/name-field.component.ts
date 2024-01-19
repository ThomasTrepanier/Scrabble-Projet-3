// import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
// import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
// import { NAME_NO_MATCH_REGEX, NAME_REQUIRED, NAME_SAME_AS_VIRTUAL_PLAYER, NAME_TOO_LONG, NAME_TOO_SHORT } from '@app/constants/name-field';
// import { NAME_VALIDATION } from '@app/constants/name-validation';

// @Component({
//     selector: 'app-name-field',
//     templateUrl: './name-field.component.html',
//     styleUrls: ['./name-field.component.scss'],
// })
// export class NameFieldComponent implements OnChanges, OnInit {
//     @Input() initialPlayerName: string;
//     @Input() virtualPlayerName: string;
//     @Input() mustVerifyVirtualPlayerName: boolean;
//     @Output() isInputNameValid;
//     @Output() playerNameChange;
//     errorNameRequired: string;
//     errorNameTooShort: string;
//     errorNameTooLong: string;
//     errorNameNoMatchRegex: string;
//     errorSameNameAsVirtualPlayer: string;
//     formParameters: FormGroup;

//     constructor() {
//         this.initialPlayerName = '';
//         this.virtualPlayerName = '';
//         this.mustVerifyVirtualPlayerName = false;
//         this.isInputNameValid = new EventEmitter<boolean>();
//         this.playerNameChange = new EventEmitter<[name: string, valid: boolean]>();
//         this.errorNameRequired = NAME_REQUIRED;
//         this.errorNameTooShort = NAME_TOO_SHORT;
//         this.errorNameTooLong = NAME_TOO_LONG;
//         this.errorNameNoMatchRegex = NAME_NO_MATCH_REGEX;
//         this.errorSameNameAsVirtualPlayer = NAME_SAME_AS_VIRTUAL_PLAYER;
//         this.formParameters = new FormGroup({
//             inputName: new FormControl('', [
//                 Validators.required,
//                 Validators.pattern(NAME_VALIDATION.rule),
//                 Validators.minLength(NAME_VALIDATION.minLength),
//                 Validators.maxLength(NAME_VALIDATION.maxLength),
//                 this.nameDifferentFromVirtualPlayer(),
//             ]),
//         });
//     }

//     ngOnInit(): void {
//         this.formParameters.get('inputName')?.setValue(this.initialPlayerName);
//         this.onChange();
//     }

//     ngOnChanges(): void {
//         this.onChange();
//     }

//     onChange(): void {
//         if (this.formParameters.controls.inputName?.dirty) this.formParameters.controls.inputName?.markAsTouched();
//         this.formParameters.controls.inputName?.updateValueAndValidity();
//         const isNameValid: boolean = this.formParameters.get('inputName')?.valid ?? false;
//         this.isInputNameValid.emit(isNameValid);
//         this.playerNameChange.emit([this.formParameters.get('inputName')?.value, isNameValid]);
//     }

//     onFormInvalidClick(): void {
//         this.formParameters.controls.inputName?.markAsDirty();
//         this.onChange();
//     }

//     private nameDifferentFromVirtualPlayer(): ValidatorFn {
//         return (inputName: AbstractControl): ValidationErrors | null => {
//             if (!this.mustVerifyVirtualPlayerName) return null;
//             if (inputName.value !== this.virtualPlayerName) return null;
//             return { nameDifferentFomVirtualPlayer: true };
//         };
//     }
// }
