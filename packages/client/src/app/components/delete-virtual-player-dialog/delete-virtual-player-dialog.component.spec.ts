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
// import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';
// import { DeleteVirtualPlayerDialogParameters } from '@app/components/admin-virtual-players/admin-virtual-players.types';
// import { IconComponent } from '@app/components/icon/icon.component';
// import { PageHeaderComponent } from '@app/components/page-header/page-header.component';
// import { AppMaterialModule } from '@app/modules/material.module';
// import { VirtualPlayerProfilesService } from '@app/services/virtual-player-profile-service/virtual-player-profile.service';
// import { DeleteVirtualPlayerDialogComponent } from './delete-virtual-player-dialog.component';
// export class MatDialogMock {
//     close() {
//         return {
//             close: () => ({}),
//         };
//     }
// }

// const MODEL: DeleteVirtualPlayerDialogParameters = {
//     name: 'testName',
//     level: VirtualPlayerLevel.Beginner,
//     idVirtualPlayer: 7653,
//     onClose: () => {
//         return;
//     },
// };

// describe('DeleteVirtualPlayerDialogComponent', () => {
//     let component: DeleteVirtualPlayerDialogComponent;
//     let fixture: ComponentFixture<DeleteVirtualPlayerDialogComponent>;
//     let service: VirtualPlayerProfilesService;

//     beforeEach(async () => {
//         await TestBed.configureTestingModule({
//             declarations: [DeleteVirtualPlayerDialogComponent, IconComponent, PageHeaderComponent],
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
//                     provide: MAT_DIALOG_DATA,
//                     useValue: MODEL,
//                 },
//                 VirtualPlayerProfilesService,
//             ],
//         }).compileComponents();
//     });

//     beforeEach(() => {
//         fixture = TestBed.createComponent(DeleteVirtualPlayerDialogComponent);
//         service = TestBed.inject(VirtualPlayerProfilesService);

//         component = fixture.componentInstance;
//         fixture.detectChanges();
//     });

//     it('should create', () => {
//         expect(component).toBeTruthy();
//     });

//     describe('deleteVirtualPlayer', () => {
//         let spyDelete: jasmine.Spy;
//         let spyClose: jasmine.Spy;
//         beforeEach(() => {
//             spyDelete = spyOn(service, 'deleteVirtualPlayer').and.callFake(async () => {
//                 return;
//             });
//             spyClose = spyOn(component, 'closeDialog').and.callFake(async () => {
//                 return;
//             });
//         });

//         it('should call virtualPlayerProfilesService.deleteVirtualPlayer', async () => {
//             await component.deleteVirtualPlayer();
//             expect(spyDelete).toHaveBeenCalled();
//         });

//         it('should call component.closeDialog', async () => {
//             await component.deleteVirtualPlayer();
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
