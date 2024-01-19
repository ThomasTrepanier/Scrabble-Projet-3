// import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
// import { MatDialog } from '@angular/material/dialog';
// import { MatPaginator } from '@angular/material/paginator';
// import { MatSnackBar } from '@angular/material/snack-bar';
// import { MatSort } from '@angular/material/sort';
// import { MatTableDataSource } from '@angular/material/table';
// import {
//     DictionariesState,
//     DisplayDictionaryColumns,
//     DisplayDictionaryColumnsIteratorItem,
//     DisplayDictionaryKeys,
// } from '@app/classes/admin/dictionaries';
// import { DefaultDialogComponent } from '@app/components/default-dialog/default-dialog.component';
// import { DeleteDictionaryDialogComponent } from '@app/components/delete-dictionary-dialog/delete-dictionary-dialog.component';
// import { DeleteDictionaryDialogParameters } from '@app/components/delete-dictionary-dialog/delete-dictionary-dialog.component.types';
// import { ModifyDictionaryComponent } from '@app/components/modify-dictionary-dialog/modify-dictionary-dialog.component';
// import { DictionaryDialogParameters } from '@app/components/modify-dictionary-dialog/modify-dictionary-dialog.component.types';
// import { UploadDictionaryComponent } from '@app/components/upload-dictionary/upload-dictionary.component';
// import {
//     ADMIN_RESET_DICTIONARY_TITLE,
//     ADMIN_RESET_MESSAGE,
//     CANCEL,
//     CANCEL_ICON,
//     DICTIONARIES_COLUMNS,
//     ERROR_SNACK_BAR_CONFIG,
//     REINITIALIZE,
//     REINITIALIZE_ICON,
//     SUCCESS_SNACK_BAR_CONFIG,
// } from '@app/constants/components-constants';
// import { PositiveFeedbackResponse } from '@app/constants/dialogs-constants';
// import { PositiveFeedback } from '@app/constants/dictionaries-components';
// import { DictionaryService } from '@app/services/dictionary-service/dictionary.service';
// import { Subject } from 'rxjs';

// @Component({
//     selector: 'app-admin-dictionaries',
//     templateUrl: './admin-dictionaries.component.html',
//     styleUrls: ['./admin-dictionaries.component.scss'],
// })
// export class AdminDictionariesComponent implements OnInit, AfterViewInit, OnDestroy {
//     @ViewChild(MatSort) sort: MatSort;
//     @ViewChild(MatPaginator) paginator: MatPaginator;
//     columns: DisplayDictionaryColumns;
//     dataSource: MatTableDataSource<DictionarySummary>;
//     state: DictionariesState;
//     isWaitingForServerResponse: boolean;

//     private columnsItems: DisplayDictionaryColumnsIteratorItem[];
//     private componentDestroyed$: Subject<boolean>;
//     constructor(public dialog: MatDialog, private dictionariesService: DictionaryService, private snackBar: MatSnackBar) {
//         this.componentDestroyed$ = new Subject();
//         this.columns = DICTIONARIES_COLUMNS;
//         this.columnsItems = this.getColumnIterator();
//         this.dataSource = new MatTableDataSource(new Array());
//         this.state = DictionariesState.Loading;
//         this.initializeSubscriptions();
//     }

//     ngOnDestroy(): void {
//         this.componentDestroyed$.next(true);
//         this.componentDestroyed$.complete();
//     }

//     ngOnInit(): void {
//         this.dictionariesService.updateAllDictionaries();
//     }

//     ngAfterViewInit(): void {
//         this.dataSource.sort = this.sort;
//         this.dataSource.paginator = this.paginator;
//     }

//     modifyDictionary(newDictionary: DictionarySummary): void {
//         const newDictionaryData: DictionaryDialogParameters = {
//             dictionaryToModifyDescription: newDictionary.description,
//             dictionaryToModifyTitle: newDictionary.title,
//             dictionaryId: newDictionary.id,
//         };
//         this.dialog.open(ModifyDictionaryComponent, {
//             data: newDictionaryData,
//             height: '350px',
//             width: '450px',
//         });
//     }

//     uploadDictionary(): void {
//         this.dialog.open(UploadDictionaryComponent, {
//             height: '300px',
//             width: '500px',
//         });
//     }

//     deleteDictionary(dictionary: DictionarySummary): void {
//         const dictionaryId: DeleteDictionaryDialogParameters = {
//             pageTitle: dictionary.title,
//             dictionaryId: dictionary.id,
//             // We haven't been able to test that the right function is called because this
//             // arrow function creates a new instance of the function. We cannot spy on it.
//             // It totally works tho, try it!
//             onClose: () => {
//                 this.isWaitingForServerResponse = true;
//             },
//         };
//         this.dialog.open(DeleteDictionaryDialogComponent, { data: dictionaryId });
//     }

//     async downloadDictionary(dictionaryId: string): Promise<void> {
//         this.isWaitingForServerResponse = true;
//         await this.dictionariesService.downloadDictionary(dictionaryId);
//     }

//     askResetDictionaries(): void {
//         this.dialog.open(DefaultDialogComponent, {
//             data: {
//                 title: ADMIN_RESET_DICTIONARY_TITLE,
//                 content: ADMIN_RESET_MESSAGE,
//                 buttons: [
//                     {
//                         content: CANCEL,
//                         closeDialog: true,
//                         icon: CANCEL_ICON,
//                     },
//                     {
//                         content: REINITIALIZE,
//                         action: this.resetDictionaries.bind(this),
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

//     async resetDictionaries(): Promise<void> {
//         await this.dictionariesService.resetDictionaries();
//     }

//     getDisplayedColumns(): DisplayDictionaryKeys[] {
//         return this.columnsItems.map(({ key }) => key);
//     }

//     private getColumnIterator(): DisplayDictionaryColumnsIteratorItem[] {
//         return Object.keys(this.columns).map<DisplayDictionaryColumnsIteratorItem>((key) => ({
//             key: key as DisplayDictionaryKeys,
//             label: this.columns[key as DisplayDictionaryKeys],
//         }));
//     }

//     private convertDictionariesToMatDataSource(dictionaries: DictionarySummary[]): void {
//         this.dataSource.data = dictionaries;
//     }

//     private initializeSubscriptions(): void {
//         this.dictionariesService.subscribeToDictionariesUpdateMessageEvent(this.componentDestroyed$, () => {
//             this.convertDictionariesToMatDataSource(this.dictionariesService.getDictionaries());
//         });
//         this.dictionariesService.subscribeToDictionariesUpdateDataEvent(this.componentDestroyed$, () => {
//             this.convertDictionariesToMatDataSource(this.dictionariesService.getDictionaries());
//         });
//         this.dictionariesService.subscribeToIsWaitingForServerResponseEvent(this.componentDestroyed$, () => {
//             this.isWaitingForServerResponse = !this.isWaitingForServerResponse;
//         });
//         this.dictionariesService.subscribeToComponentUpdateEvent(this.componentDestroyed$, (response) => {
//             this.snackBar.open(response, 'Fermer', this.isFeedbackPositive(response as PositiveFeedback));
//         });
//         this.dictionariesService.subscribeToUpdatingDictionariesEvent(this.componentDestroyed$, (state) => {
//             this.state = state;
//             this.isWaitingForServerResponse = !this.isWaitingForServerResponse;
//         });
//     }

//     private isFeedbackPositive(response: PositiveFeedback): PositiveFeedbackResponse {
//         return Object.values(PositiveFeedback).includes(response) ? SUCCESS_SNACK_BAR_CONFIG : ERROR_SNACK_BAR_CONFIG;
//     }
// }
