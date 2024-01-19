import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import {
    AnalysisResultModalComponent,
    AnalysisResultModalParameters,
} from '@app/components/analysis/analysis-result-modal/analysis-result-modal.component';
import {
    AnalysisWaitingDialogComponent,
    AnalysisWaitingDialogParameter,
} from '@app/components/analysis/analysis-waiting-dialog/analysis-waiting-dialog';
import { ColorThemeDialogComponent } from '@app/components/color-theme-dialog/color-theme-dialog';
import { UserService } from '@app/services/user-service/user.service';
import { Analysis, AnalysisData, AnalysisRequestInfoType } from '@common/models/analysis';
import { GameHistoryForUser } from '@common/models/game-history';
import { PublicServerAction } from '@common/models/server-action';
import { TypeOfId } from '@common/types/id';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserAchievement } from '@common/models/achievement';
import { Timer } from '@app/classes/round/timer';

@Component({
    selector: 'app-user-profile-page',
    templateUrl: './user-profile-page.component.html',
    styleUrls: ['./user-profile-page.component.scss'],
})
export class UserProfilePageComponent implements OnInit, AfterViewInit {
    @ViewChild('gameHistoryPaginator') gameHistoryPaginator: MatPaginator;
    @ViewChild('serverActionsPaginator') serverActionsPaginator: MatPaginator;

    gameHistoryColumns: string[] = ['startTime', 'endTime', 'gameResult', 'ratingVariation', 'score', 'analysis'];
    serverActionsColumns: string[] = ['timestamp', 'actionType'];

    avatar: Observable<string | undefined>;
    username: Observable<string | undefined>;
    email: Observable<string | undefined>;
    gamesPlayedCount: Observable<number | undefined>;
    gamesWonCount: Observable<number | undefined>;
    averagePointsPerGame: Observable<number | undefined>;
    averageTimePerGame: Observable<string | undefined>;
    rating: Observable<number | undefined>;
    gameHistory: MatTableDataSource<GameHistoryForUser>;
    serverActions: MatTableDataSource<PublicServerAction>;
    achievements: Observable<UserAchievement[] | undefined>;
    analysis: Analysis;
    idAnalysis: TypeOfId<Analysis>;
    constructor(private readonly userService: UserService, private readonly dialog: MatDialog) {
        this.avatar = this.userService.user.pipe(map((user) => user?.avatar));
        this.username = this.userService.user.pipe(map((user) => user?.username));
        this.email = this.userService.user.pipe(map((user) => user?.email));

        this.gamesPlayedCount = this.userService.statistics.pipe(map((userStatistics) => userStatistics?.gamesPlayedCount));
        this.gamesWonCount = this.userService.statistics.pipe(map((userStatistics) => userStatistics?.gamesWonCount));
        this.averagePointsPerGame = this.userService.statistics.pipe(map((userStatistics) => userStatistics?.averagePointsPerGame));
        this.averageTimePerGame = this.userService.statistics.pipe(
            map((userStatistics) => Timer.convertTime(userStatistics?.averageTimePerGame ?? 0).getStringTimer()),
        );
        this.rating = this.userService.statistics.pipe(map((userStatistics) => userStatistics?.rating));
        this.achievements = this.userService.achievements.asObservable();

        this.gameHistory = new MatTableDataSource<GameHistoryForUser>([]);
        this.serverActions = new MatTableDataSource<PublicServerAction>([]);

        this.userService.gameHistory.subscribe((gameHistory) => (this.gameHistory.data = gameHistory ?? []));
        this.userService.serverActions.subscribe((serverActions) => (this.serverActions.data = serverActions ?? []));
    }

    ngOnInit(): void {
        this.userService.updateStatistics();
        this.userService.updateGameHistory();
        this.userService.updateServerActions();
        this.userService.updateAchievements();
    }

    ngAfterViewInit(): void {
        this.gameHistory.paginator = this.gameHistoryPaginator;
        this.serverActions.paginator = this.serverActionsPaginator;
    }

    openColorDialog(): void {
        this.dialog.open<ColorThemeDialogComponent>(ColorThemeDialogComponent, {});
    }

    openEditUserDialog(): void {
        this.userService.openEditUserDialog();
    }

    requestAnalysis(idAnalysis: TypeOfId<AnalysisData>): void {
        if (this.analysis && this.idAnalysis === idAnalysis) {
            this.showAnalysisModal(this.analysis);
        } else {
            const dialogRef = this.dialog.open<AnalysisWaitingDialogComponent, AnalysisWaitingDialogParameter>(AnalysisWaitingDialogComponent, {
                disableClose: false,
                data: { id: idAnalysis, type: AnalysisRequestInfoType.ID_ANALYSIS },
            });
            dialogRef.afterClosed().subscribe((analysis) => {
                if (analysis) {
                    this.analysis = analysis;
                    this.idAnalysis = idAnalysis;
                    this.showAnalysisModal(analysis);
                }
            });
        }
    }

    private showAnalysisModal(analysis: Analysis) {
        this.dialog.open<AnalysisResultModalComponent, AnalysisResultModalParameters>(AnalysisResultModalComponent, {
            disableClose: false,
            data: {
                leftButton: {
                    content: 'Retourner au profil',
                    closeDialog: true,
                },
                analysis,
            },
        });
    }
}
