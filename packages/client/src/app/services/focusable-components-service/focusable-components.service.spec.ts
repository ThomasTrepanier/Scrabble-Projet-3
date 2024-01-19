/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { TestBed } from '@angular/core/testing';
import { FocusableComponent } from '@app/classes/focusable-component/focusable-component';

import { FocusableComponentsService } from './focusable-components.service';

class ComponentKeyboard extends FocusableComponent<KeyboardEvent> {}

describe('FocusableComponentsService', () => {
    let service: FocusableComponentsService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(FocusableComponentsService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('setActiveKeyboardComponent', () => {
        it('should change component', () => {
            const initialValue = service['activeKeyboardComponent'];
            const component = new ComponentKeyboard();
            const result = service.setActiveKeyboardComponent(component);
            const componentResult = service['activeKeyboardComponent'];
            expect(result).toBeTrue();
            expect(componentResult).not.toBe(initialValue);
            expect(componentResult).toBe(component);
        });

        it('should not change component when setting already active component', () => {
            const component = new ComponentKeyboard();
            service['activeKeyboardComponent'] = component;
            const result = service.setActiveKeyboardComponent(component);
            expect(result).toBeFalse();
        });

        it('should send looseFocusEvent to activeComponent', () => {
            const component1 = new ComponentKeyboard();
            const component2 = new ComponentKeyboard();
            service['activeKeyboardComponent'] = component1;
            const spy = spyOn(component1['loseFocusEvent'], 'next');
            service.setActiveKeyboardComponent(component2);
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('emitKeyboard', () => {
        it('should call emit when activeKeyboardComponent is defined', () => {
            const component = new ComponentKeyboard();
            service['activeKeyboardComponent'] = component;
            const spy = spyOn(component['focusableEvent'], 'next');
            service.emitKeyboard(new KeyboardEvent('a'));
            expect(spy).toHaveBeenCalled();
        });

        it('should return false if activeKeyboardComponent is undefined', () => {
            service['activeKeyboardComponent'] = undefined;
            const result = service.emitKeyboard(new KeyboardEvent('a'));
            expect(result).toBeFalse();
        });
    });
});
