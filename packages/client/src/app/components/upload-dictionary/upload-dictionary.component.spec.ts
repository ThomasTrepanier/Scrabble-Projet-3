// /* eslint-disable @typescript-eslint/no-empty-function */
// /* eslint-disable dot-notation */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { DictionaryService } from '@app/services/dictionary-service/dictionary.service';
// import { IconComponent } from '@app/components/icon/icon.component';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatSelectModule } from '@angular/material/select';
// import { MatDividerModule } from '@angular/material/divider';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// import { AppMaterialModule } from '@app/modules/material.module';
// import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
// import { HttpClientModule } from '@angular/common/http';
// import { MatSnackBarModule } from '@angular/material/snack-bar';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { MatCardModule } from '@angular/material/card';
// import { MatTabsModule } from '@angular/material/tabs';
// import { UploadDictionaryComponent } from './upload-dictionary.component';
// import { DictionaryData } from '@app/classes/dictionary/dictionary-data';
// import { UploadEvent, UploadState } from './upload-dictionary.component.types';
// import SpyObj = jasmine.SpyObj;
// import { WRONG_FILE_TYPE } from '@app/constants/dictionaries-components';
// import { ReactiveFormsModule } from '@angular/forms';

// const CORRECT_TYPE_FILE: UploadEvent = {
//     files: [{ iAmValue: 'heyhey', type: 'application/json' } as unknown as File],
// } as unknown as UploadEvent;

// const INCORRECT_TYPE_FILE: UploadEvent = {
//     files: [{ iAmValue: 'heyhey', type: 'application/xml' } as unknown as File],
// } as unknown as UploadEvent;

// export class MatDialogMock {
//     close() {
//         return {
//             close: () => ({}),
//         };
//     }
// }

// describe('UploadDictionaryComponent', () => {
//     let component: UploadDictionaryComponent;
//     let fixture: ComponentFixture<UploadDictionaryComponent>;
//     let dictionariesServiceMock: DictionaryService;
//     let fileReaderSpy: SpyObj<FileReader>;

//     beforeEach(() => {
//         fileReaderSpy = jasmine.createSpyObj('FileReader', ['onload', 'readAsText']);
//         fileReaderSpy.readAsText.and.callFake(() => {});
//     });

//     beforeEach(async () => {
//         await TestBed.configureTestingModule({
//             declarations: [UploadDictionaryComponent, IconComponent],
//             imports: [
//                 AppMaterialModule,
//                 HttpClientModule,
//                 MatFormFieldModule,
//                 ReactiveFormsModule,
//                 MatSelectModule,
//                 MatDividerModule,
//                 MatProgressSpinnerModule,
//                 MatDialogModule,
//                 MatSnackBarModule,
//                 BrowserAnimationsModule,
//                 MatCardModule,
//                 MatTabsModule,
//             ],
//             providers: [
//                 MatDialog,
//                 {
//                     provide: MatDialogRef,
//                     useClass: MatDialogMock,
//                 },
//                 {
//                     provide: FileReader,
//                     useValue: fileReaderSpy,
//                 },
//                 DictionaryService,
//             ],
//         }).compileComponents();
//     });

//     beforeEach(() => {
//         fixture = TestBed.createComponent(UploadDictionaryComponent);
//         dictionariesServiceMock = TestBed.inject(DictionaryService);
//         component = fixture.componentInstance;
//         fixture.detectChanges();
//     });

//     it('should create', () => {
//         expect(component).toBeTruthy();
//     });

//     describe('handleFileInput', () => {
//         beforeEach(() => {
//             spyOn(window, 'FileReader').and.returnValue(fileReaderSpy);
//         });

//         it('should assign value to component.selectedFile', () => {
//             spyOn(JSON, 'parse').and.callFake(() => {
//                 return {} as DictionaryData;
//             });
//             component.handleFileInput(CORRECT_TYPE_FILE);
//             expect(fileReaderSpy.readAsText).toHaveBeenCalled();
//         });

//         it('should assign the correct values if the file type is incorrect', () => {
//             spyOn(JSON, 'parse').and.callFake(() => {
//                 return {} as DictionaryData;
//             });
//             component.handleFileInput(INCORRECT_TYPE_FILE);
//             expect(component.errorMessage).toEqual(WRONG_FILE_TYPE);
//             expect(component.isDictionaryReady).toEqual(false);
//             expect(component.state).toEqual(UploadState.Error);
//         });

//         it('should assign the correct values if the file type is .json', () => {
//             const dictionaryData = {} as DictionaryData;
//             spyOn(JSON, 'parse').and.callFake(() => {
//                 return dictionaryData;
//             });
//             component.handleFileInput(CORRECT_TYPE_FILE);
//             if (fileReaderSpy !== null && fileReaderSpy.onload !== null) fileReaderSpy.onload({} as unknown as ProgressEvent<FileReader>);
//             expect(component.state).toEqual(UploadState.Ready);
//             expect(component.errorMessage).toEqual('');
//             expect(component.isDictionaryReady).toEqual(true);
//             expect(component.newDictionary).toEqual(dictionaryData);
//         });

//         it('should assign the correct values if the an error is thrown while parsing the .json', () => {
//             const errorMessage = 'parsing error';
//             spyOn(JSON, 'parse').and.callFake(() => {
//                 throw new Error(errorMessage);
//             });
//             component.handleFileInput(CORRECT_TYPE_FILE);
//             if (fileReaderSpy !== null && fileReaderSpy.onload !== null) fileReaderSpy.onload({} as unknown as ProgressEvent<FileReader>);
//             expect(component.state).toEqual(UploadState.Error);
//             expect(component.errorMessage).toEqual(errorMessage);
//         });

//         it('should early return if given null', () => {
//             expect(component.handleFileInput(null)).toBeUndefined();
//             expect(fileReaderSpy.readAsText).not.toHaveBeenCalled();
//         });
//     });

//     describe('onUpload', () => {
//         let spyDictionary: jasmine.Spy;
//         let spyDialogRef: jasmine.Spy;
//         beforeEach(() => {
//             spyDictionary = spyOn(dictionariesServiceMock, 'uploadDictionary').and.callFake(async () => {
//                 return;
//             });
//             spyDialogRef = spyOn(component['dialogRef'], 'close').and.callFake(() => {
//                 return;
//             });
//         });

//         it('should call dictionariesService.uploadDictionary', () => {
//             component.onUpload();
//             expect(spyDictionary).toHaveBeenCalled();
//         });

//         it('should call dialogRef.close', () => {
//             component.onUpload();
//             expect(spyDialogRef).toHaveBeenCalled();
//         });
//     });

//     describe('closeDialog', () => {
//         it('should call dialogRef.close', () => {
//             const spyDialogRef = spyOn(component['dialogRef'], 'close').and.callFake(() => {
//                 return;
//             });
//             component.closeDialog();
//             expect(spyDialogRef).toHaveBeenCalled();
//         });
//     });
// });
