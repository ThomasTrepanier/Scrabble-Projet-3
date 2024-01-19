/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { SECONDS_TO_MILLISECONDS } from '@app/constants/game-constants';
import { DurationPipe } from './duration.pipe';

describe('DurationPipe', () => {
    let pipe: DurationPipe;

    beforeEach(() => {
        pipe = new DurationPipe();
    });

    it('create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    const tests: [duration: number, expected: string][] = [
        [0, '0ms'],
        [60, '1m'],
        [3600, '1h'],
        [3730, '1h 02m'],
        [70, '1m 10s'],
        [3610, '1h'],
        [90000, '1 jour(s) 1h'],
    ];

    let index = 1;
    for (const [duration, expected] of tests) {
        it(`should convert duration (${index})`, () => {
            expect(pipe.transform(duration * SECONDS_TO_MILLISECONDS)).toEqual(expected);
        });
        index++;
    }
});
