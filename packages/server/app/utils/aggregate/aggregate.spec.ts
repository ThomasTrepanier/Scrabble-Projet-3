import { expect } from 'chai';
import { aggregate } from './aggregate';

interface TestInterface {
    a: string;
    b: string;
    c: number;
    d: number;
}

describe('aggregate', () => {
    it('should aggregate', () => {
        const lines: TestInterface[] = [
            { a: 'a', b: 'b', c: 1, d: 2 },
            { a: 'a', b: 'b', c: 3, d: 7 },
            { a: 'a', b: 'b', c: 4, d: 12 },
        ];

        const result = aggregate(lines, { idKey: 'a', fieldKey: 'children', mainItemKeys: ['a', 'b'], aggregatedItemKeys: ['c', 'd'] });

        expect(result).to.deep.equal([
            {
                a: 'a',
                b: 'b',
                children: [
                    { c: 1, d: 2 },
                    { c: 3, d: 7 },
                    { c: 4, d: 12 },
                ],
            },
        ]);
    });
});
