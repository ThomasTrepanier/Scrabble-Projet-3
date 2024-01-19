import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PuzzleResultModalComponent } from './puzzle-result-modal.component';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { PuzzleResultStatus } from '@common/models/puzzle';
import { PuzzleScoreComponent } from '@app/components/puzzle/puzzle-score/puzzle-score.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

describe('PuzzleResultModalComponent', () => {
    let component: PuzzleResultModalComponent;
    let fixture: ComponentFixture<PuzzleResultModalComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PuzzleResultModalComponent, PuzzleScoreComponent],
            imports: [MatDialogModule, MatProgressSpinnerModule],
            providers: [
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: {
                        level: { name: 'test' },
                        result: {
                            userPoints: 0,
                            result: PuzzleResultStatus.Won,
                            targetPlacement: {
                                score: 0,
                            },
                            allPlacements: [],
                        },
                    },
                },
                { provide: MatDialogRef, useValue: {} },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PuzzleResultModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
