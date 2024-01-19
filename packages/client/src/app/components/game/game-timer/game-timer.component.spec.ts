import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameTimerComponent } from './game-timer.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('GameTimerComponent', () => {
    let component: GameTimerComponent;
    let fixture: ComponentFixture<GameTimerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameTimerComponent],
            imports: [RouterTestingModule, HttpClientTestingModule, MatSnackBarModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameTimerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
