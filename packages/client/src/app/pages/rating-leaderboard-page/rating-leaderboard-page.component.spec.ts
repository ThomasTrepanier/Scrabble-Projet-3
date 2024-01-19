import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { RatingLeaderboardPageComponent } from './rating-leaderboard-page.component';

describe('RatingLeaderboardPageComponent', () => {
    let component: RatingLeaderboardPageComponent;
    let fixture: ComponentFixture<RatingLeaderboardPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [RatingLeaderboardPageComponent],
            imports: [HttpClientTestingModule, MatSnackBarModule, MatDialogModule, RouterTestingModule.withRoutes([])],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(RatingLeaderboardPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
