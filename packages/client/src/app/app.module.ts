import { ScrollingModule } from '@angular/cdk/scrolling';
import { registerLocaleData } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import localeFr from '@angular/common/locales/fr';
import { APP_INITIALIZER, LOCALE_ID, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SquareComponent } from '@app/components/square/square.component';
import { TileRackComponent } from '@app/components/tile-rack/tile-rack.component';
import { TileComponent } from '@app/components/tile/tile.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { CreateWaitingPageComponent } from '@app/pages/create-waiting-page/create-waiting-page.component';
import { HomePageComponent } from '@app/pages/home-page/home-page.component';
import { JoinWaitingPageComponent } from '@app/pages/join-waiting-page/join-waiting-page.component';
import { ChatBoxComponent } from './components/chatbox/chatbox.component';
import { CommunicationBoxComponent } from './components/communication-box/communication-box.component';
import { DefaultDialogComponent } from './components/default-dialog/default-dialog.component';
import { HighScoreBoxComponent } from './components/high-score-box/high-score-box.component';
import { IconComponent } from './components/icon/icon.component';
import { GroupInfoComponent } from './components/group-info/group-info.component';
import { PageHeaderComponent } from './components/page-header/page-header.component';
import { TimerSelectionComponent } from './components/timer-selection/timer-selection.component';
import { GameCreationPageComponent } from './pages/game-creation-page/game-creation-page.component';
import { LoadingPageComponent } from './pages/loading-page/loading-page.component';
import { GroupsPageComponent } from './pages/groups-page/groups-page.component';
import { DurationPipe } from './pipes/duration/duration.pipe';
import { InitializerService } from './services/initializer-service/initializer.service';
import { ChatboxContainerComponent } from './components/chatbox-container/chatbox-container.component';
import { ChatboxMessageComponent } from './components/chatbox-message/chatbox-message.component';
import { IconButtonComponent } from './components/icon-button/icon-button.component';
import { ChatboxWrapperComponent } from './wrappers/chatbox-wrapper/chatbox-wrapper.component';
import { AlertComponent } from './components/alert/alert.component';
import { SignUpPageComponent } from './pages/signup-page/signup-page.component';
import { SignupWrapperComponent } from './wrappers/signup-wrapper/signup-wrapper.component';
import { SignupContainerComponent } from './components/signup-container/signup-container.component';
import { LoginWrapperComponent } from './wrappers/login-wrapper/login-wrapper.component';
import { LoginContainerComponent } from './components/login-container/login-container.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { HeaderBtnComponent } from './components/header-btn/header-btn.component';
import { AuthenticationInterceptor } from './middlewares/authentication';
import { RequestingUserContainerComponent } from './components/requesting-user-container/requesting-user-container.component';
import { GroupRequestWaitingDialogComponent } from './components/group-request-waiting-dialog/group-request-waiting-dialog';
import { GroupInfoDetailedComponent } from './components/group-info-detailed/group-info-detailed.component';
import { GroupPasswordDialogComponent } from './components/group-password-waiting-dialog/group-password-waiting-dialog';
import { ObserverGamePageComponent } from './pages/observer-game-page/observer-game-page.component';
import { SrcDirective } from './directives/src-directive/src.directive';
import { UserProfileInfoComponent } from './components/user-profile/user-profile-info/user-profile-info.component';
import { UserProfileStatsItemComponent } from './components/user-profile/user-profile-stats-item/user-profile-stats-item.component';
import { UserProfilePageComponent } from './pages/user-profile-page/user-profile-page.component';
import { UserProfileEditDialogComponent } from './components/user-profile/user-profile-edit-dialog/user-profile-edit-dialog.component';
import { SearchPageComponent } from './pages/search-page/search-page.component';
import { UserSearchResultPageComponent } from './pages/user-search-result-page/user-search-result-page.component';
import { ChooseBlankTileDialogComponent } from './components/choose-blank-tile-dialog/choose-blank-tile-dialog.component';
import { PuzzlePageComponent } from './pages/puzzle-page/puzzle-page.component';
import { BoardComponent } from './components/board/board.component';
import { GameBoardWrapperComponent } from './wrappers/game-board-wrapper/game-board-wrapper.component';
import { StartPuzzleModalComponent } from './components/puzzle/start-puzzle-modal/start-puzzle-modal.component';
import { PuzzleScoreComponent } from './components/puzzle/puzzle-score/puzzle-score.component';
import { PuzzleResultModalComponent } from './components/puzzle/puzzle-result-modal/puzzle-result-modal.component';
import { SwiperComponent } from '@app/modules/swiper/components/swiper/swiper.component';
import { SwiperSlideComponent } from '@app/modules/swiper/components/swiper-slide/swiper-slide.component';
import { SwiperNavigationComponent } from '@app/modules/swiper/components/swiper-navigation/swiper-navigation.component';
import { PuzzleHistoryComponent } from '@app/components/puzzle/puzzle-history/puzzle-history.component';
import { RatingLeaderboardPageComponent } from './pages/rating-leaderboard-page/rating-leaderboard-page.component';
import { LocatorService } from './services/locator-service/locator.service';
import { EndGameDialogComponent } from './components/end-game-dialog/end-game-dialog';
import { AnalysisOverviewComponent } from './components/analysis/analysis-overview/analysis-overview.component';
import { AnalysisResultModalComponent } from './components/analysis/analysis-result-modal/analysis-result-modal.component';
import { AnalysisWaitingDialogComponent } from './components/analysis/analysis-waiting-dialog/analysis-waiting-dialog';
import { UcWidgetModule } from 'ngx-uploadcare-widget';
import { AvatarSelectorComponent } from './components/user-profile/avatar-selector/avatar-selector.component';
import { GamePageComponent } from './pages/game-page/game-page.component';
import { GamePlayersComponent } from './components/game/game-players/game-players.component';
import { GameTilesLeftComponent } from './components/game/game-tiles-left/game-tiles-left.component';
import { GameTimerComponent } from './components/game/game-timer/game-timer.component';
import { GameObserversPlayersComponent } from './components/game/game-observers-players/game-observers-players.component';
import { ColorThemeDialogComponent } from './components/color-theme-dialog/color-theme-dialog';
import { ColorThemeService } from './services/color-theme-service/color-theme.service';
import { ClickSoundDirective } from './directives/button-sound-directive/click-sound.directive';
import { SoundSettingsDialogComponent } from './components/sound-settings-dialog/sound-settings-dialog';
import { PuzzleHomePageComponent } from './pages/puzzle-home-page/puzzle-home-page.component';
import { UserAchievementComponent } from './components/user-profile/user-achievement/user-achievement.component';
import { UserAchievementDialogComponent } from './components/user-profile/user-achievement-dialog/user-achievement-dialog.component';

registerLocaleData(localeFr);

/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [
        AppComponent,
        HomePageComponent,
        SignUpPageComponent,
        LoginPageComponent,
        SquareComponent,
        TileComponent,
        CommunicationBoxComponent,
        TileRackComponent,
        GroupsPageComponent,
        GroupInfoComponent,
        CreateWaitingPageComponent,
        JoinWaitingPageComponent,
        GameCreationPageComponent,
        DefaultDialogComponent,
        IconComponent,
        TimerSelectionComponent,
        PageHeaderComponent,
        HighScoreBoxComponent,
        DurationPipe,
        LoadingPageComponent,
        ChatBoxComponent,
        ChatboxContainerComponent,
        ChatboxMessageComponent,
        IconButtonComponent,
        ChatboxWrapperComponent,
        AlertComponent,
        SignupWrapperComponent,
        SignupContainerComponent,
        LoginWrapperComponent,
        LoginContainerComponent,
        HeaderBtnComponent,
        RequestingUserContainerComponent,
        GroupRequestWaitingDialogComponent,
        GroupInfoDetailedComponent,
        GroupPasswordDialogComponent,
        ObserverGamePageComponent,
        SrcDirective,
        UserProfileInfoComponent,
        UserProfileStatsItemComponent,
        UserProfilePageComponent,
        UserProfileEditDialogComponent,
        SearchPageComponent,
        UserSearchResultPageComponent,
        ChooseBlankTileDialogComponent,
        PuzzlePageComponent,
        BoardComponent,
        GameBoardWrapperComponent,
        StartPuzzleModalComponent,
        PuzzleScoreComponent,
        PuzzleResultModalComponent,
        PuzzleHistoryComponent,
        SwiperComponent,
        SwiperSlideComponent,
        SwiperNavigationComponent,
        AnalysisOverviewComponent,
        AnalysisResultModalComponent,
        AnalysisWaitingDialogComponent,
        AvatarSelectorComponent,
        RatingLeaderboardPageComponent,
        EndGameDialogComponent,
        GamePageComponent,
        GamePlayersComponent,
        GameTilesLeftComponent,
        GameTimerComponent,
        GameObserversPlayersComponent,
        ColorThemeDialogComponent,
        ClickSoundDirective,
        SoundSettingsDialogComponent,
        PuzzleHomePageComponent,
        UserAchievementComponent,
        UserAchievementDialogComponent,
    ],
    imports: [
        AppMaterialModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        ScrollingModule,
        UcWidgetModule,
    ],
    providers: [
        InitializerService,
        ColorThemeService,
        {
            provide: APP_INITIALIZER,
            useFactory: (initializer: InitializerService) => () => initializer.initialize(),
            deps: [InitializerService, LocatorService],
            multi: true,
        },
        {
            provide: LOCALE_ID,
            useValue: 'fr-CA',
        },
        { provide: HTTP_INTERCEPTORS, useClass: AuthenticationInterceptor, multi: true },
        LocatorService,
    ],
    bootstrap: [AppComponent],
    exports: [IconComponent],
})
export class AppModule {}
