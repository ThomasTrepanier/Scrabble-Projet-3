// /* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable dot-notation */
// import { HttpClientModule } from '@angular/common/http';
// import { TestBed } from '@angular/core/testing';
// import { MatSnackBarModule } from '@angular/material/snack-bar';
// import { RouterTestingModule } from '@angular/router/testing';
// import { GameType } from '@app/constants/game-type';
// import { HighScoresController } from '@app/controllers/high-score-controller/high-score.controller';
// import SocketService from '@app/services/socket-service/socket.service';
// import { HighScoreWithPlayers, SingleHighScore } from '@common/models/high-score';
// import { NoId } from '@common/types/id';
// import { Subject } from 'rxjs';
// import HighScoresService from './high-score.service';

// const DEFAULT_CLASSIC_HIGH_SCORES: SingleHighScore[] = [
//     { name: 'name1', score: 1 },
//     { name: 'name2', score: 2 },
// ];

// const DEFAULT_LOG2990_HIGH_SCORES: SingleHighScore[] = [
//     { name: 'name1', score: 1 },
//     { name: 'name2', score: 2 },
// ];
// const DEFAULT_CLASSIC_HIGH_SCORE_1: NoId<HighScoreWithPlayers> = { names: ['name1', 'name2', 'name3'], score: 1 };
// const DEFAULT_CLASSIC_HIGH_SCORE_2: NoId<HighScoreWithPlayers> = { names: ['non', 'name2'], score: 2 };
// const DEFAULT_CLASSIC_HIGH_SCORE_3: NoId<HighScoreWithPlayers> = { names: ['name2'], score: 3 };
// const DEFAULT_LOG2990_HIGH_SCORE_1: NoId<HighScoreWithPlayers> = { names: ['name2'], score: 11 };
// const DEFAULT_LOG2990_HIGH_SCORE_2: NoId<HighScoreWithPlayers> = { names: ['name2'], score: 22 };
// const DEFAULT_LOG2990_HIGH_SCORE_3: NoId<HighScoreWithPlayers> = { names: ['name2'], score: 33 };

// const DEFAULT_HIGH_SCORES: NoId<HighScoreWithPlayers>[] = [
//     DEFAULT_CLASSIC_HIGH_SCORE_1,
//     DEFAULT_LOG2990_HIGH_SCORE_1,
//     DEFAULT_LOG2990_HIGH_SCORE_2,
//     DEFAULT_CLASSIC_HIGH_SCORE_2,
//     DEFAULT_CLASSIC_HIGH_SCORE_3,
//     DEFAULT_LOG2990_HIGH_SCORE_3,
// ];

// const CLASSIC_HIGH_SCORES: NoId<HighScoreWithPlayers>[] =
// [DEFAULT_CLASSIC_HIGH_SCORE_3, DEFAULT_CLASSIC_HIGH_SCORE_1, DEFAULT_CLASSIC_HIGH_SCORE_2];

// const DEFAULT_HIGH_SCORES_MAP: Map<GameType, SingleHighScore[]> = new Map([
//     [GameType.Classic, DEFAULT_CLASSIC_HIGH_SCORES],
//     [GameType.LOG2990, DEFAULT_LOG2990_HIGH_SCORES],
// ]);

// describe('HighScoresService', () => {
//     let service: HighScoresService;
//     let highScoresControllerMock: HighScoresController;

//     beforeEach(() => {
//         TestBed.configureTestingModule({
//             imports: [HttpClientModule, RouterTestingModule, MatSnackBarModule],
//             providers: [HighScoresController, SocketService],
//         });
//         service = TestBed.inject(HighScoresService);

//         highScoresControllerMock = TestBed.inject(HighScoresController);
//     });

//     it('should be created', () => {
//         expect(service).toBeTruthy();
//     });

//     describe('Subscriptions', () => {
//         it('should call updateHighScores on HighScoresListEvent', () => {
//             const spy = spyOn<any>(service, 'updateHighScores');
//             service['highScoresController']['highScoresListEvent'].next([]);
//             expect(spy).toHaveBeenCalled();
//         });
//     });

//     describe('handleHighScoresRequest', () => {
//         let spyHandleGetHighScores: jasmine.Spy;

//         beforeEach(() => {
//             spyHandleGetHighScores = spyOn(highScoresControllerMock, 'handleGetHighScores').and.callFake(() => {
//                 return;
//             });
//         });

//         it('should call highScoresController.handleGetHighScores', () => {
//             service.handleHighScoresRequest();
//             expect(spyHandleGetHighScores).toHaveBeenCalled();
//         });
//     });

//     describe('resetHighScores', () => {
//         let spyResetHighScores: jasmine.Spy;

//         beforeEach(() => {
//             spyResetHighScores = spyOn(highScoresControllerMock, 'resetHighScores').and.callFake(() => {
//                 return;
//             });
//         });

//         it('should call highScoresController.resetHighScores', () => {
//             service.resetHighScores();
//             expect(spyResetHighScores).toHaveBeenCalled();
//         });
//     });

//     describe('subcription methods', () => {
//         let serviceDestroyed$: Subject<boolean>;
//         let callback: () => void;

//         beforeEach(() => {
//             serviceDestroyed$ = new Subject();
//             callback = () => {
//                 return;
//             };
//         });

//         it('subscribeToInitializedHighScoresListEvent should call subscribe method on highScoresListEvent', () => {
//             const subscriptionSpy = spyOn(service['highScoresListInitializedEvent'], 'subscribe');
//             service.subscribeToInitializedHighScoresListEvent(serviceDestroyed$, callback);
//             expect(subscriptionSpy).toHaveBeenCalled();
//         });
//     });

//     describe('getHighScores', () => {
//         it('should return a empty array if the map has is not initialized', () => {
//             service['highScoresMap'] = new Map();
//             expect(service.getHighScores(GameType.Classic)).toEqual([]);
//         });
//         it('should return the correct array if initialized', () => {
//             service['highScoresMap'] = DEFAULT_HIGH_SCORES_MAP;
//             expect(service.getHighScores(GameType.Classic)).toEqual(DEFAULT_CLASSIC_HIGH_SCORES);
//         });
//     });

//     describe('updateHighScores', () => {
//         it('should call separateHighScoresType and separateHighScores ', () => {
//             const spySeparateHighScoresType = spyOn<any>(service, 'separateHighScoresType').and.callFake(() => {
//                 return [DEFAULT_CLASSIC_HIGH_SCORES, DEFAULT_LOG2990_HIGH_SCORES];
//             });
//             const spySeparateHighScores = spyOn<any>(service, 'rankHighScores').and.callFake(() => {
//                 return [];
//             });
//             service['highScoresMap'] = new Map();
//             service['updateHighScores']([]);
//             expect(spySeparateHighScoresType).toHaveBeenCalled();
//             expect(spySeparateHighScores).toHaveBeenCalledTimes(2);
//         });
//         it('should set values ', () => {
//             spyOn<any>(service, 'separateHighScoresType').and.callFake(() => {
//                 return [DEFAULT_CLASSIC_HIGH_SCORES, DEFAULT_LOG2990_HIGH_SCORES];
//             });
//             spyOn<any>(service, 'rankHighScores').and.callFake(() => {
//                 return DEFAULT_CLASSIC_HIGH_SCORES;
//             });
//             const expected = new Map();
//             service['highScoresMap'] = new Map();

//             service['updateHighScores']([]);

//             expect(service['highScoresMap']).not.toEqual(expected);
//         });
//     });

//     describe('separateHighScoresType', () => {
//         it('should separate correctly the given array ', () => {
//             service['highScoresMap'] = new Map();
//             expect(service['separateHighScoresType'](DEFAULT_HIGH_SCORES)).toEqual([
//                 [
//                     DEFAULT_CLASSIC_HIGH_SCORE_1,
//                     DEFAULT_CLASSIC_HIGH_SCORE_2,
//                     DEFAULT_CLASSIC_HIGH_SCORE_3,
//                     DEFAULT_LOG2990_HIGH_SCORE_1,
//                     DEFAULT_LOG2990_HIGH_SCORE_2,
//                     DEFAULT_LOG2990_HIGH_SCORE_3,
//                 ],
//                 [
//                     DEFAULT_CLASSIC_HIGH_SCORE_1,
//                     DEFAULT_CLASSIC_HIGH_SCORE_2,
//                     DEFAULT_CLASSIC_HIGH_SCORE_3,
//                     DEFAULT_LOG2990_HIGH_SCORE_1,
//                     DEFAULT_LOG2990_HIGH_SCORE_2,
//                     DEFAULT_LOG2990_HIGH_SCORE_3,
//                 ],
//             ]);
//         });
//     });

//     describe('rankHighScores', () => {
//         it('should return the correct amount of elements ', () => {
//             service['highScoresMap'] = new Map();
//             let expected = 0;
//             CLASSIC_HIGH_SCORES.forEach((highScore) => {
//                 expected += highScore.names.length;
//                 return;
//             });
//             expect(service['rankHighScores'](CLASSIC_HIGH_SCORES).length).toEqual(expected);
//         });

//         it('should sort by score ', () => {
//             service['highScoresMap'] = new Map();
//             let isOrdered = true;
//             let lastScore = Number.MAX_VALUE;
//             const result = service['rankHighScores'](CLASSIC_HIGH_SCORES);
//             for (const highScore of result) {
//                 isOrdered = highScore.score <= lastScore;
//                 lastScore = highScore.score;
//             }
//             expect(isOrdered).toBeTrue();
//         });

//         it('should only include rank for first of score', () => {
//             service['highScoresMap'] = new Map();
//             let lastScore = Number.MAX_VALUE;
//             const result = service['rankHighScores'](CLASSIC_HIGH_SCORES);
//             for (const highScore of result) {
//                 if (highScore.score !== lastScore) expect(highScore.rank).toBeTruthy();
//                 else expect(highScore.rank).toBeUndefined();
//                 lastScore = highScore.score;
//             }
//         });
//     });
// });
