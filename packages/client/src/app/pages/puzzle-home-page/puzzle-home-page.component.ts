import { Component } from '@angular/core';
import { PuzzleService } from '@app/services/puzzle-service/puzzle.service';
import { Observable } from 'rxjs';
import { DailyPuzzleLeaderboard, DailyPuzzleResult, PUZZLE_NOT_COMPLETED } from '@common/models/puzzle';
import { map } from 'rxjs/operators';
import {
    DAILY_PUZZLE_LEADERBOARD_COUNT,
    DAILY_PUZZLE_MESSAGE_FIRST,
    DAILY_PUZZLE_MESSAGE_IN_LEADERBOARD,
    DAILY_PUZZLE_MESSAGE_NOT_COMPLETED,
    DAILY_PUZZLE_MESSAGE_NOT_IN_LEADERBOARD,
    DAILY_PUZZLE_MESSAGE_NOT_WON,
} from '@app/constants/puzzle-constants';
import { ROUTE_PUZZLE_GAME, ROUTE_PUZZLE_GAME_DAILY } from '@app/constants/routes-constants';

@Component({
    selector: 'app-puzzle-home-page',
    templateUrl: './puzzle-home-page.component.html',
    styleUrls: ['./puzzle-home-page.component.scss'],
})
export class PuzzleHomePageComponent {
    isDailyCompleted: Observable<boolean>;
    dailyPuzzleMessage: Observable<string>;
    leaderboard: Observable<DailyPuzzleResult[]>;
    dailyPuzzleDate = new Date();
    routePuzzlePractice = ROUTE_PUZZLE_GAME;
    routeDailyPuzzle = ROUTE_PUZZLE_GAME_DAILY;

    constructor(private readonly puzzleService: PuzzleService) {
        this.isDailyCompleted = this.puzzleService.isDailyCompleted();
        this.dailyPuzzleMessage = this.puzzleService.getDailyPuzzleLeaderboard().pipe(map(this.getMessage));
        this.leaderboard = this.puzzleService.getDailyPuzzleLeaderboard().pipe(map((leaderboard) => leaderboard.leaderboard));
    }

    private getMessage(leaderboard: DailyPuzzleLeaderboard): string {
        if (leaderboard.userScore === PUZZLE_NOT_COMPLETED) return DAILY_PUZZLE_MESSAGE_NOT_COMPLETED;
        if (leaderboard.userScore <= 0) return DAILY_PUZZLE_MESSAGE_NOT_WON;
        if (leaderboard.userScore > 0 && leaderboard.userRank === 1) return DAILY_PUZZLE_MESSAGE_FIRST;
        if (leaderboard.userScore > 0 && leaderboard.userRank <= DAILY_PUZZLE_LEADERBOARD_COUNT) return DAILY_PUZZLE_MESSAGE_IN_LEADERBOARD;
        else return DAILY_PUZZLE_MESSAGE_NOT_IN_LEADERBOARD(leaderboard.userRank, leaderboard.totalPlayers);
    }
}
