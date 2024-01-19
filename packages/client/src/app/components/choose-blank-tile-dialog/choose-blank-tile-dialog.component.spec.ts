import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ChooseBlankTileDialogComponent } from './choose-blank-tile-dialog.component';

describe('ChooseBlankTileDialogComponent', () => {
    let component: ChooseBlankTileDialogComponent;
    let fixture: ComponentFixture<ChooseBlankTileDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ChooseBlankTileDialogComponent],
            imports: [MatDialogModule],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: {} },
                { provide: MatDialogRef, useValue: {} },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ChooseBlankTileDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
