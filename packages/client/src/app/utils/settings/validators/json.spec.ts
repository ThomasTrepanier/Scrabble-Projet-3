/* eslint-disable @typescript-eslint/no-magic-numbers */
import { json } from './json';

describe('settings/validator/json', () => {
    describe('default', () => {
        const spec = json();

        it('should parse json 1', () => {
            expect(spec.parse('', { yo: 'hey' })).toEqual({ yo: 'hey' });
        });

        it('should parse json 2 ', () => {
            expect(spec.parse('', '{ "yo": "hey" }')).toEqual({ yo: 'hey' });
        });

        it('should parse json 3', () => {
            expect(spec.parse('', 'a')).toEqual(undefined);
        });
    });

    describe('with default value', () => {
        const defaultValue = { hello: 'yo' };
        const spec = json({ default: defaultValue });

        it('should return default', () => {
            expect(spec.parse('', undefined)).toEqual(defaultValue);
        });
    });

    describe('with required', () => {
        const spec = json({ isRequired: true });

        it('should throw error', () => {
            expect(() => spec.parse('', undefined)).toThrowError();
        });
    });
});
