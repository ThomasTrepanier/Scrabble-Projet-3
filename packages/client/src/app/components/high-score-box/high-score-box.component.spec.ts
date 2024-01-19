import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HighScoreBoxComponent } from './high-score-box.component';

describe('HighScoreBoxComponent', () => {
    let component: HighScoreBoxComponent;
    let fixture: ComponentFixture<HighScoreBoxComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [HighScoreBoxComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(HighScoreBoxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
