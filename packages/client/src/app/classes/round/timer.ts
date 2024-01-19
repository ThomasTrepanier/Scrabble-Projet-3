export class Timer {
    minutes: number;
    seconds: number;

    constructor(minutes: number, seconds: number) {
        if (minutes < 0 || seconds < 0 || seconds >= SECONDS_IN_MINUTE) throw new Error(ILLEGAL_TIMER_PARAMETERS);
        this.minutes = minutes;
        this.seconds = seconds;
    }

    static convertTime(time: number): Timer {
        const minutes = Math.floor(time / SECONDS_IN_MINUTE);
        const seconds = Math.floor(time % SECONDS_IN_MINUTE);
        return new Timer(minutes, seconds);
    }

    decrement(): void {
        if (this.seconds > 0) {
            this.seconds--;
        } else if (this.minutes > 0) {
            this.minutes--;
            this.seconds = 59;
        }
    }

    getTimerSecondsPadded(): string {
        return this.seconds.toString().padStart(2, '0');
    }

    getTime(): number {
        return this.minutes * SECONDS_IN_MINUTE + this.seconds;
    }

    getStringTimer(): string {
        const minutes = this.minutes > 0 ? `${this.minutes} min ` : '';
        return `${minutes}${this.getTimerSecondsPadded()} s`;
    }
}

export const ILLEGAL_TIMER_PARAMETERS = 'The arguments passed to create the timer are not valid (minute < 0 or seconds < 0)';
const SECONDS_IN_MINUTE = 60;
