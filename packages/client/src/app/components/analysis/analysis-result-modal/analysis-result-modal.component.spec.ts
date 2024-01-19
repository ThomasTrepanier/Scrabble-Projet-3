import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnalysisResultModalComponent } from './analysis-result-modal.component';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';

@Component({
    template: '',
})
export class TestComponent {}

describe('AnalysisResultModalComponent', () => {
    let component: AnalysisResultModalComponent;
    let fixture: ComponentFixture<AnalysisResultModalComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AnalysisResultModalComponent],
            imports: [
                MatDialogModule,
                MatProgressSpinnerModule,
                HttpClientModule,
                HttpClientTestingModule,
                RouterTestingModule.withRoutes([{ path: 'game-creation', component: TestComponent }]),
            ],
            providers: [
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: {
                        analysis: {
                            idGameHistory: 1,
                            idUser: 2,
                            criticalMoments: [],
                        },
                    },
                },
                { provide: MatDialogRef, useValue: {} },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AnalysisResultModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
