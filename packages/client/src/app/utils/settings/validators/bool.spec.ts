/* eslint-disable @typescript-eslint/no-magic-numbers */
import { bool } from './bool';

describe('settings/validator/bool', () => {
    describe('default', () => {
        const spec = bool();

        it('should parse bool 1', () => {
            expect(spec.parse('', true)).toBeTrue();
        });

        it('should parse bool 2', () => {
            expect(spec.parse('', 't')).toBeTrue();
        });

        it('should parse bool 3', () => {
            expect(spec.parse('', '0')).toBeFalse();
        });

        it('should parse bool 4', () => {
            expect(spec.parse('', 'a')).toEqual(undefined);
        });
    });

    describe('with default value', () => {
        const spec = bool({ default: false });

        it('should return default', () => {
            expect(spec.parse('', undefined)).toBeFalse();
        });
    });

    describe('with required', () => {
        const spec = bool({ isRequired: true });

        it('should throw error', () => {
            expect(() => spec.parse('', undefined)).toThrowError();
        });
    });
});
