/* eslint-disable @typescript-eslint/no-magic-numbers */
import { date } from './date';

describe('settings/validator/date', () => {
    describe('default', () => {
        const spec = date();

        it('should parse date', () => {
            expect(spec.parse('', new Date())).toBeDefined();
        });

        it('should parse date', () => {
            expect(spec.parse('', '6')).toBeDefined();
        });

        it('should parse date', () => {
            expect(spec.parse('', 'a')).toEqual(undefined);
        });
    });

    describe('with default value', () => {
        const spec = date({ default: new Date() });

        it('should return default', () => {
            expect(spec.parse('', undefined)).toBeDefined();
        });
    });

    describe('with required', () => {
        const spec = date({ isRequired: true });

        it('should throw error', () => {
            expect(() => spec.parse('', undefined)).toThrowError();
        });
    });
});
