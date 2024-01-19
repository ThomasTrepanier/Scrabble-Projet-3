import { onlyHasEmoji } from './emoji';

describe('emoji', () => {
    describe('onlyHasEmoji', () => {
        it('should return true if only emoji', () => {
            expect(onlyHasEmoji('🐐🐸')).toBeTrue();
        });

        it('should return false if not only emoji', () => {
            expect(onlyHasEmoji('🐐🐸 ')).toBeFalse();
        });
    });
});
