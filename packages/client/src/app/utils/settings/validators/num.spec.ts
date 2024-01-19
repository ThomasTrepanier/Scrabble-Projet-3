/* eslint-disable @typescript-eslint/no-magic-numbers */
import { num } from './num';

describe('settings/validator/num', () => {
    describe('default', () => {
        const spec = num();

        it('should parse number', () => {
            expect(spec.parse('', 6)).toEqual(6);
        });

        it('should parse number', () => {
            expect(spec.parse('', '6')).toEqual(6);
        });

        it('should parse number', () => {
            expect(spec.parse('', 'a')).toEqual(undefined);
        });
    });

    describe('with default value', () => {
        const spec = num({ default: 9 });

        it('should return default', () => {
            expect(spec.parse('', undefined)).toEqual(9);
        });
    });

    describe('with required', () => {
        const spec = num({ isRequired: true });

        it('should throw error', () => {
            expect(() => spec.parse('', undefined)).toThrowError();
        });
    });
});
