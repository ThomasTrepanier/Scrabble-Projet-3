import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ROUTE_SEARCH } from '@app/constants/routes-constants';
import { UserService } from '@app/services/user-service/user.service';
import { RatedUser } from '@common/models/user';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-rating-leaderboard',
    templateUrl: './rating-leaderboard-page.component.html',
    styleUrls: ['./rating-leaderboard-page.component.scss'],
})
export class RatingLeaderboardPageComponent {
    results: Observable<RatedUser[]>;
    ownUsername: string;

    constructor(private readonly userService: UserService, private router: Router) {
        this.results = this.userService.requestRatingLeaderboard();
        this.ownUsername = this.userService.getUser().username;
    }

    async reRoute(username: string) {
        const route = ROUTE_SEARCH + '/' + username;
        await this.router.navigateByUrl(route);
    }
}
