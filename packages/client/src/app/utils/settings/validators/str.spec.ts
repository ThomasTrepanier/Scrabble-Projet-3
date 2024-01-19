import { str } from './str';

describe('settings/validator/str', () => {
    describe('default', () => {
        const spec = str();

        it('should parse string', () => {
            expect(spec.parse('', 'hey')).toEqual('hey');
        });
    });

    describe('with default value', () => {
        const spec = str({ default: 'yo' });

        it('should return default', () => {
            expect(spec.parse('', undefined)).toEqual('yo');
        });
    });

    describe('with required', () => {
        const spec = str({ isRequired: true });

        it('should throw error', () => {
            expect(() => spec.parse('', undefined)).toThrowError();
        });
    });
});
