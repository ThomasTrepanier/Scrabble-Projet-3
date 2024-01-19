/* eslint-disable @typescript-eslint/no-magic-numbers */

import { ILLEGAL_TIMER_PARAMETERS, Timer } from './timer';

interface TimerParameter {
    minutes: number;
    seconds: number;
}

describe('Timer', () => {
    const timerParameters: Map<TimerParameter, boolean> = new Map([
        [{ minutes: 0, seconds: 0 }, true],
        [{ minutes: 0, seconds: 1 }, true],
        [{ minutes: 1, seconds: 0 }, true],
        [{ minutes: -1, seconds: 0 }, false],
        [{ minutes: 0, seconds: -1 }, false],
    ]);

    const timerDecrementTestCases: { initialTimer: TimerParameter; finalTimer: TimerParameter }[] = [
        { initialTimer: { minutes: 0, seconds: 0 }, finalTimer: { minutes: 0, seconds: 0 } },
        { initialTimer: { minutes: 0, seconds: 1 }, finalTimer: { minutes: 0, seconds: 0 } },
        { initialTimer: { minutes: 0, seconds: 2 }, finalTimer: { minutes: 0, seconds: 1 } },
        { initialTimer: { minutes: 1, seconds: 0 }, finalTimer: { minutes: 0, seconds: 59 } },
        { initialTimer: { minutes: 1, seconds: 1 }, finalTimer: { minutes: 1, seconds: 0 } },
        { initialTimer: { minutes: 2, seconds: 0 }, finalTimer: { minutes: 1, seconds: 59 } },
    ];

    timerParameters.forEach((isValid: boolean, timerParams: TimerParameter) => {
        const isValidText = isValid ? 'a valid' : 'an invalid';
        const afterShouldText = isValid ? 'assign values to properties' : 'throw an error';
        it('Creating ' + isValidText + ' Timer should ' + afterShouldText, () => {
            if (isValid) {
                const timer = new Timer(timerParams.minutes, timerParams.seconds);
                expect(timer.minutes).toEqual(timerParams.minutes);
                expect(timer.seconds).toEqual(timerParams.seconds);
            } else {
                expect(() => new Timer(timerParams.minutes, timerParams.seconds)).toThrowError(ILLEGAL_TIMER_PARAMETERS);
            }
        });
    });

    timerDecrementTestCases.forEach((value: { initialTimer: TimerParameter; finalTimer: TimerParameter }) => {
        it(`Decrementing timer at ${value.initialTimer.minutes}:${value.initialTimer.seconds} should set timer 
            to ${value.finalTimer.minutes}:${value.finalTimer.seconds}`, () => {
            const timer = new Timer(value.initialTimer.minutes, value.initialTimer.seconds);
            timer.decrement();
            expect(timer.minutes).toEqual(value.finalTimer.minutes);
            expect(timer.seconds).toEqual(value.finalTimer.seconds);
        });
    });

    it('getTimerSecondsPadded should always return string with 2 digits', () => {
        const timer: Timer = new Timer(0, 10);
        expect(timer.getTimerSecondsPadded().length).toEqual(2);
    });

    it('getTimerSecondsPadded should always return string with 2 digits', () => {
        const timer: Timer = new Timer(0, 1);
        expect(timer.getTimerSecondsPadded().length).toEqual(2);
    });
});

describe('Timer convertTime', () => {
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    const TIMES = [0, 1, 2, 30, 60, 61, 90, 120, 121, 150, 243];
    const EXPECTED_TIMERS: Timer[] = [
        new Timer(0, 0),
        new Timer(0, 1),
        new Timer(0, 2),
        new Timer(0, 30),
        new Timer(1, 0),
        new Timer(1, 1),
        new Timer(1, 30),
        new Timer(2, 0),
        new Timer(2, 1),
        new Timer(2, 30),
        new Timer(4, 3),
    ];

    for (let i = 0; i < TIMES.length; i++) {
        it(`convertTime should output the correct string (${TIMES[i]})`, () => {
            expect(Timer.convertTime(TIMES[i])).toEqual(EXPECTED_TIMERS[i]);
        });
    }
});
