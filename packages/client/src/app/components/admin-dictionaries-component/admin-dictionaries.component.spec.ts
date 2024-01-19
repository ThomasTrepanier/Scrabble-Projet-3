// /* eslint-disable dot-notation */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { HttpClientTestingModule } from '@angular/common/http/testing';
// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { ReactiveFormsModule } from '@angular/forms';
// import { MatCardModule } from '@angular/material/card';
// import { MatDialogModule } from '@angular/material/dialog';
// import { MatDividerModule } from '@angular/material/divider';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatProgressBarModule } from '@angular/material/progress-bar';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// import { MatSelectModule } from '@angular/material/select';
// import { MatSnackBar, MatSnackBarModule, MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';
// import { MatTableDataSource, MatTableModule } from '@angular/material/table';
// import { MatTabsModule } from '@angular/material/tabs';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { RouterModule } from '@angular/router';
// import { DictionariesState } from '@app/classes/admin/dictionaries';
// import { DictionarySummary } from '@app/classes/communication/dictionary-summary';
// import { IconComponent } from '@app/components/icon/icon.component';
// import { PageHeaderComponent } from '@app/components/page-header/page-header.component';
// import { ERROR_SNACK_BAR_CONFIG, SUCCESS_SNACK_BAR_CONFIG } from '@app/constants/components-constants';
// import { PositiveFeedback } from '@app/constants/dictionaries-components';
// import { AppMaterialModule } from '@app/modules/material.module';
// import { DictionaryService } from '@app/services/dictionary-service/dictionary.service';
// import { AdminDictionariesComponent } from './admin-dictionaries.component';
// const TEST_ID = 'test';
// const testElementData: DictionarySummary = {
//     title: 'testTitle',
//     description: 'testDescription',
//     id: 'testId',
//     isDefault: false,
// };
// const TEST_DICTIONARY_SUMMARY_ARRAY: DictionarySummary[] = [testElementData];
// const TEST_SNACKBAR = undefined as unknown as MatSnackBarRef<TextOnlySnackBar>;

// describe('AdminDictionariesComponent', () => {
//     let component: AdminDictionariesComponent;
//     let fixture: ComponentFixture<AdminDictionariesComponent>;
//     let dictionariesServiceMock: DictionaryService;

//     beforeEach(async () => {
//         await TestBed.configureTestingModule({
//             declarations: [AdminDictionariesComponent, IconComponent, PageHeaderComponent],
//             imports: [
//                 AppMaterialModule,
//                 MatFormFieldModule,
//                 MatSelectModule,
//                 MatDividerModule,
//                 ReactiveFormsModule,
//                 MatProgressSpinnerModule,
//                 MatProgressBarModule,
//                 MatTableModule,
//                 MatDialogModule,
//                 MatSnackBarModule,
//                 BrowserAnimationsModule,
//                 MatCardModule,
//                 MatTabsModule,
//                 HttpClientTestingModule,
//                 RouterModule,
//             ],
//             providers: [DictionaryService, MatSnackBar],
//         }).compileComponents();
//     });

//     beforeEach(() => {
//         fixture = TestBed.createComponent(AdminDictionariesComponent);
//         dictionariesServiceMock = TestBed.inject(DictionaryService);

//         component = fixture.componentInstance;
//         fixture.detectChanges();
//     });

//     it('should create', () => {
//         expect(component).toBeTruthy();
//     });

//     describe('On dictionariesUpdateMessageEvent', () => {
//         it('should call dictionariesService.getDictionaries', () => {
//             const spy = spyOn(dictionariesServiceMock, 'getDictionaries').and.callFake(() => {
//                 return TEST_DICTIONARY_SUMMARY_ARRAY;
//             });
//             spyOn<any>(component, 'convertDictionariesToMatDataSource').and.callFake(() => {
//                 return;
//             });
//             dictionariesServiceMock['dictionariesUpdateMessageEvent'].next();
//             expect(spy).toHaveBeenCalled();
//         });

//         it('should call convertDictionariesToMatDataSource', () => {
//             spyOn(dictionariesServiceMock, 'getDictionaries').and.callFake(() => {
//                 return TEST_DICTIONARY_SUMMARY_ARRAY;
//             });
//             const spy = spyOn<any>(component, 'convertDictionariesToMatDataSource').and.callFake(() => {
//                 return;
//             });
//             dictionariesServiceMock['dictionariesUpdateMessageEvent'].next();
//             expect(spy).toHaveBeenCalled();
//         });
//     });

//     describe('On dictionariesUpdateDataEvent', () => {
//         it('should call dictionariesService.getDictionaries', () => {
//             const spy = spyOn(dictionariesServiceMock, 'getDictionaries').and.callFake(() => {
//                 return TEST_DICTIONARY_SUMMARY_ARRAY;
//             });
//             spyOn<any>(component, 'convertDictionariesToMatDataSource').and.callFake(() => {
//                 return;
//             });
//             dictionariesServiceMock['dictionariesUpdatedEvent'].next();
//             expect(spy).toHaveBeenCalled();
//         });

//         it('should call convertDictionariesToMatDataSource', () => {
//             spyOn(dictionariesServiceMock, 'getDictionaries').and.callFake(() => {
//                 return TEST_DICTIONARY_SUMMARY_ARRAY;
//             });
//             const spy = spyOn<any>(component, 'convertDictionariesToMatDataSource').and.callFake(() => {
//                 return;
//             });
//             dictionariesServiceMock['dictionariesUpdatedEvent'].next();
//             expect(spy).toHaveBeenCalled();
//         });
//     });

//     describe('On isWaitingForServerResponseEvent', () => {
//         it('should turn isDownloadLoading to false', () => {
//             component.isWaitingForServerResponse = true;
//             dictionariesServiceMock['isWaitingForServerResponseEvent'].next();
//             expect(component.isWaitingForServerResponse).toBeFalse();
//         });

//         it('should turn isDownloadLoading to true', () => {
//             component.isWaitingForServerResponse = false;
//             dictionariesServiceMock['isWaitingForServerResponseEvent'].next();
//             expect(component.isWaitingForServerResponse).toBeTrue();
//         });
//     });

//     describe('On ComponentUpdateEvent', () => {
//         it('should call snackbar.open', () => {
//             const spy = spyOn(component['snackBar'], 'open').and.callFake(() => {
//                 return TEST_SNACKBAR;
//             });
//             dictionariesServiceMock['componentUpdateEvent'].next('aa');
//             expect(spy).toHaveBeenCalled();
//         });
//     });

//     describe('isFeedbackPositive', () => {
//         it('should return SUCCESS_SNACK_BAR_CONFIG with positive response', () => {
//             expect(component['isFeedbackPositive'](PositiveFeedback.DictionariesDeleted)).toEqual(SUCCESS_SNACK_BAR_CONFIG);
//         });
//         it('should return ERROR_SNACK_BAR_CONFIG with negative response', () => {
//             expect(component['isFeedbackPositive']('nagivete feedback' as PositiveFeedback)).toEqual(ERROR_SNACK_BAR_CONFIG);
//         });
//     });

//     describe('On UpdatingDictionariesEvent', () => {
//         it('should update state', () => {
//             component.state = DictionariesState.Loading;
//             const TEST_STATE = DictionariesState.Ready;
//             dictionariesServiceMock['updatingDictionariesEvent'].next(TEST_STATE);
//             expect(component.state).toEqual(TEST_STATE);
//         });

//         it('should switch isWaitingForServerResponse to opposite value', () => {
//             component.isWaitingForServerResponse = true;
//             dictionariesServiceMock['updatingDictionariesEvent'].next();
//             expect(component.isWaitingForServerResponse).toBeFalse();
//         });
//     });

//     describe('getDisplayedColumns', () => {
//         it('should return array of keys', () => {
//             component['columnsItems'] = [
//                 {
//                     key: 'title',
//                     label: 'testvalue',
//                 },
//                 {
//                     key: 'description',
//                     label: 'testvalue2',
//                 },
//             ];
//             component.getDisplayedColumns();
//             expect(component.getDisplayedColumns()).toEqual(['title', 'description']);
//         });
//     });

//     describe('modifyDictionary', () => {
//         it('should call dialog.open', () => {
//             const spy = spyOn(component.dialog, 'open');
//             component.modifyDictionary(testElementData);
//             expect(spy).toHaveBeenCalled();
//         });
//     });

//     describe('uploadDictionary', () => {
//         it('should call dialog.open', () => {
//             const spy = spyOn(component.dialog, 'open');
//             component.uploadDictionary();
//             expect(spy).toHaveBeenCalled();
//         });
//     });

//     describe('deleteDictionary', () => {
//         it('should call dialog.open', () => {
//             const spy = spyOn(component.dialog, 'open');
//             component.deleteDictionary(testElementData);
//             expect(spy).toHaveBeenCalled();
//         });
//     });

//     describe('downloadDictionary', async () => {
//         it('should call dictionariesService.downloadDictionary', async () => {
//             const spy = spyOn(dictionariesServiceMock, 'downloadDictionary');
//             await component.downloadDictionary(TEST_ID);
//             expect(spy).toHaveBeenCalled();
//         });

//         it('should turn isWaitingForServerResponse to true', async () => {
//             spyOn(dictionariesServiceMock, 'downloadDictionary');
//             await component.downloadDictionary(TEST_ID);
//             expect(component.isWaitingForServerResponse).toBeTrue();
//         });
//     });

//     describe('resetDictionaries', async () => {
//         it('should call dictionariesService.resetDictionaries', async () => {
//             const spy = spyOn(dictionariesServiceMock, 'resetDictionaries');
//             await component.resetDictionaries();
//             expect(spy).toHaveBeenCalled();
//         });
//     });

//     describe('convertDictionariesToMatDataSource', () => {
//         it('should assign new MattableDataSource filled with TestArrayDictionarySummary[] to dataSource', async () => {
//             component['convertDictionariesToMatDataSource'](TEST_DICTIONARY_SUMMARY_ARRAY);
//             expect(component.dataSource).toBeInstanceOf(MatTableDataSource);
//         });
//     });

//     describe('askResetDictionaries', () => {
//         it('should call MatDialog open', () => {
//             const spy = spyOn(component['dialog'], 'open');
//             component.askResetDictionaries();
//             expect(spy).toHaveBeenCalled();
//         });
//     });
// });
