// import { Injectable } from '@angular/core';
// import { GameType } from '@app/constants/game-type';
// import { HighScoresController } from '@app/controllers/high-score-controller/high-score.controller';
// import { Subject } from 'rxjs';
// import { takeUntil } from 'rxjs/operators';
// import { HighScoreWithPlayers, SingleHighScore } from '@common/models/high-score';
// import { NoId } from '@common/types/id';
// @Injectable({
//     providedIn: 'root',
// })
// export default class HighScoresService {
//     private serviceDestroyed$: Subject<boolean> = new Subject();
//     private highScoresListInitializedEvent: Subject<void> = new Subject();
//     private highScoresMap: Map<GameType, SingleHighScore[]> = new Map();

//     constructor(private highScoresController: HighScoresController) {
//         this.highScoresController.subscribeToHighScoresListEvent(this.serviceDestroyed$, (highScores: HighScoreWithPlayers[]) => {
//             this.updateHighScores(highScores);
//             this.highScoresListInitializedEvent.next();
//         });
//     }

//     handleHighScoresRequest(): void {
//         this.highScoresController.handleGetHighScores();
//     }

//     subscribeToInitializedHighScoresListEvent(componentDestroyed$: Subject<boolean>, callback: () => void): void {
//         this.highScoresListInitializedEvent.pipe(takeUntil(componentDestroyed$)).subscribe(callback);
//     }

//     getHighScores(gameType: GameType): SingleHighScore[] {
//         const highScores = this.highScoresMap.get(gameType);
//         return highScores ? highScores : [];
//     }

//     resetHighScores(): void {
//         this.highScoresController.resetHighScores();
//     }

//     private updateHighScores(highScores: NoId<HighScoreWithPlayers>[]): void {
//         const [classicHighScores, log2990HighScores] = this.separateHighScoresType(highScores);
//         this.highScoresMap.set(GameType.Classic, this.rankHighScores(classicHighScores));
//         this.highScoresMap.set(GameType.LOG2990, this.rankHighScores(log2990HighScores));
//     }

//     private separateHighScoresType(highScores: NoId<HighScoreWithPlayers>[]): [NoId<HighScoreWithPlayers>[], NoId<HighScoreWithPlayers>[]] {
//         const classicHighScores: NoId<HighScoreWithPlayers>[] = [];
//         const log2990HighScores: NoId<HighScoreWithPlayers>[] = [];

//         highScores.forEach((highScore) => {
//             classicHighScores.push(highScore);
//             log2990HighScores.push(highScore);
//         });

//         return [classicHighScores, log2990HighScores];
//     }

//     private rankHighScores(highScores: NoId<HighScoreWithPlayers>[]): SingleHighScore[] {
//         const singleHighScores: SingleHighScore[] = [];
//         let rank = 1;
//         highScores = highScores.sort((previous, current) => current.score - previous.score);
//         highScores.forEach((highScore) => {
//             let isFirst = true;
//             for (const name of highScore.names) {
//                 if (isFirst) {
//                     singleHighScores.push({ ...highScore, name, rank: rank++ });
//                     isFirst = false;
//                 } else {
//                     singleHighScores.push({ ...highScore, name });
//                 }
//             }
//         });
//         return singleHighScores;
//     }
// }
