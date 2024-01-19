/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';
import { IconComponent } from '@app/components/icon/icon.component';
import { DEFAULT_TIMER_VALUE, MAXIMUM_TIMER_VALUE, MINIMUM_TIMER_VALUE, TIMER_VALUE_INCREMENTS } from '@app/constants/pages-constants';
import { TimerSelectionComponent } from './timer-selection.component';

@Component({
    selector: 'app-timer-selection-wrapper',
    template: '<app-timer-selection [parentForm]="parentForm"></app-timer-selection>',
})
class TimerSelectionWrapperComponent {
    parentForm: FormGroup = new FormGroup({
        level: new FormControl(VirtualPlayerLevel.Beginner, Validators.required),
        timer: new FormControl(DEFAULT_TIMER_VALUE, Validators.required),
    });
}

describe('TimerSelectionComponent', () => {
    let component: TimerSelectionComponent;
    let fixture: ComponentFixture<TimerSelectionWrapperComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TimerSelectionComponent, TimerSelectionWrapperComponent, IconComponent],
            imports: [MatInputModule, MatFormFieldModule, ReactiveFormsModule, MatCardModule, BrowserAnimationsModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TimerSelectionWrapperComponent);
        component = fixture.debugElement.children[0].componentInstance;
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Should have DEFAULT_TIMER_VALUE on creation', () => {
        component.timerValue = -DEFAULT_TIMER_VALUE;
        component.ngOnInit();
        expect(component.timerValue).toEqual(DEFAULT_TIMER_VALUE);
    });

    it('Should have DEFAULT_TIMER_VALUE if no parentForm', () => {
        component.timerValue = -DEFAULT_TIMER_VALUE;
        component['parentForm'] = { get: () => {} } as unknown as FormGroup;
        component.ngOnInit();
        expect(component.timerValue).toEqual(DEFAULT_TIMER_VALUE);
    });

    it('incrementTimerValue should call method to change timerValue with positive increment', () => {
        const spy = spyOn<any>(component, 'changeTimerValue').and.callFake(() => {
            return;
        });

        component.incrementTimerValue();
        expect(spy).toHaveBeenCalledWith(TIMER_VALUE_INCREMENTS);
    });

    it('decrementTimerValue should call method to change timerValue with negative increment', () => {
        const spy = spyOn<any>(component, 'changeTimerValue').and.callFake(() => {
            return;
        });

        component.decrementTimerValue();
        expect(spy).toHaveBeenCalledWith(-TIMER_VALUE_INCREMENTS);
    });

    describe('changeTimerValue', () => {
        let patchValueSpy: unknown;
        let middleValue = 0;
        let delta = 0;

        beforeEach(() => {
            patchValueSpy = spyOn(component.parentForm, 'patchValue').and.callFake(() => {
                return;
            });
            middleValue = MINIMUM_TIMER_VALUE + (MAXIMUM_TIMER_VALUE - MINIMUM_TIMER_VALUE) / 2;
            delta = middleValue / 2;
        });

        it('changeTimerValue should add delta if timerValue is within the min and max', () => {
            component.timerValue = middleValue;
            component['changeTimerValue'](delta);
            expect(component.timerValue).toEqual(middleValue + delta);
        });

        it('changeTimerValue should remove delta if timerValue is within the min and max', () => {
            component.timerValue = middleValue;
            component['changeTimerValue'](-delta);
            expect(component.timerValue).toEqual(middleValue - delta);
        });

        it('changeTimerValue should not set timerValue above maximum value allowed', () => {
            component.timerValue = MAXIMUM_TIMER_VALUE;
            delta = 1;
            component['changeTimerValue'](delta);
            expect(component.timerValue).toEqual(MAXIMUM_TIMER_VALUE);
        });

        it('changeTimerValue should not set timerValue below minimum value allowed', () => {
            component.timerValue = MINIMUM_TIMER_VALUE;
            delta = -1;
            component['changeTimerValue'](delta);
            expect(component.timerValue).toEqual(MINIMUM_TIMER_VALUE);
        });

        it('changeTimerValue should assign new timerValue to form', () => {
            component.timerValue = middleValue;
            component['changeTimerValue'](delta);
            expect(patchValueSpy).toHaveBeenCalledWith({ timer: middleValue + delta });
        });
    });
});
