// import { Injectable } from '@angular/core';
// import { DictionariesState } from '@app/classes/admin/dictionaries';
// import { DictionarySummary } from '@app/classes/communication/dictionary-summary';
// import { DictionaryData } from '@app/classes/dictionary/dictionary-data';
// import { DOWNLOAD_ELEMENT } from '@app/constants/dictionary-service-constants';
// import { DictionaryController } from '@app/controllers/dictionary-controller/dictionary.controller';
// import { Subject } from 'rxjs';
// import { takeUntil } from 'rxjs/operators';

// @Injectable({
//     providedIn: 'root',
// })
// export class DictionaryService {
//     private dictionaries: DictionarySummary[];
//     private dictionariesUpdateMessageEvent: Subject<string> = new Subject();
//     private componentUpdateEvent: Subject<string> = new Subject();
//     private serviceDestroyed$: Subject<boolean> = new Subject();
//     private dictionariesUpdatedEvent: Subject<DictionarySummary[]> = new Subject();
//     private isWaitingForServerResponseEvent: Subject<null> = new Subject();
//     private updatingDictionariesEvent: Subject<DictionariesState> = new Subject();

//     constructor(private dictionariesController: DictionaryController) {
//         this.dictionariesController.subscribeToDictionariesUpdateMessageEvent(this.serviceDestroyed$, (message) => {
//             this.isWaitingForServerResponseEvent.next();
//             this.dictionariesUpdateMessageEvent.next(message);
//             this.componentUpdateEvent.next(message);
//             this.updateAllDictionaries();
//         });

//         this.dictionariesController.subscribeToDictionaryDownloadEvent(this.serviceDestroyed$, (dictionaryData) => {
//             this.isWaitingForServerResponseEvent.next();
//             this.startDownload(dictionaryData);
//         });

//         this.dictionariesController.subscribeToDictionaryErrorEvent(this.serviceDestroyed$, (response) => {
//             this.isWaitingForServerResponseEvent.next();
//             this.componentUpdateEvent.next(response);
//         });

//         this.dictionariesController.subscribeToGetAllDictionariesEvent(this.serviceDestroyed$, (dictionaries: DictionarySummary[]) => {
//             this.isWaitingForServerResponseEvent.next();
//             this.dictionaries = dictionaries;
//             this.dictionariesUpdatedEvent.next(dictionaries);
//             this.updatingDictionariesEvent.next(DictionariesState.Ready);
//         });
//     }

//     subscribeToUpdatingDictionariesEvent(serviceDestroyed$: Subject<boolean>, callback: (state: DictionariesState) => void): void {
//         this.updatingDictionariesEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
//     }

//     subscribeToIsWaitingForServerResponseEvent(serviceDestroyed$: Subject<boolean>, callback: () => void): void {
//         this.isWaitingForServerResponseEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
//     }

//     subscribeToDictionariesUpdateDataEvent(serviceDestroyed$: Subject<boolean>, callback: (dictionaries: DictionarySummary[]) => void): void {
//         this.dictionariesUpdatedEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
//     }

//     subscribeToComponentUpdateEvent(serviceDestroyed$: Subject<boolean>, callback: (response: string) => void): void {
//         this.componentUpdateEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
//     }

//     subscribeToDictionariesUpdateMessageEvent(serviceDestroyed$: Subject<boolean>, callback: (response: string) => void): void {
//         this.dictionariesUpdateMessageEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
//     }

//     updateDictionary(id: string, title: string, description: string): void {
//         this.isWaitingForServerResponseEvent.next();
//         this.dictionariesController.handleUpdateDictionary({ title, description, id });
//     }

//     downloadDictionary(id: string): void {
//         this.isWaitingForServerResponseEvent.next();
//         this.dictionariesController.handleDownloadDictionary(id);
//     }

//     deleteDictionary(id: string): void {
//         this.isWaitingForServerResponseEvent.next();
//         this.dictionariesController.handleDeleteDictionary(id);
//     }

//     resetDictionaries(): void {
//         this.isWaitingForServerResponseEvent.next();
//         this.dictionariesController.handleResetDictionaries();
//     }

//     uploadDictionary(dictionaryData: DictionaryData): void {
//         this.isWaitingForServerResponseEvent.next();
//         this.dictionariesController.handleUploadDictionary(dictionaryData);
//     }

//     updateAllDictionaries(): void {
//         this.dictionariesController.handleGetAllDictionariesEvent();
//     }

//     getDictionaries(): DictionarySummary[] {
//         this.updatingDictionariesEvent.next(DictionariesState.Loading);
//         return this.dictionaries;
//     }

//     private startDownload(dictionaryData: DictionaryData): void {
//         const title = dictionaryData.title + '.json';
//         const downloadProcess = window.document.createElement(DOWNLOAD_ELEMENT);

//         downloadProcess.href = window.URL.createObjectURL(new Blob([JSON.stringify(dictionaryData)], { type: 'application/json' }));
//         downloadProcess.download = title;

//         document.body.appendChild(downloadProcess);
//         downloadProcess.click();
//         document.body.removeChild(downloadProcess);
//     }
// }
