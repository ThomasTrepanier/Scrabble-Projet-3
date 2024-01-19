// import { HttpClient, HttpParams } from '@angular/common/http';
// import { Injectable, OnDestroy } from '@angular/core';
// import { DictionarySummary } from '@app/classes/communication/dictionary-summary';
// import { BasicDictionaryData, DictionaryData, DictionaryUpdateInfo } from '@app/classes/dictionary/dictionary-data';
// import { PositiveFeedback } from '@app/constants/dictionaries-components';
// import { Subject } from 'rxjs';
// import { takeUntil } from 'rxjs/operators';
// import { environment } from 'src/environments/environment';

// @Injectable({
//     providedIn: 'root',
// })
// export class DictionaryController implements OnDestroy {
//     private endpoint = `${environment.serverUrl}/dictionaries`;
//     private dictionaryUpdateMessageEvent: Subject<string> = new Subject();
//     private dictionaryErrorEvent: Subject<string> = new Subject();
//     private dictionaryDownloadEvent: Subject<BasicDictionaryData> = new Subject();
//     private getAllDictionariesEvent: Subject<DictionarySummary[]> = new Subject();

//     private serviceDestroyed$: Subject<boolean> = new Subject();

//     constructor(private http: HttpClient) {}

//     ngOnDestroy(): void {
//         this.serviceDestroyed$.next(true);
//         this.serviceDestroyed$.complete();
//     }

//     handleUpdateDictionary(dictionaryUpdateInfo: DictionaryUpdateInfo): void {
//         this.http.patch(this.endpoint, { dictionaryUpdateInfo }).subscribe(
//             () => {
//                 this.dictionaryUpdateMessageEvent.next(PositiveFeedback.DictionaryUpdated);
//             },
//             (error) => {
//                 this.dictionaryErrorEvent.next(error.error.message);
//             },
//         );
//     }

//     handleDownloadDictionary(dictionaryId: string): void {
//         this.http.get<BasicDictionaryData>(`${this.endpoint}/${dictionaryId}`, { observe: 'body' }).subscribe(
//             (dictionary) => {
//                 this.dictionaryDownloadEvent.next(dictionary);
//             },
//             (error) => {
//                 this.dictionaryErrorEvent.next(error.error.message);
//             },
//         );
//     }

//     handleDeleteDictionary(dictionaryId: string): void {
//         let params = new HttpParams();
//         params = params.append('dictionaryId', dictionaryId);
//         this.http.delete(this.endpoint, { params }).subscribe(
//             () => {
//                 this.dictionaryUpdateMessageEvent.next(PositiveFeedback.DictionaryDeleted);
//             },
//             (error) => {
//                 this.dictionaryErrorEvent.next(error.error.message);
//             },
//         );
//     }

//     handleUploadDictionary(dictionaryData: DictionaryData): void {
//         this.http.post<string>(this.endpoint, { dictionaryData }).subscribe(
//             () => {
//                 this.dictionaryUpdateMessageEvent.next(PositiveFeedback.DictionaryAdded);
//             },
//             (error) => {
//                 this.dictionaryErrorEvent.next(error.error.message);
//             },
//         );
//     }

//     handleGetAllDictionariesEvent(): void {
//         this.http.get<DictionarySummary[]>(`${this.endpoint}/summary`, { observe: 'body' }).subscribe(
//             (body) => {
//                 this.getAllDictionariesEvent.next(body);
//             },
//             (error) => {
//                 this.dictionaryErrorEvent.next(error.error.message);
//             },
//         );
//     }

//     handleResetDictionaries(): void {
//         this.http.delete<string>(`${this.endpoint}/reset`, {}).subscribe(
//             () => {
//                 this.dictionaryUpdateMessageEvent.next(PositiveFeedback.DictionariesDeleted);
//             },
//             (error) => {
//                 this.dictionaryErrorEvent.next(error.error.message);
//             },
//         );
//     }

//     subscribeToDictionariesUpdateMessageEvent(serviceDestroyed$: Subject<boolean>, callback: (response: string) => void): void {
//         this.dictionaryUpdateMessageEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
//     }

//     subscribeToDictionaryDownloadEvent(serviceDestroyed$: Subject<boolean>, callback: (dictionaryData: BasicDictionaryData) => void): void {
//         this.dictionaryDownloadEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
//     }

//     subscribeToDictionaryErrorEvent(serviceDestroyed$: Subject<boolean>, callback: (response: string) => void): void {
//         this.dictionaryErrorEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
//     }

//     subscribeToGetAllDictionariesEvent(serviceDestroyed$: Subject<boolean>, callback: (dictionaries: DictionarySummary[]) => void): void {
//         this.getAllDictionariesEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
//     }
// }
