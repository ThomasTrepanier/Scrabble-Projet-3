import { Pipe, PipeTransform } from '@angular/core';
import { SECONDS_TO_MILLISECONDS } from '@app/constants/game-constants';
import { padStart, take } from 'lodash';
import { pipe } from 'rxjs';

export type DurationTime = [time: number, suffix: string, noPad?: boolean];

const SECONDS_IN_MINUTE = 60;
const MINUTES_IN_HOUR = 60;
const HOURS_IN_DAY = 24;
const SECONDS_IN_DAY = HOURS_IN_DAY * MINUTES_IN_HOUR * SECONDS_IN_MINUTE;
const SECONDS_IN_HOUR = MINUTES_IN_HOUR * SECONDS_IN_MINUTE;
const MINIMUM_TIME_UNITS = 1;
const MAXIMUM_TIME_UNITS = 2;

@Pipe({
    name: 'duration',
})
export class DurationPipe implements PipeTransform {
    private duration: number;

    transform(duration: number): string {
        this.duration = duration;
        return pipe(this.trimDurationTimes, this.takeMaxTimeUnits, this.trimDurationTimes, this.mapToString, this.join)(this.getDurationTimes());
    }

    private trimDurationTimes(durationsTimes: DurationTime[]): DurationTime[] {
        durationsTimes = [...durationsTimes];
        while (durationsTimes.length > MINIMUM_TIME_UNITS && durationsTimes[0][0] === 0) durationsTimes.shift();
        while (durationsTimes.length > MINIMUM_TIME_UNITS && durationsTimes[durationsTimes.length - 1][0] === 0) durationsTimes.pop();
        return durationsTimes;
    }

    private takeMaxTimeUnits(durationsTimes: DurationTime[]) {
        return take(durationsTimes, MAXIMUM_TIME_UNITS);
    }

    private mapToString(durationsTimes: DurationTime[]): string[] {
        return durationsTimes.map(([time, suffix, noPad], index) => `${index > 0 && !noPad ? padStart(time.toString(), 2, '0') : time}${suffix}`);
    }

    private join(timeString: string[]): string {
        return timeString.join(' ');
    }

    private getDurationTimes(): DurationTime[] {
        return [
            [this.getRemainingTime(SECONDS_IN_DAY * SECONDS_TO_MILLISECONDS), ' jour(s)', true],
            [this.getRemainingTime(SECONDS_IN_HOUR * SECONDS_TO_MILLISECONDS), 'h', true],
            [this.getRemainingTime(SECONDS_IN_MINUTE * SECONDS_TO_MILLISECONDS), 'm'],
            [this.getRemainingTime(SECONDS_TO_MILLISECONDS), 's'],
            [this.getRemainingTime(1), 'ms'],
        ];
    }

    private getRemainingTime(factor: number): number {
        const time = Math.floor(this.duration / factor);
        this.duration -= time * factor;
        return time;
    }
}
