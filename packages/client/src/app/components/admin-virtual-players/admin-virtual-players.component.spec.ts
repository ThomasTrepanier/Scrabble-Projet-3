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
// import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
// import { MatSort } from '@angular/material/sort';
// import { MatTableDataSource, MatTableModule } from '@angular/material/table';
// import { MatTabsModule } from '@angular/material/tabs';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { RouterModule } from '@angular/router';
// import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';
// import { IconComponent } from '@app/components/icon/icon.component';
// import { PageHeaderComponent } from '@app/components/page-header/page-header.component';
// import { ERROR_SNACK_BAR_CONFIG, SUCCESS_SNACK_BAR_CONFIG } from '@app/constants/components-constants';
// import { PositiveFeedback } from '@app/constants/virtual-players-components-constants';
// import { AppMaterialModule } from '@app/modules/material.module';
// import { VirtualPlayerProfilesService } from '@app/services/virtual-player-profile-service/virtual-player-profile.service';
// import { VirtualPlayer } from '@common/models/virtual-player';
// import { AdminVirtualPlayersComponent } from './admin-virtual-players.component';
// import { VirtualPlayersComponentState } from './admin-virtual-players.types';

// const TEST_ID = 524324;

// const DEFAULT_PROFILE: VirtualPlayer = {
//     name: 'Brun',
//     level: VirtualPlayerLevel.Beginner,
//     isDefault: true,
//     idVirtualPlayer: TEST_ID + 1,
// };

// const CUSTOM_PROFILE: VirtualPlayer = {
//     name: 'Rouge',
//     level: VirtualPlayerLevel.Beginner,
//     isDefault: false,
//     idVirtualPlayer: TEST_ID + 2,
// };

// const TEST_VIRTUAL_PLAYER_PROFILES: VirtualPlayer[] = [DEFAULT_PROFILE, CUSTOM_PROFILE];

// describe('AdminVirtualPlayersComponent', () => {
//     let component: AdminVirtualPlayersComponent;
//     let fixture: ComponentFixture<AdminVirtualPlayersComponent>;
//     let virtualPlayerProfilesServiceMock: VirtualPlayerProfilesService;

//     beforeEach(async () => {
//         await TestBed.configureTestingModule({
//             declarations: [AdminVirtualPlayersComponent, IconComponent, PageHeaderComponent, MatSort],
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
//             providers: [VirtualPlayerProfilesService, MatSnackBar],
//         }).compileComponents();
//     });

//     beforeEach(() => {
//         fixture = TestBed.createComponent(AdminVirtualPlayersComponent);
//         virtualPlayerProfilesServiceMock = TestBed.inject(VirtualPlayerProfilesService);

//         component = fixture.componentInstance;
//         fixture.detectChanges();
//     });

//     it('should create', () => {
//         expect(component).toBeTruthy();
//     });

//     describe('subscriptions', () => {
//         describe('On virtualPlayersUpdateEvent', () => {
//             it('should call convertVirtualPlayerProfilesToMatDataSource', () => {
//                 const spy = spyOn<any>(component, 'convertVirtualPlayerProfilesToMatDataSource').and.callFake(() => {
//                     return;
//                 });
//                 virtualPlayerProfilesServiceMock['virtualPlayersUpdateEvent'].next(TEST_VIRTUAL_PLAYER_PROFILES);
//                 expect(spy).toHaveBeenCalledWith(TEST_VIRTUAL_PLAYER_PROFILES);
//             });

//             it('should set attributes', () => {
//                 spyOn<any>(component, 'convertVirtualPlayerProfilesToMatDataSource').and.callFake(() => {
//                     return;
//                 });
//                 virtualPlayerProfilesServiceMock['virtualPlayersUpdateEvent'].next();
//                 expect(component.state).toBe(VirtualPlayersComponentState.Ready);
//                 expect(component.isWaitingForServerResponse).toBe(false);
//             });
//         });

//         describe('On requestSentEvent', () => {
//             it('should set attributes', () => {
//                 virtualPlayerProfilesServiceMock['requestSentEvent'].next();
//                 expect(component.isWaitingForServerResponse).toBe(true);
//             });
//         });

//         describe('On componentUpdateEvent', () => {
//             it('should call snackBar.open', () => {
//                 const openSpy = spyOn(component['snackBar'], 'open');
//                 const isFeedBackPositiveSpy = spyOn<any>(component, 'isFeedbackPositive').and.callFake(() => {
//                     return;
//                 });
//                 virtualPlayerProfilesServiceMock['componentUpdateEvent'].next();
//                 expect(openSpy).toHaveBeenCalled();
//                 expect(isFeedBackPositiveSpy).toHaveBeenCalled();
//             });
//         });
//     });

//     describe('ngOnDestroy', () => {
//         it('should call next', () => {
//             const spy = spyOn(component['componentDestroyed$'], 'next');
//             spyOn(component['componentDestroyed$'], 'complete');
//             component.ngOnDestroy();
//             expect(spy).toHaveBeenCalled();
//         });

//         it('should call complete', () => {
//             spyOn(component['componentDestroyed$'], 'next');
//             const spy = spyOn(component['componentDestroyed$'], 'complete');
//             component.ngOnDestroy();
//             expect(spy).toHaveBeenCalled();
//         });
//     });

//     describe('ngOnInit', () => {
//         it('should call getAllVirtualPlayersProfile', () => {
//             const spy = spyOn(virtualPlayerProfilesServiceMock, 'getAllVirtualPlayersProfile');
//             component.ngOnInit();
//             expect(spy).toHaveBeenCalled();
//         });
//     });

//     describe('updateVirtualPlayer', () => {
//         it('should open UpdateVirtualPLayerComponent', () => {
//             const spy = spyOn(component['dialog'], 'open');
//             component.updateVirtualPlayer(CUSTOM_PROFILE);
//             expect(spy).toHaveBeenCalled();
//         });
//     });

//     describe('createVirtualPlayer', () => {
//         it('should open createVirtualPlayerComponent', () => {
//             const spy = spyOn(component['dialog'], 'open');
//             component.createVirtualPlayer();
//             expect(spy).toHaveBeenCalled();
//         });
//     });

//     describe('deleteVirtualPlayer', () => {
//         it('should open deleteVirtualPlayerComponent', () => {
//             const spy = spyOn(component['dialog'], 'open');
//             component.deleteVirtualPlayer(DEFAULT_PROFILE);
//             expect(spy).toHaveBeenCalled();
//         });
//     });

//     describe('resetVirtualPlayers', () => {
//         it('should call virtualPlayerProfilesService.resetVirtualProfiles', () => {
//             const spy = spyOn(virtualPlayerProfilesServiceMock, 'resetVirtualPlayerProfiles').and.callFake(() => {
//                 return;
//             });
//             component.resetVirtualPlayers();
//             expect(spy).toHaveBeenCalled();
//         });
//     });

//     describe('getDisplayedColumns', () => {
//         it('should return array of keys', () => {
//             component.getDisplayedColumns();
//             expect(component.getDisplayedColumns()).toEqual(['name', 'actions']);
//         });
//     });

//     describe('convertVirtualPlayerProfilesToMatDataSource', () => {
//         it('should assign new MattableDataSource to dataSource', async () => {
//             component['convertVirtualPlayerProfilesToMatDataSource'](TEST_VIRTUAL_PLAYER_PROFILES);
//             expect(component.dataSourceBeginner).toBeInstanceOf(MatTableDataSource);
//             expect(component.dataSourceExpert).toBeInstanceOf(MatTableDataSource);
//         });
//     });

//     describe('initializeSubscriptions', () => {
//         it('should call subscription methods', () => {
//             const subscribeToVirtualPlayerProfilesUpdateEventSpy = spyOn(
//                 virtualPlayerProfilesServiceMock,
//                 'subscribeToVirtualPlayerProfilesUpdateEvent',
//             ).and.callFake(() => {
//                 return;
//             });
//             const subscribeToRequestSentEventSpy = spyOn(virtualPlayerProfilesServiceMock, 'subscribeToRequestSentEvent').and.callFake(() => {
//                 return;
//             });
//             const subscribeToComponentUpdateEventSpy = spyOn(virtualPlayerProfilesServiceMock,
//  'subscribeToComponentUpdateEvent').and.callFake(() => {
//                 return;
//             });
//             component['initializeSubscriptions']();
//             expect(subscribeToVirtualPlayerProfilesUpdateEventSpy).toHaveBeenCalled();
//             expect(subscribeToRequestSentEventSpy).toHaveBeenCalled();
//             expect(subscribeToComponentUpdateEventSpy).toHaveBeenCalled();
//         });
//     });

//     describe('isFeedbackPositive', () => {
//         it('should return SUCCESS_SNACK_BAR_CONFIG with positive response', () => {
//             expect(component['isFeedbackPositive'](PositiveFeedback.VirtualPlayerCreated)).toEqual(SUCCESS_SNACK_BAR_CONFIG);
//         });
//         it('should return ERROR_SNACK_BAR_CONFIG with negative response', () => {
//             expect(component['isFeedbackPositive']('un ti feedback avec po dfautes' as PositiveFeedback)).toEqual(ERROR_SNACK_BAR_CONFIG);
//         });
//     });

//     describe('askResetVirtualPlayers', () => {
//         it('should call MatDialog open', () => {
//             const spy = spyOn(component['dialog'], 'open');
//             component.askResetVirtualPlayers();
//             expect(spy).toHaveBeenCalled();
//         });
//     });
// });
