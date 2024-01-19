/* eslint-disable @typescript-eslint/no-magic-numbers */
import { settings } from './settings';
import { Settings } from './types';
import { num } from './validators';

describe('settings', () => {
    let mySettings: Settings<{ test: number | undefined }>;

    beforeEach(() => {
        mySettings = settings({
            test: num(),
        });
        mySettings.reset();
    });

    describe('pipe', () => {
        it('should pipe', () => {
            const initialValue = 4;
            const add = 8;

            mySettings.set('test', initialValue);

            mySettings.pipe('test', (val) => (val ?? 0) + add);

            expect(mySettings.get('test')).toEqual(initialValue + add);
        });
    });

    describe('has', () => {
        it('should return false if not there', () => {
            expect(mySettings.has('test')).toBeFalse();
        });

        it('should return true if is there', () => {
            mySettings.set('test', 4);
            expect(mySettings.has('test')).toBeTrue();
        });
    });

    describe('remove', () => {
        it('should remove', () => {
            mySettings.set('test', 4);
            mySettings.remove('test');
            expect(mySettings.has('test')).toBeFalse();
        });
    });
});
