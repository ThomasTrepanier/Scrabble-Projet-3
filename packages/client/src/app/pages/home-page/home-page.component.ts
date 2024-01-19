import { Component } from '@angular/core';
import { LOGO } from '@app/constants/app-constants';
import { ColorThemeService } from '@app/services/color-theme-service/color-theme.service';
import { Observable } from 'rxjs';
import { ROUTE_GAME_CREATION, ROUTE_GROUPS, ROUTE_PUZZLE_HOME, ROUTE_RATING_LEADERBOARD } from '@app/constants/routes-constants';

@Component({
    selector: 'app-home-page',
    templateUrl: './home-page.component.html',
    styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent {
    routeGroups = ROUTE_GROUPS;
    routeGameCreation = ROUTE_GAME_CREATION;
    routePuzzle = ROUTE_PUZZLE_HOME;
    routeLeaderboard = ROUTE_RATING_LEADERBOARD;
    defaultLogo: string = LOGO;
    logo: Observable<string | undefined>;

    constructor(private colorThemeService: ColorThemeService) {
        this.logo = this.colorThemeService.getLogoTheme();
    }
}
