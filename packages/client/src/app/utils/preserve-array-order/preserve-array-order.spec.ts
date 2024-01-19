import { preserveArrayOrder } from './preserve-array-order';

describe('preserveArrayOrder', () => {
    it('should preserve order', () => {
        const tests: [array: string[], original: string[], expected: string[]][] = [
            [
                ['A', 'B', 'C'],
                ['C', 'B', 'A'],
                ['C', 'B', 'A'],
            ],
            [
                ['A', 'B', 'C'],
                ['B', 'A'],
                ['B', 'A', 'C'],
            ],
            [['A', 'B', 'C'], [], ['A', 'B', 'C']],
            [
                ['X', 'Y', 'Z'],
                ['A', 'B', 'C'],
                ['X', 'Y', 'Z'],
            ],
            [
                ['X', 'B', 'Z', 'A', 'Y'],
                ['A', 'B', 'C'],
                ['A', 'B', 'X', 'Z', 'Y'],
            ],
        ];

        for (const [array, original, expected] of tests) {
            const result = preserveArrayOrder(array, original, (a, b) => a === b);
            expect(result).toEqual(expected);
        }
    });
});
