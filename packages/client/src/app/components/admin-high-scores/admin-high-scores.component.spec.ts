// /* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable dot-notation */
// import { HttpClientTestingModule } from '@angular/common/http/testing';
// import { Injectable } from '@angular/core';
// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { MatDialogModule } from '@angular/material/dialog';
// import { MatSnackBarModule } from '@angular/material/snack-bar';
// import { RouterTestingModule } from '@angular/router/testing';
// import { IconComponent } from '@app/components/icon/icon.component';
// import { GameType } from '@app/constants/game-type';
// import HighScoresService from '@app/services/high-score-service/high-score.service';
// import { SingleHighScore } from '@common/models/high-score';
// import { AdminHighScoresComponent } from './admin-high-scores.component';

// @Injectable()
// export class HighScoresServiceSpy extends HighScoresService {
//     // eslint-disable-next-line no-unused-vars
//     getHighScores(gameType: GameType): SingleHighScore[] {
//         return [];
//     }

//     handleHighScoresRequest(): void {
//         return;
//     }

//     resetHighScores(): void {
//         return;
//     }
// }

// describe('AdminHighScoresComponent', () => {
//     let component: AdminHighScoresComponent;
//     let fixture: ComponentFixture<AdminHighScoresComponent>;
//     let handleHighScoreRequestSpy: jasmine.Spy;
//     let subscribeSpy: jasmine.Spy;
//     let getHighScoresSpy: jasmine.Spy;
//     let resetHighScoresSpy: jasmine.Spy;

//     beforeEach(async () => {
//         await TestBed.configureTestingModule({
//             declarations: [AdminHighScoresComponent, IconComponent],
//             imports: [RouterTestingModule, HttpClientTestingModule, MatDialogModule, MatSnackBarModule],
//             providers: [{ provide: HighScoresService, useClass: HighScoresServiceSpy }],
//         }).compileComponents();
//     });

//     beforeEach(() => {
//         fixture = TestBed.createComponent(AdminHighScoresComponent);
//         component = fixture.componentInstance;
//         fixture.detectChanges();

//         handleHighScoreRequestSpy = spyOn<any>(component['highScoresService'], 'handleHighScoresRequest').and.callFake(() => {
//             return;
//         });
//         subscribeSpy = spyOn<any>(component['highScoresService'], 'subscribeToInitializedHighScoresListEvent').and.callFake(() => {
//             return;
//         });
//         getHighScoresSpy = spyOn(component['highScoresService'], 'getHighScores').and.returnValues([]);
//         resetHighScoresSpy = spyOn(component['highScoresService'], 'resetHighScores').and.callFake(() => {
//             return;
//         });
//     });

//     it('should create', () => {
//         expect(component).toBeTruthy();
//     });

//     describe('ngOnInit', () => {
//         it('should call highScoresService.handleHighScoresRequest and highScoresService.subscribeToInitializedHighScoresListEvent', () => {
//             component.ngOnInit();
//             expect(handleHighScoreRequestSpy).toHaveBeenCalled();
//             expect(subscribeSpy).toHaveBeenCalled();
//         });

//         it('initializedHighScoreListEvent should set initialized to true', () => {
//             component.isInitialized = false;
//             component.ngOnInit();
//             component['highScoresService']['highScoresListInitializedEvent'].next();
//             expect(component.isInitialized).toBeTrue();
//         });
//     });

//     describe('ngOnDestroy', () => {
//         it('should call next', () => {
//             const spy = spyOn(component['componentDestroyed$'], 'next');
//             spyOn(component['componentDestroyed$'], 'complete');
//             component.ngOnDestroy();
//             expect(spy).toHaveBeenCalled();
//         });

//         it('should call complete', () => {
//             spyOn(component['componentDestroyed$'], 'next');
//             const spy = spyOn(component['componentDestroyed$'], 'complete');
//             component.ngOnDestroy();
//             expect(spy).toHaveBeenCalled();
//         });
//     });

//     describe('getClassicHighScores', () => {
//         it('should call highScoresService.getHighScores with game type classic', () => {
//             expect(component.getClassicHighScores()).toEqual([]);
//             expect(getHighScoresSpy).toHaveBeenCalledWith(GameType.Classic);
//         });
//     });

//     describe('getLog2990HighScores', () => {
//         it('should call highScoresService.getHighScores with game type log2990', () => {
//             expect(component.getLog2990HighScores()).toEqual([]);
//             expect(getHighScoresSpy).toHaveBeenCalledWith(GameType.LOG2990);
//         });
//     });

//     describe('resetHighScores', () => {
//         it('should call highScoresService.resetHighScores', () => {
//             component.resetHighScores();
//             expect(resetHighScoresSpy).toHaveBeenCalled();
//         });
//     });

//     describe('askResetVirtualPlayers', () => {
//         it('should call MatDialog open', () => {
//             const spy = spyOn(component['dialog'], 'open');
//             component.askResetVirtualPlayers();
//             expect(spy).toHaveBeenCalled();
//         });
//     });
// });
