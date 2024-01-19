import { isNumber } from './is-number';

describe('isNumber', () => {
    it('should return true if char is a number', () => {
        expect(isNumber('6')).toBeTrue();
    });

    it('should return false if char is not a number', () => {
        const notNumberChars: string[] = ['a', 'F', '&', '^', ' '];

        for (const notNumberChar of notNumberChars) {
            expect(isNumber(notNumberChar)).toBeFalse();
        }
    });
});
