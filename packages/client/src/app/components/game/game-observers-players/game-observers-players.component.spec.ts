import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameObserversPlayersComponent } from './game-observers-players.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';

describe('GameObserversPlayersComponent', () => {
    let component: GameObserversPlayersComponent;
    let fixture: ComponentFixture<GameObserversPlayersComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameObserversPlayersComponent],
            imports: [RouterTestingModule, HttpClientTestingModule, MatSnackBarModule, MatSnackBarModule, MatDialogModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameObserversPlayersComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
