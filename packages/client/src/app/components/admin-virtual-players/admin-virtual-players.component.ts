// import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
// import { MatDialog } from '@angular/material/dialog';
// import { MatSnackBar } from '@angular/material/snack-bar';
// import { MatSort } from '@angular/material/sort';
// import { MatTableDataSource } from '@angular/material/table';
// import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';
// import { CreateVirtualPlayerComponent } from '@app/components/create-virtual-player-dialog/create-virtual-player-dialog.component';
// import { DeleteVirtualPlayerDialogComponent } from '@app/components/delete-virtual-player-dialog/delete-virtual-player-dialog.component';
// import { UpdateVirtualPlayerComponent } from '@app/components/update-virtual-player-dialog/update-virtual-player-dialog.component';
// import {
//     ADMIN_RESET_MESSAGE,
//     ADMIN_RESET_VIRTUAL_PLAYER_TITLE,
//     CANCEL,
//     CANCEL_ICON,
//     REINITIALIZE,
//     REINITIALIZE_ICON,
//     VIRTUAL_PLAYERS_COLUMNS,
// } from '@app/constants/components-constants';
// import {
//     CREATE_VIRTUAL_PLAYER_DIALOG_HEIGHT,
//     CREATE_VIRTUAL_PLAYER_DIALOG_WIDTH,
//     PositiveFeedbackResponse,
//     UPDATE_VIRTUAL_PLAYER_DIALOG_HEIGHT,
//     UPDATE_VIRTUAL_PLAYER_DIALOG_WIDTH,
// } from '@app/constants/dialogs-constants';
// import { SNACK_BAR_ERROR_DURATION, SNACK_BAR_SUCCESS_DURATION } from '@app/constants/dictionaries-components';
// import { PositiveFeedback } from '@app/constants/virtual-players-components-constants';
// import { VirtualPlayerProfilesService } from '@app/services/virtual-player-profile-service/virtual-player-profile.service';
// import { Subject } from 'rxjs';
// import { DefaultDialogComponent } from '@app/components/default-dialog/default-dialog.component';
// import {
//     DeleteVirtualPlayerDialogParameters,
//     DisplayVirtualPlayersColumns,
//     DisplayVirtualPlayersColumnsIteratorItem,
//     DisplayVirtualPlayersKeys,
//     UpdateVirtualPlayersDialogParameters,
//     VirtualPlayersComponentState,
// } from './admin-virtual-players.types';
// import { VirtualPlayer } from '@common/models/virtual-player';

// @Component({
//     selector: 'app-admin-virtual-players',
//     templateUrl: './admin-virtual-players.component.html',
//     styleUrls: ['./admin-virtual-players.component.scss'],
// })
// export class AdminVirtualPlayersComponent implements OnInit, OnDestroy {
//     @ViewChild(MatSort) sortBeginner: MatSort;
//     @ViewChild(MatSort) sortExpert: MatSort;
//     columns: DisplayVirtualPlayersColumns;
//     dataSourceBeginner: MatTableDataSource<VirtualPlayer>;
//     dataSourceExpert: MatTableDataSource<VirtualPlayer>;
//     state: VirtualPlayersComponentState;
//     error: string | undefined;
//     isWaitingForServerResponse: boolean;
//     private columnsItems: DisplayVirtualPlayersColumnsIteratorItem[];
//     private componentDestroyed$: Subject<boolean>;

//     constructor(public dialog: MatDialog, private virtualPlayerProfilesService: VirtualPlayerProfilesService, private snackBar: MatSnackBar) {
//         this.componentDestroyed$ = new Subject();
//         this.columns = VIRTUAL_PLAYERS_COLUMNS;
//         this.columnsItems = this.getColumnIterator();
//         this.dataSourceBeginner = new MatTableDataSource(new Array());
//         this.dataSourceExpert = new MatTableDataSource(new Array());
//         this.state = VirtualPlayersComponentState.Loading;
//         this.error = undefined;

//         this.initializeSubscriptions();
//     }

//     ngOnDestroy(): void {
//         this.componentDestroyed$.next(true);
//         this.componentDestroyed$.complete();
//     }

//     ngOnInit(): void {
//         this.virtualPlayerProfilesService.getAllVirtualPlayersProfile();
//     }

//     updateVirtualPlayer(virtualPlayerProfile: VirtualPlayer): void {
//         const virtualPlayerData: UpdateVirtualPlayersDialogParameters = {
//             name: virtualPlayerProfile.name,
//             level: virtualPlayerProfile.level as VirtualPlayerLevel,
//             idVirtualPlayer: virtualPlayerProfile.idVirtualPlayer,
//         };
//         this.dialog.open(UpdateVirtualPlayerComponent, {
//             data: virtualPlayerData,
//             height: UPDATE_VIRTUAL_PLAYER_DIALOG_HEIGHT,
//             width: UPDATE_VIRTUAL_PLAYER_DIALOG_WIDTH,
//         });
//     }

//     createVirtualPlayer(): void {
//         this.dialog.open(CreateVirtualPlayerComponent, {
//             height: CREATE_VIRTUAL_PLAYER_DIALOG_HEIGHT,
//             width: CREATE_VIRTUAL_PLAYER_DIALOG_WIDTH,
//         });
//     }

//     deleteVirtualPlayer(virtualPlayerProfile: VirtualPlayer): void {
//         this.dialog.open(DeleteVirtualPlayerDialogComponent, {
//             data: {
//                 name: virtualPlayerProfile.name,
//                 level: virtualPlayerProfile.level,
//                 idVirtualPlayer: virtualPlayerProfile.idVirtualPlayer,
//                 // We haven't been able to test that the right function is called because this
//                 // arrow function creates a new instance of the function. We cannot spy on it.
//                 // It totally works tho, try it!
//                 onClose: () => {
//                     this.isWaitingForServerResponse = true;
//                 },
//             } as DeleteVirtualPlayerDialogParameters,
//         });
//     }

//     askResetVirtualPlayers(): void {
//         this.dialog.open(DefaultDialogComponent, {
//             data: {
//                 title: ADMIN_RESET_VIRTUAL_PLAYER_TITLE,
//                 content: ADMIN_RESET_MESSAGE,
//                 buttons: [
//                     {
//                         content: CANCEL,
//                         closeDialog: true,
//                         icon: CANCEL_ICON,
//                     },
//                     {
//                         content: REINITIALIZE,
//                         action: this.resetVirtualPlayers.bind(this),
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

//     resetVirtualPlayers(): void {
//         this.virtualPlayerProfilesService.resetVirtualPlayerProfiles();
//     }

//     getColumnIterator(): DisplayVirtualPlayersColumnsIteratorItem[] {
//         return Object.keys(this.columns).map<DisplayVirtualPlayersColumnsIteratorItem>((key) => ({
//             key: key as DisplayVirtualPlayersKeys,
//             label: this.columns[key as DisplayVirtualPlayersKeys],
//         }));
//     }

//     getDisplayedColumns(): DisplayVirtualPlayersKeys[] {
//         return this.columnsItems.map(({ key }) => key);
//     }

//     private convertVirtualPlayerProfilesToMatDataSource(virtualPlayerProfiles: VirtualPlayer[]): void {
//         this.dataSourceBeginner.data = virtualPlayerProfiles.filter((profile) => {
//             return profile.level === VirtualPlayerLevel.Beginner;
//         });
//         this.dataSourceExpert.data = virtualPlayerProfiles.filter((profile) => {
//             return profile.level === VirtualPlayerLevel.Expert;
//         });
//     }

//     private initializeSubscriptions(): void {
//         this.virtualPlayerProfilesService.subscribeToVirtualPlayerProfilesUpdateEvent(this.componentDestroyed$, (profiles) => {
//             this.convertVirtualPlayerProfilesToMatDataSource(profiles);
//             this.state = VirtualPlayersComponentState.Ready;
//             this.isWaitingForServerResponse = false;
//         });

//         this.virtualPlayerProfilesService.subscribeToRequestSentEvent(this.componentDestroyed$, () => {
//             this.isWaitingForServerResponse = true;
//         });

//         this.virtualPlayerProfilesService.subscribeToComponentUpdateEvent(this.componentDestroyed$, (response) => {
//             this.snackBar.open(response, 'OK', this.isFeedbackPositive(response as PositiveFeedback));
//         });
//     }

//     private isFeedbackPositive(response: PositiveFeedback): PositiveFeedbackResponse {
//         return Object.values(PositiveFeedback).includes(response as PositiveFeedback)
//             ? { duration: SNACK_BAR_SUCCESS_DURATION, panelClass: ['success'] }
//             : { duration: SNACK_BAR_ERROR_DURATION, panelClass: ['error'] };
//     }
// }
