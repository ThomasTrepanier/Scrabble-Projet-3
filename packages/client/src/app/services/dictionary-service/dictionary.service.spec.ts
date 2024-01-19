// /* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable dot-notation */
// import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
// import { TestBed } from '@angular/core/testing';
// import { RouterTestingModule } from '@angular/router/testing';
// import { DictionarySummary } from '@app/classes/communication/dictionary-summary';
// import { DictionaryData } from '@app/classes/dictionary/dictionary-data';
// import { DictionaryController } from '@app/controllers/dictionary-controller/dictionary.controller';
// import { DictionaryService } from './dictionary.service';

// const TEST_DICTIONARY_SUMMARY_ARRAY = [{} as DictionarySummary];

// describe('DictionariesService', () => {
//     let service: DictionaryService;
//     let controller: DictionaryController;
//     let httpMock: HttpTestingController;

//     beforeEach(() => {
//         TestBed.configureTestingModule({
//             imports: [HttpClientTestingModule, RouterTestingModule],
//             providers: [DictionaryController, DictionaryService],
//         });
//         controller = TestBed.inject(DictionaryController);
//         service = TestBed.inject(DictionaryService);
//         httpMock = TestBed.inject(HttpTestingController);
//     });

//     afterEach(() => {
//         httpMock.verify();
//     });

//     it('should be created', () => {
//         expect(service).toBeTruthy();
//     });

//     describe('DictionariesUpdateMessageEvent', () => {
//         let updateMessageSpy: jasmine.Spy;
//         let componentUpdateSpy: jasmine.Spy;
//         let updateAllDictionariesSpy: jasmine.Spy;
//         beforeEach(() => {
//             updateMessageSpy = spyOn(service['dictionariesUpdateMessageEvent'], 'next').and.callFake(() => {
//                 return;
//             });

//             componentUpdateSpy = spyOn(service['componentUpdateEvent'], 'next').and.callFake(() => {
//                 return;
//             });

//             updateAllDictionariesSpy = spyOn(service, 'updateAllDictionaries').and.callFake(async () => {
//                 return;
//             });
//         });
//         it('should call dictionariesUpdateMessageEvent.next', () => {
//             controller['dictionaryUpdateMessageEvent'].next();
//             expect(updateMessageSpy).toHaveBeenCalled();
//         });

//         it('should call componentUpdateEvent.next', () => {
//             controller['dictionaryUpdateMessageEvent'].next();
//             expect(componentUpdateSpy).toHaveBeenCalled();
//         });

//         it('should call service.updateAllDictionaries', () => {
//             controller['dictionaryUpdateMessageEvent'].next();
//             expect(updateAllDictionariesSpy).toHaveBeenCalled();
//         });
//     });

//     describe('DictionaryDownloadEvent', () => {
//         let downloadLoadingSpy: jasmine.Spy;
//         let startDownloadSpy: jasmine.Spy;
//         beforeEach(() => {
//             downloadLoadingSpy = spyOn(service['isWaitingForServerResponseEvent'], 'next').and.callFake(() => {
//                 return;
//             });

//             startDownloadSpy = spyOn<any>(service, 'startDownload').and.callFake(() => {
//                 return;
//             });
//         });
//         it('should call dictionariesUpdateMessageEvent.next', () => {
//             controller['dictionaryDownloadEvent'].next();
//             expect(downloadLoadingSpy).toHaveBeenCalled();
//         });

//         it('should call startDownload.next', () => {
//             controller['dictionaryDownloadEvent'].next();
//             expect(startDownloadSpy).toHaveBeenCalled();
//         });
//     });

//     describe('DictionaryErrorEvent', () => {
//         it('should call componentUpdateEvent.next', () => {
//             const componentUpdateSpy = spyOn(service['componentUpdateEvent'], 'next').and.callFake(() => {
//                 return;
//             });
//             controller['dictionaryErrorEvent'].next({} as string);
//             expect(componentUpdateSpy).toHaveBeenCalled();
//         });
//     });

//     describe('GetAllDictionariesEvent', () => {
//         let dictionariesUpdatedEventSpy: jasmine.Spy;
//         let updatingDictionariesEventSpy: jasmine.Spy;
//         beforeEach(() => {
//             dictionariesUpdatedEventSpy = spyOn(service['dictionariesUpdatedEvent'], 'next').and.callFake(() => {
//                 return;
//             });

//             updatingDictionariesEventSpy = spyOn(service['updatingDictionariesEvent'], 'next').and.callFake(() => {
//                 return;
//             });
//         });
//         it('should call dictionariesUpdateMessageEvent.next', () => {
//             controller['getAllDictionariesEvent'].next();
//             expect(dictionariesUpdatedEventSpy).toHaveBeenCalled();
//         });

//         it('should call startDownload.next', () => {
//             controller['getAllDictionariesEvent'].next();
//             expect(updatingDictionariesEventSpy).toHaveBeenCalled();
//         });
//     });

//     describe('updateDictionary', async () => {
//         it('should call dictionariesController.handleUpdateDictionary', () => {
//             const spy = spyOn(controller, 'handleUpdateDictionary').and.callFake(async () => {
//                 return;
//             });
//             service.updateDictionary({} as string, {} as string, {} as string);
//             expect(spy).toHaveBeenCalled();
//         });
//     });

//     describe('downloadDictionary', async () => {
//         it('should call dictionariesController.handleDownloadDictionary', () => {
//             const spy = spyOn(controller, 'handleDownloadDictionary').and.callFake(async () => {
//                 return;
//             });
//             service.downloadDictionary({} as string);
//             expect(spy).toHaveBeenCalled();
//         });
//     });

//     describe('deleteDictionary', async () => {
//         it('should call dictionariesController.handleDeleteDictionary', () => {
//             const spy = spyOn(controller, 'handleDeleteDictionary').and.callFake(async () => {
//                 return;
//             });
//             service.deleteDictionary({} as string);
//             expect(spy).toHaveBeenCalled();
//         });
//     });

//     describe('resetDictionaries', async () => {
//         it('should call dictionariesController.handleResetDictionaries', () => {
//             const spy = spyOn(controller, 'handleResetDictionaries').and.callFake(async () => {
//                 return;
//             });
//             service.resetDictionaries();
//             expect(spy).toHaveBeenCalled();
//         });
//     });

//     describe('uploadDictionary', async () => {
//         it('should call dictionariesController.handleUploadDictionary', () => {
//             const spy = spyOn(controller, 'handleUploadDictionary').and.callFake(async () => {
//                 return;
//             });
//             service.uploadDictionary({} as DictionaryData);
//             expect(spy).toHaveBeenCalled();
//         });
//     });

//     describe('updateAllDictionaries', async () => {
//         it('should call dictionariesController.handleGetAllDictionariesEvent', () => {
//             const spy = spyOn(controller, 'handleGetAllDictionariesEvent').and.callFake(async () => {
//                 return;
//             });
//             service.updateAllDictionaries();
//             expect(spy).toHaveBeenCalled();
//         });
//     });

//     describe('updateAllDictionaries', () => {
//         it('should call updatingDictionariesEvent.next', () => {
//             const spy = spyOn(service['updatingDictionariesEvent'], 'next').and.callFake(() => {
//                 return;
//             });
//             service.getDictionaries();
//             expect(spy).toHaveBeenCalled();
//         });

//         it('should return service.dictionaries', () => {
//             const spy = spyOn(service['updatingDictionariesEvent'], 'next').and.callFake(() => {
//                 return TEST_DICTIONARY_SUMMARY_ARRAY;
//             });
//             service.getDictionaries();
//             expect(spy).toHaveBeenCalled();
//         });
//     });

//     describe('startDownload', () => {
//         let documentSpy: jasmine.Spy;
//         let urlSpy: jasmine.Spy;
//         let jsonSpy: jasmine.Spy;
//         let appendSpy: jasmine.Spy;
//         let removeSpy: jasmine.Spy;
//         let blobSpy: jasmine.Spy;

//         beforeEach(() => {
//             documentSpy = spyOn(window.document, 'createElement').and.callFake(() => {
//                 return {
//                     click: () => {
//                         return;
//                     },
//                     href: {} as any,
//                     download: {} as any,
//                 } as unknown as HTMLAnchorElement;
//             });
//             urlSpy = spyOn(window['URL'], 'createObjectURL').and.callFake(() => {
//                 return '' as string;
//             });
//             blobSpy = spyOn(window, 'Blob').and.returnValue({} as Blob);
//             jsonSpy = spyOn(JSON, 'stringify').and.callFake(() => {
//                 return '' as string;
//             });
//             appendSpy = spyOn(window.document.body, 'appendChild').and.callFake(() => {
//                 return {} as any;
//             });
//             removeSpy = spyOn(window.document.body, 'removeChild').and.callFake(() => {
//                 return {} as any;
//             });
//         });

//         it('should call the correct methods', () => {
//             service['startDownload']({ title: 'title' } as unknown as DictionaryData);
//             expect(documentSpy).toHaveBeenCalled();
//             expect(jsonSpy).toHaveBeenCalled();
//             expect(urlSpy).toHaveBeenCalled();
//             expect(blobSpy).toHaveBeenCalled();
//             expect(appendSpy).toHaveBeenCalled();
//             expect(removeSpy).toHaveBeenCalled();
//         });
//     });
// });
