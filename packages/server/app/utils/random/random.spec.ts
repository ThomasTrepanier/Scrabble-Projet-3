/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai';
import { Random } from './random';

const DEFAULT_ARRAY = ['a', 'b', 'c'];
describe('random -> getRandomElementsFromArray', () => {
    describe('getRandomElementsFromArray', () => {
        it('should return an array of the desired length', () => {
            expect(Random.getRandomElementsFromArray(DEFAULT_ARRAY).length).to.equal(1);
            expect(Random.getRandomElementsFromArray(DEFAULT_ARRAY, 2).length).to.equal(2);
        });

        it('should return the entire array if the desired length is larger than the array.length', () => {
            expect(Random.getRandomElementsFromArray(DEFAULT_ARRAY, DEFAULT_ARRAY.length + 1)).to.deep.equal(DEFAULT_ARRAY);
        });

        it('should not always return the same element', () => {
            let result: string | undefined;
            let sameResult = true;
            const iterations = 100;
            for (let i = 0; i < iterations; i++) {
                const currentRandomSelection = Random.getRandomElementsFromArray(DEFAULT_ARRAY);
                if (currentRandomSelection[0] !== result && i !== 0) {
                    sameResult = false;
                    break;
                } else {
                    result = currentRandomSelection[0];
                }
            }
            expect(sameResult).to.be.false;
        });
    });

    describe('popRandom', () => {
        it('should not always return same element', () => {
            const lastResult = Random.popRandom([...DEFAULT_ARRAY]);

            const iterations = 100;
            for (let i = 0; i < iterations; ++i) {
                const result = Random.popRandom([...DEFAULT_ARRAY]);
                if (result !== lastResult) {
                    expect(true).to.be.ok;
                    return;
                }
            }

            expect(false).to.be.ok;
        });
    });
});
