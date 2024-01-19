import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PuzzleScoreComponent } from './puzzle-score.component';

describe('PuzzleScoreComponent', () => {
    let component: PuzzleScoreComponent;
    let fixture: ComponentFixture<PuzzleScoreComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PuzzleScoreComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PuzzleScoreComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
