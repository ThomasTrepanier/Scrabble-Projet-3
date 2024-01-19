import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GamePlayersComponent } from './game-players.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';

describe('GamePlayersComponent', () => {
    let component: GamePlayersComponent;
    let fixture: ComponentFixture<GamePlayersComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GamePlayersComponent],
            imports: [RouterTestingModule, HttpClientTestingModule, MatSnackBarModule, MatDialogModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GamePlayersComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
