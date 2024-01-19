/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { Subject } from 'rxjs';
import { FocusableComponent } from './focusable-component';

class Component extends FocusableComponent<string> {}

const testSubscribeMethodPipe = (component: FocusableComponent<string>, event: string, method: string) => {
    const subject = new Subject<string>();
    const destroy$ = new Subject<boolean>();
    (component as any)[event] = subject;
    const spy = spyOn(subject, 'pipe');
    spy.and.returnValue(subject);

    (component as any)[method](destroy$, () => {});

    expect(spy).toHaveBeenCalled();
};

const testSubscribeMethodSubscribe = (component: FocusableComponent<string>, event: string, method: string) => {
    const subject = new Subject<string>();
    const destroy$ = new Subject<boolean>();
    (component as any)[event] = subject;
    spyOn(subject, 'pipe').and.returnValue(subject);
    const spy = spyOn(subject, 'subscribe');
    const next = () => {};

    (component as any)[method](destroy$, next);

    expect(spy).toHaveBeenCalledWith(next);
};

describe('FocusableComponent', () => {
    let component: FocusableComponent<string>;

    beforeEach(() => {
        component = new Component();
    });

    describe('subscribeToFocusableEvent', () => {
        it('should call pipe', () => {
            testSubscribeMethodPipe(component, 'focusableEvent', 'subscribeToFocusableEvent');
        });

        it('should call subscribe with next', () => {
            testSubscribeMethodSubscribe(component, 'focusableEvent', 'subscribeToFocusableEvent');
        });
    });

    describe('subscribeToLoseFocusEvent', () => {
        it('should call pipe', () => {
            testSubscribeMethodPipe(component, 'loseFocusEvent', 'subscribeToLoseFocusEvent');
        });

        it('should call subscribe with next', () => {
            testSubscribeMethodSubscribe(component, 'loseFocusEvent', 'subscribeToLoseFocusEvent');
        });
    });

    describe('subscribe', () => {
        const testSubscribe = (event: string) => {
            const subject = new Subject<string>();
            (component as any)[event] = subject;
            const spy = spyOn(subject, 'subscribe');

            component['subscribeToFocusableEvents']();

            expect(spy).toHaveBeenCalled();
        };

        it('should subscribe to focusableEvent', () => {
            testSubscribe('focusableEvent');
        });

        it('should subscribe to focusableEvent', () => {
            testSubscribe('loseFocusEvent');
        });

        it('should call onFocusableEvent when subscribed', () => {
            component['onFocusableEvent'] = () => {};
            const spy = spyOn<any>(component, 'onFocusableEvent');
            component['subscribeToFocusableEvents']();
            const expected = 'expected';
            component.emitFocusableEvent(expected);
            expect(spy).toHaveBeenCalledWith(expected);
        });

        it('should call onFocusableEvent when subscribed', () => {
            component['onLoseFocusEvent'] = () => {};
            const spy = spyOn<any>(component, 'onLoseFocusEvent');
            component['subscribeToFocusableEvents']();
            component.emitLoseFocusEvent();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('destroy', () => {
        it('should call focusableComponentDestroyed next', () => {
            const spy = spyOn(component['focusableComponentDestroyed$'], 'next');
            component['unsubscribeToFocusableEvents']();
            expect(spy).toHaveBeenCalledWith(true);
        });

        it('should call focusableComponentDestroyed next', () => {
            const spy = spyOn(component['focusableComponentDestroyed$'], 'complete');
            component['unsubscribeToFocusableEvents']();
            expect(spy).toHaveBeenCalled();
        });
    });
});
