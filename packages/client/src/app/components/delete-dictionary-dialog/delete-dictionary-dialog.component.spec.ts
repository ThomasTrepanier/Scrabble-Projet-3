// /* eslint-disable dot-notation */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { HttpClientModule } from '@angular/common/http';
// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { ReactiveFormsModule } from '@angular/forms';
// import { MatCardModule } from '@angular/material/card';
// import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
// import { MatDividerModule } from '@angular/material/divider';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// import { MatSelectModule } from '@angular/material/select';
// import { MatSnackBarModule } from '@angular/material/snack-bar';
// import { MatTabsModule } from '@angular/material/tabs';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { IconComponent } from '@app/components/icon/icon.component';
// import { PageHeaderComponent } from '@app/components/page-header/page-header.component';
// import { AppMaterialModule } from '@app/modules/material.module';
// import { DictionaryService } from '@app/services/dictionary-service/dictionary.service';
// import { DeleteDictionaryDialogComponent } from './delete-dictionary-dialog.component';
// import { DeleteDictionaryDialogParameters } from './delete-dictionary-dialog.component.types';

// const MODEL: DeleteDictionaryDialogParameters = {
//     pageTitle: 'Dialog title',
//     dictionaryId: 'testId',
//     onClose: () => {
//         return;
//     },
// };

// export class MatDialogMock {
//     close() {
//         return {
//             close: () => ({}),
//         };
//     }
// }

// describe('DeleteDictionaryComponent', () => {
//     let component: DeleteDictionaryDialogComponent;
//     let fixture: ComponentFixture<DeleteDictionaryDialogComponent>;
//     let dictionariesServiceMock: DictionaryService;

//     beforeEach(async () => {
//         await TestBed.configureTestingModule({
//             declarations: [DeleteDictionaryDialogComponent, IconComponent, PageHeaderComponent],
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
//                 DictionaryService,
//                 {
//                     provide: MAT_DIALOG_DATA,
//                     useValue: MODEL,
//                 },
//             ],
//         }).compileComponents();
//     });

//     beforeEach(() => {
//         fixture = TestBed.createComponent(DeleteDictionaryDialogComponent);
//         dictionariesServiceMock = TestBed.inject(DictionaryService);

//         component = fixture.componentInstance;
//         fixture.detectChanges();
//     });

//     it('should create', () => {
//         expect(component).toBeTruthy();
//     });

//     describe('closeDialog', () => {
//         it('should call dialogRef.close()', () => {
//             const spy = spyOn(component['dialogRef'], 'close').and.callFake(() => {
//                 return;
//             });
//             component.closeDialog();
//             expect(spy).toHaveBeenCalled();
//         });
//     });

//     describe('deleteDictionary', async () => {
//         let spyDictionariesService: jasmine.Spy;
//         let spyClose: jasmine.Spy;
//         beforeEach(() => {
//             spyDictionariesService = spyOn(dictionariesServiceMock, 'deleteDictionary').and.callFake(async () => {
//                 return;
//             });
//             spyClose = spyOn(component, 'closeDialog').and.callFake(async () => {
//                 return;
//             });
//         });

//         it('should turn state to Loading', async () => {
//             await component.deleteDictionary();
//         });

//         it('should call dictionariesService.deleteDictionary', async () => {
//             await component.deleteDictionary();
//             expect(spyDictionariesService).toHaveBeenCalled();
//         });

//         it('should call component.closeDialog', async () => {
//             await component.deleteDictionary();
//             expect(spyClose).toHaveBeenCalled();
//         });
//     });
// });
