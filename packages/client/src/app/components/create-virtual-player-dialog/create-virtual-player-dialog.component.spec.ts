// /* eslint-disable dot-notation */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { HttpClientModule } from '@angular/common/http';
// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { AbstractControl, ReactiveFormsModule } from '@angular/forms';
// import { MatCardModule } from '@angular/material/card';
// import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
// import { MatDividerModule } from '@angular/material/divider';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// import { MatSelectModule } from '@angular/material/select';
// import { MatSnackBarModule } from '@angular/material/snack-bar';
// import { MatTabsModule } from '@angular/material/tabs';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { IconComponent } from '@app/components/icon/icon.component';
// import { NameFieldComponent } from '@app/components/name-field/name-field.component';
// import { PageHeaderComponent } from '@app/components/page-header/page-header.component';
// import { AppMaterialModule } from '@app/modules/material.module';
// import { VirtualPlayerProfilesService } from '@app/services/virtual-player-profile-service/virtual-player-profile.service';
// import { CreateVirtualPlayerComponent } from './create-virtual-player-dialog.component';

// const TEST_NAME = 'TEST_NAME';
// export class MatDialogMock {
//     close() {
//         return {
//             close: () => ({}),
//         };
//     }
// }

// describe('CreateVirtualPlayerComponent', () => {
//     let component: CreateVirtualPlayerComponent;
//     let fixture: ComponentFixture<CreateVirtualPlayerComponent>;
//     let service: VirtualPlayerProfilesService;
//     beforeEach(async () => {
//         await TestBed.configureTestingModule({
//             declarations: [CreateVirtualPlayerComponent, IconComponent, PageHeaderComponent, NameFieldComponent],
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
//                 VirtualPlayerProfilesService,
//             ],
//         }).compileComponents();
//     });

//     beforeEach(() => {
//         fixture = TestBed.createComponent(CreateVirtualPlayerComponent);
//         service = TestBed.inject(VirtualPlayerProfilesService);

//         component = fixture.componentInstance;
//         fixture.detectChanges();
//     });

//     it('should create', () => {
//         expect(component).toBeTruthy();
//     });

//     describe('onPlayerNameChanges', () => {
//         it('change value of virtualPlayerName', () => {
//             component.onPlayerNameChanges([TEST_NAME, true]);
//             expect(component['virtualPlayerName']).toEqual(TEST_NAME);
//         });
//         it('change value of isVirtualPlayerNameValid', () => {
//             component.onPlayerNameChanges([TEST_NAME, true]);
//             expect(component['isVirtualPlayerNameValid']).toEqual(true);
//         });
//     });

//     describe('ngOnDestroy', () => {
//         it('should call componentDestroyed$.next with true', () => {
//             const spyNext = spyOn(component['componentDestroyed$'], 'next').and.callFake(() => {
//                 return null;
//             });
//             spyOn(component['componentDestroyed$'], 'complete').and.callFake(() => {
//                 return null;
//             });
//             component.ngOnDestroy();
//             expect(spyNext).toHaveBeenCalled();
//             expect(spyNext).toHaveBeenCalledWith(true);
//         });

//         it('should call componentDestroyed$.complete with true', () => {
//             const spyComplete = spyOn(component['componentDestroyed$'], 'complete').and.callFake(() => {
//                 return null;
//             });
//             spyOn(component['componentDestroyed$'], 'next').and.callFake(() => {
//                 return null;
//             });
//             component.ngOnDestroy();
//             expect(spyComplete).toHaveBeenCalled();
//         });
//     });

//     describe('createVirtualPlayer', () => {
//         let spyDictionary: jasmine.Spy;
//         let spyClose: jasmine.Spy;
//         beforeEach(() => {
//             spyDictionary = spyOn(service, 'createVirtualPlayer').and.callFake(async () => {
//                 return;
//             });
//             spyClose = spyOn(component, 'closeDialog').and.callFake(() => {
//                 return;
//             });
//         });

//         it('should call virtualPlayerProfilesService.createVirtualPlayer with get returning null', () => {
//             spyOn(component.formParameters, 'get').and.callFake(() => {
//                 return null;
//             });
//             component.createVirtualPlayer();
//             expect(spyDictionary).toHaveBeenCalled();
//         });

//         it('should call virtualPlayerProfilesService.createVirtualPlayer with get returning Abstract Control', () => {
//             spyOn(component.formParameters, 'get').and.callFake(() => {
//                 return {} as AbstractControl;
//             });
//             component.createVirtualPlayer();
//             expect(spyDictionary).toHaveBeenCalled();
//         });

//         it('should call dialogRef.close()', () => {
//             spyOn(component['dialogRef'], 'close').and.callFake(() => {
//                 return;
//             });
//             component.closeDialog();
//             expect(spyClose).toHaveBeenCalled();
//         });
//     });

//     describe('closeDialog', () => {
//         it('should call dialogRef.close()', () => {
//             const spyDialog = spyOn(component['dialogRef'], 'close').and.callFake(() => {
//                 return;
//             });
//             component.closeDialog();
//             expect(spyDialog).toHaveBeenCalled();
//         });
//     });
// });
