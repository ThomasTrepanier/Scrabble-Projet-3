// import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
// import { FormControl } from '@angular/forms';
// import { MatDialog } from '@angular/material/dialog';
// import { MatPaginator } from '@angular/material/paginator';
// import { MatSnackBar } from '@angular/material/snack-bar';
// import { MatSort } from '@angular/material/sort';
// import { MatTableDataSource } from '@angular/material/table';
// import {
//     DisplayGameHistoryColumns,
//     DisplayGameHistoryColumnsIteratorItem,
//     DisplayGameHistoryKeys,
//     GameHistoryState,
// } from '@app/classes/admin/admin-game-history';
// import {
//     ADMIN_RESET_HISTORY_TITLE,
//     ADMIN_RESET_MESSAGE,
//     CANCEL,
//     CANCEL_ICON,
//     DEFAULT_GAME_HISTORY_COLUMNS,
//     GAME_HISTORY_COLUMNS,
//     REINITIALIZE,
//     REINITIALIZE_ICON,
// } from '@app/constants/components-constants';
// import { GameHistoryService } from '@app/services/game-history-service/game-history.service';
// import { isKey } from '@app/utils/isKey/is-key';
// import { DefaultDialogComponent } from '@app/components/default-dialog/default-dialog.component';
// import { GameHistoryWithPlayers } from '@common/models/game-history';
// import { NoId } from '@common/types/id';

// @Component({
//     selector: 'app-admin-game-history',
//     templateUrl: './admin-game-history.component.html',
//     styleUrls: ['./admin-game-history.component.scss'],
// })
// export class AdminGameHistoryComponent implements OnInit, AfterViewInit {
//     @ViewChild(MatSort) sort: MatSort;
//     @ViewChild(MatPaginator) paginator: MatPaginator;

//     columns: DisplayGameHistoryColumns;
//     columnsItems: DisplayGameHistoryColumnsIteratorItem[];
//     selectedColumnsItems: DisplayGameHistoryColumnsIteratorItem[];
//     columnsControl: FormControl;
//     dataSource: MatTableDataSource<NoId<GameHistoryWithPlayers>>;
//     state: GameHistoryState;
//     error: string | undefined;

//     constructor(private readonly dialog: MatDialog, private readonly gameHistoryService: GameHistoryService,
// private readonly snackBar: MatSnackBar) {
//         this.columns = GAME_HISTORY_COLUMNS;
//         this.columnsItems = this.getColumnIterator();
//         this.selectedColumnsItems = this.getSelectedColumns();
//         this.columnsControl = new FormControl();
//         this.dataSource = new MatTableDataSource(new Array());
//         this.state = GameHistoryState.Loading;
//         this.error = undefined;
//         this.dataSource.sortingDataAccessor = this.sortGameHistory;
//         this.columnsControl.setValue(this.selectedColumnsItems);
//     }

//     ngOnInit(): void {
//         this.updateHistoryData();
//     }

//     ngAfterViewInit(): void {
//         this.dataSource.sort = this.sort;
//         this.dataSource.paginator = this.paginator;
//     }

//     askResetHistory(): void {
//         this.dialog.open(DefaultDialogComponent, {
//             data: {
//                 title: ADMIN_RESET_HISTORY_TITLE,
//                 content: ADMIN_RESET_MESSAGE,
//                 buttons: [
//                     {
//                         content: CANCEL,
//                         closeDialog: true,
//                         icon: CANCEL_ICON,
//                     },
//                     {
//                         content: REINITIALIZE,
//                         action: this.resetHistory.bind(this),
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

//     resetHistory(): void {
//         this.state = GameHistoryState.Loading;

//         this.gameHistoryService
//             .resetGameHistories()
//             .then(() => (this.dataSource.data = []))
//             .catch(this.snackBar.open)
//             .finally(() => (this.state = GameHistoryState.Ready));
//     }

//     updateHistoryData(): void {
//         this.state = GameHistoryState.Loading;

//         this.gameHistoryService
//             .getGameHistories()
//             .then((gameHistories) => {
//                 this.dataSource.data = gameHistories;
//                 this.state = GameHistoryState.Ready;
//             })
//             .catch((error) => {
//                 this.error = error.toString();
//                 this.state = GameHistoryState.Error;
//             });
//     }

//     getDisplayedColumns(): DisplayGameHistoryKeys[] {
//         return this.selectedColumnsItems.map(({ key }) => key);
//     }

//     getDuration(item: GameHistoryWithPlayers): number {
//         return item.endTime.getTime() - item.startTime.getTime();
//     }

//     private getColumnIterator(): DisplayGameHistoryColumnsIteratorItem[] {
//         return Object.keys(this.columns).map<DisplayGameHistoryColumnsIteratorItem>((key) => ({
//             key: key as DisplayGameHistoryKeys,
//             label: this.columns[key as DisplayGameHistoryKeys],
//         }));
//     }

//     private getSelectedColumns(): DisplayGameHistoryColumnsIteratorItem[] {
//         return DEFAULT_GAME_HISTORY_COLUMNS.map<DisplayGameHistoryColumnsIteratorItem>(
//             (key) => this.columnsItems.find((item) => item.key === key) || { key, label: this.columns[key] },
//         );
//     }

//     private sortGameHistory(item: NoId<GameHistoryWithPlayers>, property: string): string | number {
//         switch (property) {
//             case 'player1Name':
//                 return item.playersData[0]?.name;
//             case 'player1Score':
//                 return item.playersData[0]?.score;
//             case 'player1Data':
//                 return item.playersData[0]?.name;
//             case 'player2Name':
//                 return item.playersData[1]?.name;
//             case 'player2Score':
//                 return item.playersData[1]?.score;
//             case 'player2Data':
//                 return item.playersData[1]?.name;
//             case 'startDate':
//                 return item.startTime.valueOf();
//             case 'endDate':
//                 return item.endTime.valueOf();
//             case 'duration':
//                 return item.endTime.valueOf() - item.startTime.valueOf();
//             default:
//                 return isKey(property, item) ? (item[property] as string) : '';
//         }
//     }
// }
