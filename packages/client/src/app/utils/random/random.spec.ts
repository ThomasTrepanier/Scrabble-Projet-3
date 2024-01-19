/* eslint-disable dot-notation */
import { Random } from './random';

const DEFAULT_ARRAY = ['a', 'b', 'c'];

describe('random -> getRandomElementsFromArray', () => {
    describe('getRandomElementsFromArray', () => {
        it('should return an array of the desired length', () => {
            expect(Random.getRandomElementsFromArray(DEFAULT_ARRAY).length).toBe(1);
            expect(Random.getRandomElementsFromArray(DEFAULT_ARRAY, 2).length).toBe(2);
        });

        it('should return the entire array if the desired length is larger than the array.length', () => {
            expect(Random.getRandomElementsFromArray(DEFAULT_ARRAY, DEFAULT_ARRAY.length + 1)).toEqual(DEFAULT_ARRAY);
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
            expect(sameResult).toBeFalse();
        });
    });

    describe('popRandom', () => {
        it('should not always return same element', () => {
            const lastResult = Random['popRandom']([...DEFAULT_ARRAY]);

            const iterations = 100;
            for (let i = 0; i < iterations; ++i) {
                const result = Random['popRandom']([...DEFAULT_ARRAY]);
                if (result !== lastResult) {
                    expect(true).toBeTruthy();
                    return;
                }
            }

            expect(false).toBeTruthy();
        });
    });

    describe('randomize', () => {
        let array: string[];
        let result: string[];

        beforeEach(() => {
            array = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
            result = Random.randomize(array);
        });

        it('should not deep equal input', () => {
            expect(result).not.toEqual(array);
        });

        it('should contain all same items', () => {
            for (const element of array) {
                expect(result).toContain(element);
                result.splice(result.indexOf(element), 1);
            }
            expect(result).toHaveSize(0);
        });
    });
});
