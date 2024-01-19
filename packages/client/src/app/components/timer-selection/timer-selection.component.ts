import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DEFAULT_TIMER_VALUE, MAXIMUM_TIMER_VALUE, MINIMUM_TIMER_VALUE, TIMER_VALUE_INCREMENTS } from '@app/constants/pages-constants';

@Component({
    selector: 'app-timer-selection',
    templateUrl: './timer-selection.component.html',
    styleUrls: ['./timer-selection.component.scss'],
})
export class TimerSelectionComponent implements OnInit {
    @Input() parentForm: FormGroup;
    timerValue: number;

    ngOnInit(): void {
        this.timerValue = this.parentForm.get('timer')?.value || DEFAULT_TIMER_VALUE;
    }

    incrementTimerValue(): void {
        this.changeTimerValue(TIMER_VALUE_INCREMENTS);
    }

    decrementTimerValue(): void {
        this.changeTimerValue(-TIMER_VALUE_INCREMENTS);
    }

    private changeTimerValue(delta: number): void {
        this.timerValue = Math.min(MAXIMUM_TIMER_VALUE, Math.max(MINIMUM_TIMER_VALUE, this.timerValue + delta));
        this.parentForm.patchValue({
            timer: this.timerValue,
        });
    }
}
