// /* eslint-disable @typescript-eslint/no-empty-function */
// /* eslint-disable max-lines */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable dot-notation */
// import { HttpParams } from '@angular/common/http';
// import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
// import { TestBed } from '@angular/core/testing';
// import { RouterTestingModule } from '@angular/router/testing';
// import { DictionaryData, DictionaryUpdateInfo } from '@app/classes/dictionary/dictionary-data';
// import { GameService } from '@app/services';
// import { of, throwError } from 'rxjs';
// import { DictionaryController } from './dictionary.controller';
// const TEST_DICTIONARY_UPDATE_INFO = {} as DictionaryUpdateInfo;
// const TEST_DICTIONARY_ID = 'testID';
// const TEST_DICTIONARY_DATA = {} as DictionaryData;

// describe('DictionariesController', () => {
//     let controller: DictionaryController;
//     let httpMock: HttpTestingController;

//     beforeEach(async () => {
//         TestBed.configureTestingModule({
//             imports: [HttpClientTestingModule, RouterTestingModule],
//             providers: [DictionaryController, GameService],
//         });
//         controller = TestBed.inject(DictionaryController);
//         httpMock = TestBed.inject(HttpTestingController);
//     });

//     afterEach(() => {
//         httpMock.verify();
//     });

//     it('should create', () => {
//         expect(controller).toBeTruthy();
//     });

//     describe('ngOnDestroy', () => {
//         it('should call next', () => {
//             const spy = spyOn(controller['serviceDestroyed$'], 'next');
//             spyOn(controller['serviceDestroyed$'], 'complete');
//             controller.ngOnDestroy();
//             expect(spy).toHaveBeenCalled();
//         });

//         it('should call complete', () => {
//             spyOn(controller['serviceDestroyed$'], 'next');
//             const spy = spyOn(controller['serviceDestroyed$'], 'complete');
//             controller.ngOnDestroy();
//             expect(spy).toHaveBeenCalled();
//         });
//     });

//     describe('handleUpdateDictionary', () => {
//         it('should  make an HTTP patch request', () => {
//             const httpPatchSpy = spyOn(controller['http'], 'patch').and.returnValue(of(true) as any);
//             controller.handleUpdateDictionary(TEST_DICTIONARY_UPDATE_INFO);
//             expect(httpPatchSpy).toHaveBeenCalled();
//         });

//         it('should call dictionaryErrorEvent.next on an error', () => {
//             spyOn(controller['http'], 'patch').and.callFake(() => {
//                 return throwError({ error: { message: 'errormessage' } });
//             });
//             const dictionaryErrorEventSpy = spyOn(controller['dictionaryErrorEvent'], 'next');
//             controller.handleUpdateDictionary(TEST_DICTIONARY_UPDATE_INFO);
//             expect(dictionaryErrorEventSpy).toHaveBeenCalled();
//         });
//     });

//     describe('handleDownloadDictionary', () => {
//         it('should  make an HTTP get request', () => {
//             const httpGetSpy = spyOn(controller['http'], 'get').and.returnValue(of(true) as any);
//             controller.handleDownloadDictionary(TEST_DICTIONARY_ID);
//             expect(httpGetSpy).toHaveBeenCalled();
//         });

//         it('should call dictionaryErrorEvent.next on an error', () => {
//             spyOn(controller['http'], 'get').and.callFake(() => {
//                 return throwError({ error: { message: 'errormessage' } });
//             });
//             const dictionaryErrorEventSpy = spyOn(controller['dictionaryErrorEvent'], 'next');
//             controller.handleDownloadDictionary(TEST_DICTIONARY_ID);
//             expect(dictionaryErrorEventSpy).toHaveBeenCalled();
//         });
//     });

//     describe('handleDeleteDictionary', () => {
//         it('should  make an HTTP delete request', () => {
//             spyOn(HttpParams.prototype, 'append').and.returnValue({} as HttpParams);
//             const httpDeleteSpy = spyOn(controller['http'], 'delete').and.returnValue(of(true) as any);
//             controller.handleDeleteDictionary(TEST_DICTIONARY_ID);
//             expect(httpDeleteSpy).toHaveBeenCalled();
//         });

//         it('should  call HTTPParams.append', () => {
//             spyOn(controller['http'], 'delete').and.returnValue(of(true) as any);
//             const httpAppendSpy = spyOn(HttpParams.prototype, 'append').and.returnValue({} as HttpParams);
//             controller.handleDeleteDictionary(TEST_DICTIONARY_ID);
//             expect(httpAppendSpy).toHaveBeenCalled();
//         });

//         it('should call dictionaryErrorEvent.next on an error', () => {
//             spyOn(controller['http'], 'delete').and.callFake(() => {
//                 return throwError({ error: { message: 'errormessage' } });
//             });
//             const dictionaryErrorEventSpy = spyOn(controller['dictionaryErrorEvent'], 'next');
//             controller.handleDeleteDictionary(TEST_DICTIONARY_ID);
//             expect(dictionaryErrorEventSpy).toHaveBeenCalled();
//         });
//     });

//     describe('handleUploadDictionary', () => {
//         it('handleUploadDictionary should  make an HTTP post request', () => {
//             const httpPostSpy = spyOn(controller['http'], 'post').and.returnValue(of(true) as any);
//             controller.handleUploadDictionary(TEST_DICTIONARY_DATA);
//             expect(httpPostSpy).toHaveBeenCalled();
//         });

//         it('should call dictionaryErrorEvent.next on an error', () => {
//             spyOn(controller['http'], 'post').and.callFake(() => {
//                 return throwError({ error: { message: 'errormessage' } });
//             });
//             const dictionaryErrorEventSpy = spyOn(controller['dictionaryErrorEvent'], 'next');
//             controller.handleUploadDictionary(TEST_DICTIONARY_DATA);
//             expect(dictionaryErrorEventSpy).toHaveBeenCalled();
//         });
//     });

//     describe('handleGetAllDictionariesEvent', () => {
//         it('handleGetAllDictionariesEvent should  make an HTTP get request', () => {
//             const httpGetSpy = spyOn(controller['http'], 'get').and.returnValue(of(true) as any);
//             controller.handleGetAllDictionariesEvent();
//             expect(httpGetSpy).toHaveBeenCalled();
//         });

//         it('should call dictionaryErrorEvent.next on an error', () => {
//             spyOn(controller['http'], 'get').and.callFake(() => {
//                 return throwError({ error: { message: 'errormessage' } });
//             });
//             const dictionaryErrorEventSpy = spyOn(controller['dictionaryErrorEvent'], 'next');
//             controller.handleGetAllDictionariesEvent();
//             expect(dictionaryErrorEventSpy).toHaveBeenCalled();
//         });
//     });

//     describe('handleResetDictionaries', () => {
//         it('handleResetDictionaries should  make an HTTP delete request', () => {
//             const httpDeleteSpy = spyOn(controller['http'], 'delete').and.returnValue(of(true) as any);
//             controller.handleResetDictionaries();
//             expect(httpDeleteSpy).toHaveBeenCalled();
//         });

//         it('should call dictionaryErrorEvent.next on an error', () => {
//             spyOn(controller['http'], 'delete').and.callFake(() => {
//                 return throwError({ error: { message: 'errormessage' } });
//             });
//             const dictionaryErrorEventSpy = spyOn(controller['dictionaryErrorEvent'], 'next').and.callFake(() => {});
//             controller.handleResetDictionaries();
//             expect(dictionaryErrorEventSpy).toHaveBeenCalled();
//         });
//     });
// });
