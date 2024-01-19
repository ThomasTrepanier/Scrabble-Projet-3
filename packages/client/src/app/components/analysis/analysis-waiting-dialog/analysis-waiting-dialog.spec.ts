/* eslint-disable max-classes-per-file */
// /* eslint-disable dot-notation */
// /* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IconComponent } from '@app/components/icon/icon.component';
import { AppMaterialModule } from '@app/modules/material.module';
import AnalysisService from '@app/services/analysis-service/analysis.service';
import { Analysis } from '@common/models/analysis';
import { of, Subject } from 'rxjs';
import { AnalysisWaitingDialogComponent } from './analysis-waiting-dialog';
import SpyObj = jasmine.SpyObj;

@Component({
    template: '',
})
export class TestComponent {}

export class MatDialogMock {
    confirmationObservable: Subject<void> = new Subject<void>();
    close() {
        return {
            close: () => ({}),
        };
    }
    backdropClick() {
        return this.confirmationObservable.asObservable();
    }
}

describe('AnalysisWaitingDialogComponent', () => {
    let component: AnalysisWaitingDialogComponent;
    let fixture: ComponentFixture<AnalysisWaitingDialogComponent>;
    let analysisServiceSpy: SpyObj<AnalysisService>;

    beforeEach(() => {
        analysisServiceSpy = jasmine.createSpyObj('AnalysisService', ['requestAnalysis']);
        analysisServiceSpy.requestAnalysis.and.callFake(() => of({} as unknown as Analysis));
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AnalysisWaitingDialogComponent, IconComponent],
            imports: [
                AppMaterialModule,
                HttpClientModule,
                MatSelectModule,
                MatProgressSpinnerModule,
                MatDialogModule,
                BrowserAnimationsModule,
                CommonModule,
            ],
            providers: [
                MatDialog,
                {
                    provide: MatDialogRef,
                    useClass: MatDialogMock,
                },
                { provide: AnalysisService, useValue: analysisServiceSpy },

                { provide: MAT_DIALOG_DATA, useValue: 1 },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AnalysisWaitingDialogComponent);

        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
