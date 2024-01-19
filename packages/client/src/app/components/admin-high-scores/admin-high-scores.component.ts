// import { Component, OnDestroy, OnInit } from '@angular/core';
// import { MatDialog } from '@angular/material/dialog';
// import {
//     ADMIN_RESET_HIGH_SCORE_TITLE,
//     ADMIN_RESET_MESSAGE,
//     CANCEL,
//     CANCEL_ICON,
//     REINITIALIZE,
//     REINITIALIZE_ICON,
// } from '@app/constants/components-constants';
// import { GameType } from '@app/constants/game-type';
// import HighScoresService from '@app/services/high-score-service/high-score.service';
// import { Subject } from 'rxjs';
// import { DefaultDialogComponent } from '@app/components/default-dialog/default-dialog.component';
// import { SingleHighScore } from '@common/models/high-score';

// @Component({
//     selector: 'app-admin-high-scores',
//     templateUrl: './admin-high-scores.component.html',
//     styleUrls: ['./admin-high-scores.component.scss'],
// })
// export class AdminHighScoresComponent implements OnInit, OnDestroy {
//     isInitialized: boolean = false;

//     private componentDestroyed$: Subject<boolean> = new Subject();

//     constructor(private readonly dialog: MatDialog, private readonly highScoresService: HighScoresService) {}

//     ngOnInit(): void {
//         this.highScoresService.handleHighScoresRequest();
//         this.highScoresService.subscribeToInitializedHighScoresListEvent(this.componentDestroyed$, () => {
//             this.isInitialized = true;
//         });
//     }

//     ngOnDestroy(): void {
//         this.componentDestroyed$.next(true);
//         this.componentDestroyed$.complete();
//     }

//     getClassicHighScores(): SingleHighScore[] {
//         return this.highScoresService.getHighScores(GameType.Classic);
//     }

//     getLog2990HighScores(): SingleHighScore[] {
//         return this.highScoresService.getHighScores(GameType.LOG2990);
//     }

//     askResetVirtualPlayers(): void {
//         this.dialog.open(DefaultDialogComponent, {
//             data: {
//                 title: ADMIN_RESET_HIGH_SCORE_TITLE,
//                 content: ADMIN_RESET_MESSAGE,
//                 buttons: [
//                     {
//                         content: CANCEL,
//                         closeDialog: true,
//                         icon: CANCEL_ICON,
//                     },
//                     {
//                         content: REINITIALIZE,
//                         action: this.resetHighScores.bind(this),
//                         closeDialog: true,
//                         icon: REINITIALIZE_ICON,
//                         style: {
//                             background: 'tomato',
//                         },
//                     },
//                 ],
//             },
//         });
//     }

//     resetHighScores(): void {
//         this.highScoresService.resetHighScores();
//     }
// }
