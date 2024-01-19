import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PuzzleHomePageComponent } from './puzzle-home-page.component';

describe('PuzzleHomePageComponent', () => {
    let component: PuzzleHomePageComponent;
    let fixture: ComponentFixture<PuzzleHomePageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PuzzleHomePageComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PuzzleHomePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
