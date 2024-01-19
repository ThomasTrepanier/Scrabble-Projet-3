import { nextIndex } from './next-index';

describe('NextIndex', () => {
    const tests: [index: number, length: number, expected: number][] = [
        [0, 2, 1],
        [1, 2, 0],
        [2, 2, 1],
    ];

    for (const [index, length, expected] of tests) {
        it(`should return ${expected} for index=${index} and length=${length}`, () => {
            expect(nextIndex(length)(index)).toEqual(expected);
        });
    }
});
