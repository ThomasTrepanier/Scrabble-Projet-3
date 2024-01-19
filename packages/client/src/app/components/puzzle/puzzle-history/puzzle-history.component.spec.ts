import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PuzzleHistoryComponent } from './puzzle-history.component';

describe('PuzzleHistoryComponent', () => {
    let component: PuzzleHistoryComponent;
    let fixture: ComponentFixture<PuzzleHistoryComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PuzzleHistoryComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PuzzleHistoryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
