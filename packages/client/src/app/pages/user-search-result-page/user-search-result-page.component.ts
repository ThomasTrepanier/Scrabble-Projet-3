import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { ROUTE_PUZZLE_HOME, ROUTE_RATING_LEADERBOARD } from '@app/constants/routes-constants';
import { USER_NOT_FOUND } from '@app/constants/services-errors';
import { LocatorService } from '@app/services/locator-service/locator.service';
import { UserService } from '@app/services/user-service/user.service';
import { GameHistoryForUser } from '@common/models/game-history';
import { UserSearchResult } from '@common/models/user-search';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { UserAchievement } from '@common/models/achievement';
import { Timer } from '@app/classes/round/timer';
@Component({
    selector: 'app-user-search-result-page',
    templateUrl: './user-search-result-page.component.html',
    styleUrls: ['./user-search-result-page.component.scss'],
})
export class UserSearchResultPageComponent implements AfterViewInit {
    @ViewChild('gameHistoryPaginator') gameHistoryPaginator: MatPaginator;

    gameHistoryColumns: string[] = ['startTime', 'endTime', 'gameResult', 'ratingVariation', 'score'];

    user$: Observable<UserSearchResult | undefined>;
    error$: Observable<string | undefined>;
    averageTimePerGame: Observable<string | undefined>;
    gameHistory: MatTableDataSource<GameHistoryForUser>;
    achievements: Observable<UserAchievement[] | undefined>;

    constructor(private readonly route: ActivatedRoute, private readonly userService: UserService, private locatorService: LocatorService) {
        this.user$ = this.userService.getProfileByUsername(this.route.params.pipe(map((params) => params.username)));
        this.error$ = this.user$.pipe(
            map(() => undefined),
            catchError(() => of(USER_NOT_FOUND)),
        );

        this.gameHistory = new MatTableDataSource<GameHistoryForUser>([]);

        this.user$.subscribe((user) => {
            this.gameHistory.data = user?.gameHistory ?? [];
        });
        this.achievements = this.user$.pipe(map((user) => user?.achievements ?? []));
        this.averageTimePerGame = this.user$.pipe(map((user) => Timer.convertTime(user?.statistics.averageTimePerGame ?? 0).getStringTimer()));
    }

    ngAfterViewInit(): void {
        this.gameHistory.paginator = this.gameHistoryPaginator;
    }

    get previousUrl(): string | undefined {
        return [ROUTE_RATING_LEADERBOARD, ROUTE_PUZZLE_HOME].some((route) => route.includes(this.locatorService.getPreviousUrl()))
            ? this.locatorService.getPreviousUrl()
            : undefined;
    }
}
