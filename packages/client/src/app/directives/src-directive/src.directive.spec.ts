import { ElementRef } from '@angular/core';
import { SrcDirective } from './src.directive';

export class MockElementRef extends ElementRef {
    constructor() {
        super(null);
    }
}

describe('SrcDirective', () => {
    it('should create an instance', () => {
        const directive = new SrcDirective(new MockElementRef());
        expect(directive).toBeTruthy();
    });
});
