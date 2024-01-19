import { Injectable } from '@angular/core';
import { FocusableComponent } from '@app/classes/focusable-component/focusable-component';

@Injectable({
    providedIn: 'root',
})
export class FocusableComponentsService {
    private activeKeyboardComponent?: FocusableComponent<KeyboardEvent> = undefined;

    setActiveKeyboardComponent(component: FocusableComponent<KeyboardEvent>): boolean {
        if (component === this.activeKeyboardComponent) return false;
        this.activeKeyboardComponent?.emitLoseFocusEvent();
        this.activeKeyboardComponent = component;
        return true;
    }

    emitKeyboard(value: KeyboardEvent): boolean {
        if (!this.activeKeyboardComponent) return false;
        this.activeKeyboardComponent.emitFocusableEvent(value);
        return true;
    }
}
