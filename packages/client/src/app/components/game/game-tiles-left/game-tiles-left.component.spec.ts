import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameTilesLeftComponent } from './game-tiles-left.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';

describe('GameTilesLeftComponent', () => {
    let component: GameTilesLeftComponent;
    let fixture: ComponentFixture<GameTilesLeftComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameTilesLeftComponent],
            imports: [RouterTestingModule, HttpClientTestingModule, MatSnackBarModule, MatDialogModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameTilesLeftComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
