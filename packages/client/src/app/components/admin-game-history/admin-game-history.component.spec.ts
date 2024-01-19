// /* eslint-disable dot-notation */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/no-magic-numbers */
// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { ReactiveFormsModule } from '@angular/forms';
// import { MatOptionModule } from '@angular/material/core';
// import { MatDialogModule } from '@angular/material/dialog';
// import { MatDividerModule } from '@angular/material/divider';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// import { MatSelectModule } from '@angular/material/select';
// import { MatSnackBarModule } from '@angular/material/snack-bar';
// import { MatSort } from '@angular/material/sort';
// import { MatTooltipModule } from '@angular/material/tooltip';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { GameHistoryState } from '@app/classes/admin/admin-game-history';
// import { IconComponent } from '@app/components/icon/icon.component';
// import { DEFAULT_GAME_HISTORY_COLUMNS, GAME_HISTORY_COLUMNS } from '@app/constants/components-constants';
// import { GameMode } from '@app/constants/game-mode';
// import { GameType } from '@app/constants/game-type';
// import { GameHistoryService } from '@app/services/game-history-service/game-history.service';
// import { GameHistoryWithPlayers } from '@common/models/game-history';
// import { NoId } from '@common/types/id';
// import { AdminGameHistoryComponent } from './admin-game-history.component';

// describe('AdminGameHistoryComponent', () => {
//     let component: AdminGameHistoryComponent;
//     let fixture: ComponentFixture<AdminGameHistoryComponent>;
//     let gameHistoryServiceSpy: jasmine.SpyObj<GameHistoryService>;

//     beforeEach(async () => {
//         gameHistoryServiceSpy = jasmine.createSpyObj(GameHistoryService, {
//             getGameHistories: Promise.resolve([]),
//             resetGameHistories: Promise.resolve(),
//         });

//         await TestBed.configureTestingModule({
//             imports: [
//                 BrowserAnimationsModule,
//                 ReactiveFormsModule,
//                 MatFormFieldModule,
//                 MatSelectModule,
//                 MatDividerModule,
//                 MatOptionModule,
//                 MatProgressSpinnerModule,
//                 MatTooltipModule,
//                 MatSnackBarModule,
//                 MatPaginatorModule,
//                 MatDividerModule,
//                 MatDialogModule,
//             ],
//             declarations: [AdminGameHistoryComponent, MatSort, MatPaginator, IconComponent],
//             providers: [{ provide: GameHistoryService, useValue: gameHistoryServiceSpy }],
//         }).compileComponents();
//     });

//     beforeEach(() => {
//         fixture = TestBed.createComponent(AdminGameHistoryComponent);
//         component = fixture.componentInstance;
//         fixture.detectChanges();
//     });

//     it('should create', () => {
//         expect(component).toBeTruthy();
//     });

//     describe('ngOnInit', () => {
//         it('should call updateHistoryData', () => {
//             const spy = spyOn(component, 'updateHistoryData');

//             component.ngOnInit();

//             expect(spy).toHaveBeenCalled();
//         });
//     });

//     describe('resetHistory', () => {
//         it('should set state to loading', () => {
//             // eslint-disable-next-line @typescript-eslint/no-empty-function
//             gameHistoryServiceSpy.resetGameHistories.and.callFake(async () => new Promise(() => {}));

//             component.resetHistory();

//             expect(component.state).toEqual(GameHistoryState.Loading);
//         });

//         it('should call resetGameHistories', () => {
//             component.resetHistory();
//             expect(gameHistoryServiceSpy.resetGameHistories).toHaveBeenCalled();
//         });

//         it('should set dataSource to empty array', (done) => {
//             (component.dataSource.data as unknown) = [1, 2, 3];

//             component.resetHistory();

//             setTimeout(() => {
//                 expect(component.dataSource.data).toHaveSize(0);
//                 done();
//             });
//         });

//         it('should set state to ready', (done) => {
//             (component.state as unknown) = undefined;

//             component.resetHistory();

//             setTimeout(() => {
//                 expect(component.state).toEqual(GameHistoryState.Ready);
//                 done();
//             });
//         });

//         it('should open snackBar on error', (done) => {
//             const error = 'reset error';
//             const spy = spyOn(component['snackBar'], 'open');
//             gameHistoryServiceSpy.resetGameHistories.and.rejectWith(error);

//             component.resetHistory();

//             setTimeout(() => {
//                 expect(spy).toHaveBeenCalledOnceWith(error);
//                 done();
//             });
//         });
//     });

//     describe('updateHistoryData', () => {
//         it('should set state to loading', () => {
//             // eslint-disable-next-line @typescript-eslint/no-empty-function
//             gameHistoryServiceSpy.getGameHistories.and.callFake(async () => new Promise(() => {}));

//             component.updateHistoryData();

//             expect(component.state).toEqual(GameHistoryState.Loading);
//         });

//         it('should call getGameHistories', () => {
//             component.updateHistoryData();

//             expect(gameHistoryServiceSpy.getGameHistories).toHaveBeenCalled();
//         });

//         it('should set state to ready on resolve', (done) => {
//             (component.state as unknown) = undefined;

//             component.updateHistoryData();

//             setTimeout(() => {
//                 expect(component.state).toEqual(GameHistoryState.Ready);
//                 done();
//             });
//         });

//         it('should set state to ready on resolve', (done) => {
//             const data = new Array<GameHistoryWithPlayers>();
//             gameHistoryServiceSpy.getGameHistories.and.resolveTo(data);

//             component.updateHistoryData();

//             setTimeout(() => {
//                 expect(component.dataSource.data).toEqual(data);
//                 done();
//             });
//         });

//         it('should set error on reject', (done) => {
//             const error = 'update error';
//             gameHistoryServiceSpy.getGameHistories.and.rejectWith(error);

//             component.updateHistoryData();

//             setTimeout(() => {
//                 expect(component.error).toEqual(error);
//                 done();
//             });
//         });

//         it('should set state to error on reject', (done) => {
//             const error = 'update error';
//             gameHistoryServiceSpy.getGameHistories.and.rejectWith(error);

//             component.updateHistoryData();

//             setTimeout(() => {
//                 expect(component.state).toEqual(GameHistoryState.Error);
//                 done();
//             });
//         });
//     });

//     describe('getColumnIterator', () => {
//         it('should convert columns object to array', () => {
//             (component.columns as unknown) = { a: 'b', c: 'd' };
//             const expected = [
//                 { key: 'a', label: 'b' },
//                 { key: 'c', label: 'd' },
//             ];

//             const result = component['getColumnIterator']();

//             expect(result as unknown).toEqual(expected);
//         });
//     });

//     describe('getDisplayedColumns', () => {
//         it('should get keys of selectedColumnsItems', () => {
//             (component.selectedColumnsItems as unknown) = [
//                 { key: 'a', label: 'b' },
//                 { key: 'c', label: 'd' },
//             ];
//             const expected = ['a', 'c'];

//             const result = component.getDisplayedColumns();

//             expect(result as unknown).toEqual(expected);
//         });
//     });

//     describe('getSelectedColumns', () => {
//         it('should get columns from DEFAULT_COLUMNS', () => {
//             const expected = DEFAULT_GAME_HISTORY_COLUMNS.map((key) => ({ key, label: GAME_HISTORY_COLUMNS[key] }));

//             const result = component['getSelectedColumns']();

//             expect(expected).toEqual(result);
//         });

//         it('should create new columns if DEFAULT_COLUMNS is empty', () => {
//             component.columnsItems = [];
//             const expected = DEFAULT_GAME_HISTORY_COLUMNS.map((key) => ({ key, label: GAME_HISTORY_COLUMNS[key] }));

//             const result = component['getSelectedColumns']();

//             expect(expected).toEqual(result);
//         });
//     });

//     describe('sortGameHistory', () => {
//         let gameHistory: NoId<GameHistoryWithPlayers>;

//         beforeEach(() => {
//             gameHistory = {
//                 startTime: new Date(2022, 2, 28),
//                 endTime: new Date(2022, 2, 29),
//                 playersData: [
//                     {
//                         name: 'player-1',
//                         score: 1,
//                         isVirtualPlayer: false,
//                         isWinner: true,
//                         playerIndex: 1,
//                     },
//                     {
//                         name: 'player-2',
//                         score: 2,
//                         isVirtualPlayer: true,
//                         isWinner: false,
//                         playerIndex: 2,
//                     },
//                 ],
//                 gameType: GameType.Classic,
//                 gameMode: GameMode.Multiplayer,
//                 hasBeenAbandoned: false,
//             };
//         });

//         it('should return startTime for startDate', () => {
//             const expected = gameHistory.startTime.valueOf();

//             expect(component['sortGameHistory'](gameHistory, 'startDate')).toEqual(expected);
//         });

//         it('should return endTime for endDate', () => {
//             const expected = gameHistory.endTime.valueOf();

//             expect(component['sortGameHistory'](gameHistory, 'endDate')).toEqual(expected);
//         });

//         it('should return endTime - startTime for duration', () => {
//             const expected = gameHistory.endTime.valueOf() - gameHistory.startTime.valueOf();

//             expect(component['sortGameHistory'](gameHistory, 'duration')).toEqual(expected);
//         });

//         it('should return empty array if property does not exists', () => {
//             expect(component['sortGameHistory'](gameHistory, 'invalidProperty')).toEqual('');
//         });
//     });

//     describe('getDuration', () => {
//         const tests: [start: Date, end: Date, expected: number][] = [
//             [new Date(1, 1, 1, 3, 30), new Date(1, 1, 1, 5, 45), 8100000],
//             [new Date(1, 1, 1, 5, 0), new Date(1, 1, 1, 16, 0), 39600000],
//             [new Date(1, 1, 1, 5, 0), new Date(1, 1, 2, 6, 0), 90000000],
//         ];

//         let index = 1;
//         for (const [start, end, expected] of tests) {
//             it(`should get duration (${index})`, () => {
//                 const item: GameHistoryWithPlayers = { startTime: start, endTime: end } as GameHistoryWithPlayers;
//                 expect(component.getDuration(item)).toEqual(expected);
//             });
//             index++;
//         }
//     });

//     describe('askResetHistory', () => {
//         it('should call MatDialog open', () => {
//             const spy = spyOn(component['dialog'], 'open');
//             component.askResetHistory();
//             expect(spy).toHaveBeenCalled();
//         });
//     });
// });
