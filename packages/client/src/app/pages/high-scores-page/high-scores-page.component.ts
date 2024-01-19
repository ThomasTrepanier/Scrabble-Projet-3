// import { Component, OnDestroy, OnInit } from '@angular/core';
// import { FormControl, FormGroup, Validators } from '@angular/forms';
// import { GameType } from '@app/constants/game-type';
// import HighScoresService from '@app/services/high-score-service/high-score.service';
// import { SingleHighScore } from '@common/models/high-score';
// import { Subject } from 'rxjs';

// @Component({
//     selector: 'app-high-scores-page',
//     templateUrl: './high-scores-page.component.html',
//     styleUrls: ['./high-scores-page.component.scss'],
// })
// export class HighScoresPageComponent implements OnInit, OnDestroy {
//     highScoresParameters: FormGroup = new FormGroup({
//         gameType: new FormControl(GameType.Classic, Validators.required),
//     });
//     gameTypes = GameType;
//     isInitialized: boolean = false;

//     private componentDestroyed$: Subject<boolean> = new Subject();

//     constructor(private highScoresService: HighScoresService) {}

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

//     getHighScores(): SingleHighScore[] {
//         return this.highScoresService.getHighScores(this.highScoresParameters.get('gameType')?.value);
//     }
// }
