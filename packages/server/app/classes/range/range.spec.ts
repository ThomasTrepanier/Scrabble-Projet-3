/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { INVALID_POINT_RANGE } from '@app/constants/classes-errors';
import { expect } from 'chai';
import Range from './range';

describe('Range', () => {
    describe('validateRangeValues', () => {
        const tests: [min: number, max: number, expected: boolean][] = [
            [0, 0, true],
            [0, 1, true],
            [1, 0, false],
        ];

        let index = 0;
        for (const [min, max, expected] of tests) {
            it(`should validate range (${index})`, () => {
                expect(Range['validateRangeValues'](min, max)).to.equal(expected);
            });
            index++;
        }
    });

    describe('constructor', () => {
        it('should throw is incorrect values', () => {
            expect(() => new Range(0, -1)).to.throw(INVALID_POINT_RANGE);
        });
    });

    describe('get min', () => {
        const min = 4;
        const max = 7;
        const range = new Range(min, max);

        expect(range.min).to.equal(min);
    });

    describe('get max', () => {
        const min = 4;
        const max = 7;
        const range = new Range(min, max);

        expect(range.max).to.equal(max);
    });

    describe('set min', () => {
        let range: Range;

        beforeEach(() => {
            range = new Range(0, 1);
        });

        it('should set min', () => {
            const min = -1;
            range.min = min;

            expect(range.min).to.equal(min);
        });

        it('should throw if greater than max', () => {
            expect(() => (range.min = 2)).to.throw(INVALID_POINT_RANGE);
        });
    });

    describe('set max', () => {
        let range: Range;

        beforeEach(() => {
            range = new Range(0, 1);
        });

        it('should set max', () => {
            const max = 2;
            range.max = max;

            expect(range.max).to.equal(max);
        });

        it('should throw if lower than min', () => {
            expect(() => (range.max = -1)).to.throw(INVALID_POINT_RANGE);
        });
    });

    describe('iterator', () => {
        it('should iterate for every value in range', () => {
            const range = new Range(0, 5);
            let value = range.min;

            for (const iteratorValue of range) {
                expect(iteratorValue).to.equal(value);
                value++;
            }
        });
    });

    describe('is within range', () => {
        const min = 0;
        const max = 5;

        const tests: [value: number, expected: boolean][] = [
            [min - 1, false],
            [min, true],
            [min + 1, true],
            [max - 1, true],
            [max, true],
            [max + 1, false],
        ];

        for (const [value, expected] of tests) {
            it(`should return ${expected} with value ${value} with range ${min}-${max}`, () => {
                const range = new Range(min, max);
                expect(range.isWithinRange(value)).to.equal(expected);
            });
        }
    });
});
