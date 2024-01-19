import { Orientation } from '@app/classes/board';
import { expect } from 'chai';
import { switchOrientation } from './switch-orientation';

describe('switchOrientation', () => {
    const tests: [input: Orientation, output: Orientation][] = [
        [Orientation.Horizontal, Orientation.Vertical],
        [Orientation.Vertical, Orientation.Horizontal],
    ];

    for (const [input, output] of tests) {
        it(`should convert ${input} to ${output}`, () => {
            expect(switchOrientation(input)).to.equal(output);
        });
    }
});
