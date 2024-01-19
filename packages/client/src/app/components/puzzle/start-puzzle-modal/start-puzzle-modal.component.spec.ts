import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StartPuzzleModalComponent } from './start-puzzle-modal.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('StartPuzzleModalComponent', () => {
    let component: StartPuzzleModalComponent;
    let fixture: ComponentFixture<StartPuzzleModalComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ReactiveFormsModule, FormsModule, BrowserAnimationsModule],
            declarations: [StartPuzzleModalComponent],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: {} },
                { provide: MatDialogRef, useValue: {} },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(StartPuzzleModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
