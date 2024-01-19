import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UserService } from '@app/services/user-service/user.service';
import { GameHistoryForUser } from '@common/models/game-history';
import { PublicServerAction } from '@common/models/server-action';
import { PublicUser } from '@common/models/user';
import { PublicUserStatistics } from '@common/models/user-statistics';
import { BehaviorSubject, Subject } from 'rxjs';

import { UserProfilePageComponent } from './user-profile-page.component';

describe('UserProfilePageComponent', () => {
    let component: UserProfilePageComponent;
    let fixture: ComponentFixture<UserProfilePageComponent>;
    const userService = jasmine.createSpyObj('UserService', ['updateStatistics', 'updateGameHistory', 'updateServerActions', 'updateAchievements'], {
        achievements: new Subject(),
    });
    userService.user = new BehaviorSubject<PublicUser>({ email: '1@2', avatar: '', username: 'John Doe' });
    userService.statistics = new BehaviorSubject<PublicUserStatistics>({
        gamesPlayedCount: 1,
        gamesWonCount: 1,
        averageTimePerGame: 1,
        averagePointsPerGame: 1,
        rating: 1,
        ratingMax: 1,
        bingoCount: 0,
    });
    userService.gameHistory = new BehaviorSubject<GameHistoryForUser[]>([]);
    userService.serverActions = new BehaviorSubject<PublicServerAction[]>([]);

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [UserProfilePageComponent],
            imports: [HttpClientTestingModule, MatSnackBarModule, MatDialogModule, MatPaginatorModule, BrowserAnimationsModule],
            providers: [{ provide: UserService, useValue: userService }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(UserProfilePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
