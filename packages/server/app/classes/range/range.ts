import { INVALID_POINT_RANGE } from '@app/constants/classes-errors';
import { StatusCodes } from 'http-status-codes';
import { HttpException } from '@app/classes/http-exception/http-exception';

export default class Range {
    constructor(private minimum: number, private maximum: number) {
        if (!Range.validateRangeValues(minimum, maximum)) throw new HttpException(INVALID_POINT_RANGE, StatusCodes.BAD_REQUEST);
    }

    private static validateRangeValues(minimum: number, maximum: number): boolean {
        return minimum <= maximum;
    }

    get min(): number {
        return this.minimum;
    }

    get max(): number {
        return this.maximum;
    }
    set min(minimum: number) {
        if (!Range.validateRangeValues(minimum, this.maximum)) throw new HttpException(INVALID_POINT_RANGE, StatusCodes.BAD_REQUEST);
        this.minimum = minimum;
    }

    set max(maximum: number) {
        if (!Range.validateRangeValues(this.minimum, maximum)) throw new HttpException(INVALID_POINT_RANGE, StatusCodes.BAD_REQUEST);
        this.maximum = maximum;
    }

    *[Symbol.iterator]() {
        for (let i = this.minimum; i <= this.maximum; ++i) yield i;
    }

    isWithinRange(value: number): boolean {
        return value >= this.minimum && value <= this.maximum;
    }
}
