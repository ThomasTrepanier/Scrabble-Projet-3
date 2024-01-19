import { Component, HostListener, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BUTTON_MUST_HAVE_CONTENT, DIALOG_BUTTONS_MUST_BE_AN_ARRAY, DIALOG_MUST_HAVE_TITLE } from '@app/constants/component-errors';
import { DefaultDialogButtonParameters, DefaultDialogCheckboxParameters, DefaultDialogParameters } from './default-dialog.component.types';

@Component({
    selector: 'app-default-dialog',
    templateUrl: './default-dialog.component.html',
    styleUrls: ['./default-dialog.component.scss'],
})
export class DefaultDialogComponent {
    title: string;
    content: string | undefined;
    buttons: DefaultDialogButtonParameters[];
    checkbox: DefaultDialogCheckboxParameters | undefined;

    constructor(@Inject(MAT_DIALOG_DATA) public data: DefaultDialogParameters, private router: Router) {
        // Data must be handled because it is not typed correctly when used in dialog.open(...)
        if (!this.data.title || typeof this.data.title !== 'string') throw new Error(DIALOG_MUST_HAVE_TITLE);

        this.title = this.data.title;
        this.content = this.data.content;
        this.buttons = [];
        this.checkbox = this.data.checkbox;

        if (!this.data.buttons) return;
        if (!Array.isArray(this.data.buttons)) throw new Error(DIALOG_BUTTONS_MUST_BE_AN_ARRAY);

        this.data.buttons.forEach((button) => {
            if (!button.content) throw new Error(BUTTON_MUST_HAVE_CONTENT);
            this.buttons.push({
                content: button.content,
                closeDialog: button.redirect ? true : button.closeDialog ?? false,
                action: button.action,
                redirect: button.redirect,
                style: button.style,
                icon: button.icon,
            });
        });

        if (this.checkbox) {
            this.checkbox.checked = this.checkbox.checked ?? false;
        }
    }

    @HostListener('document:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): void {
        for (const button of this.data.buttons) {
            if (button.key === event.key) {
                this.handleButtonClick(button);
                event.stopPropagation();
            }
        }
    }

    handleButtonClick(button: DefaultDialogButtonParameters): void {
        if (button.action) button.action();
        if (button.redirect) this.router.navigate([button.redirect]);
    }

    handleCheckboxChange(checked: boolean): void {
        if (this.checkbox?.action) this.checkbox.action(checked);
    }
}
