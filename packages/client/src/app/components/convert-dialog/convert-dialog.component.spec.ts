// /* eslint-disable max-classes-per-file */
// /* eslint-disable @typescript-eslint/no-empty-function */
// /* eslint-disable dot-notation */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { CommonModule } from '@angular/common';
// import { HttpClientModule } from '@angular/common/http';
// import { Component } from '@angular/core';
// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { MatButtonModule } from '@angular/material/button';
// import { MatButtonToggleModule } from '@angular/material/button-toggle';
// import { MatButtonToggleGroupHarness, MatButtonToggleHarness } from '@angular/material/button-toggle/testing';
// import { MatButtonHarness } from '@angular/material/button/testing';
// import { MatCardModule } from '@angular/material/card';
// import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatSelectModule } from '@angular/material/select';
// import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
// import { RouterTestingModule } from '@angular/router/testing';
// import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';
// import { IconComponent } from '@app/components/icon/icon.component';
// import { MOCK_PLAYER_PROFILES, MOCK_PLAYER_PROFILE_MAP } from '@app/constants/service-test-constants';
// import { AppMaterialModule } from '@app/modules/material.module';
// import { GameDispatcherService } from '@app/services/';
// import { VirtualPlayerProfilesService } from '@app/services/virtual-player-profile-service/virtual-player-profile.service';
// import { VirtualPlayer, VirtualPlayerData } from '@common/models/virtual-player';
// import { Subject } from 'rxjs';
// import { ConvertDialogComponent } from './convert-dialog.component';
// import SpyObj = jasmine.SpyObj;

// @Component({
//     template: '',
// })
// class TestComponent {}

// describe('ConvertDialogComponent', () => {
//     let component: ConvertDialogComponent;
//     let fixture: ComponentFixture<ConvertDialogComponent>;
//     let virtualPlayerProfileSpy: SpyObj<VirtualPlayerProfilesService>;
//     let gameDispatcherServiceSpy: SpyObj<GameDispatcherService>;
//     let matDialogSpy: SpyObj<MatDialogRef<ConvertDialogComponent>>;
//     let backdropSubject: Subject<MouseEvent>;
//     let updateObs = new Subject<VirtualPlayer[]>();

//     beforeEach(() => {
//         virtualPlayerProfileSpy = jasmine.createSpyObj('VirtualPlayerProfilesService', [
//             'getVirtualPlayerProfiles',
//             'createVirtualPlayer',
//             'updateVirtualPlayer',
//             'getAllVirtualPlayersProfile',
//             'resetVirtualPlayerProfiles',
//             'deleteVirtualPlayer',
//             'subscribeToVirtualPlayerProfilesUpdateEvent',
//             'subscribeToComponentUpdateEvent',
//             'subscribeToRequestSentEvent',
//             'virtualPlayersUpdateEvent',
//         ]);
//         updateObs = new Subject();
//         virtualPlayerProfileSpy.subscribeToVirtualPlayerProfilesUpdateEvent.and.callFake(
//             (serviceDestroyed$: Subject<boolean>, callback: (dictionaries: VirtualPlayer[]) => void) => updateObs.subscribe(callback),
//         );
//     });

//     beforeEach(() => {
//         gameDispatcherServiceSpy = jasmine.createSpyObj('GameDispatcherService', ['handleRecreateGame']);
//         gameDispatcherServiceSpy.handleRecreateGame.and.callFake(() => {});

//         backdropSubject = new Subject();
//         matDialogSpy = jasmine.createSpyObj('MatDialogRef', ['backdropClick', 'close']);
//         matDialogSpy.backdropClick.and.returnValue(backdropSubject.asObservable());
//     });

//     beforeEach(() => {
//         gameDispatcherServiceSpy = jasmine.createSpyObj('GameDispatcherService', ['handleRecreateGame']);
//         gameDispatcherServiceSpy.handleRecreateGame.and.callFake(() => {});

//         backdropSubject = new Subject();
//         matDialogSpy = jasmine.createSpyObj('MatDialogRef', ['backdropClick', 'close']);
//         matDialogSpy.backdropClick.and.returnValue(backdropSubject.asObservable());
//     });

//     beforeEach(async () => {
//         await TestBed.configureTestingModule({
//             declarations: [ConvertDialogComponent, TestComponent, IconComponent],
//             imports: [
//                 AppMaterialModule,
//                 HttpClientModule,
//                 BrowserAnimationsModule,
//                 FormsModule,
//                 ReactiveFormsModule,
//                 CommonModule,
//                 MatButtonToggleModule,
//                 MatButtonModule,
//                 MatFormFieldModule,
//                 MatSelectModule,
//                 MatCardModule,
//                 MatInputModule,
//                 MatDialogModule,
//                 NoopAnimationsModule,
//                 RouterTestingModule.withRoutes([
//                     { path: 'create-waiting-room', component: TestComponent },
//                     { path: 'game', component: TestComponent },
//                 ]),
//             ],
//             providers: [
//                 MatButtonToggleHarness,
//                 MatButtonHarness,
//                 MatButtonToggleGroupHarness,
//                 { provide: GameDispatcherService, useValue: gameDispatcherServiceSpy },
//                 { provide: MatDialogRef, useValue: matDialogSpy },
//                 { provide: MAT_DIALOG_DATA, useValue: {} },
//                 { provide: VirtualPlayerProfilesService, useValue: virtualPlayerProfileSpy },
//             ],
//         }).compileComponents();
//     });

//     beforeEach(() => {
//         fixture = TestBed.createComponent(ConvertDialogComponent);
//         component = fixture.componentInstance;
//         fixture.detectChanges();
//     });

//     it('should create', () => {
//         expect(component).toBeTruthy();
//     });

//     describe('ngOnInit', () => {
//         it('should subscribe to level value change', () => {
//             const spy = spyOn<any>(component.gameParameters.get('virtualPlayerName'), 'reset').and.callFake(() => {});
//             component.gameParameters.patchValue({ level: VirtualPlayerLevel.Expert });
//             expect(spy).toHaveBeenCalled();
//         });

//         it('should subscribe to subscribeToVirtualPlayerProfilesUpdateEvent', () => {
//             component.ngOnInit();
//             expect(virtualPlayerProfileSpy.subscribeToVirtualPlayerProfilesUpdateEvent).toHaveBeenCalled();
//         });

//         it('should subscribe to subscribeToVirtualPlayerProfilesUpdateEvent', () => {
//             const spy = spyOn<any>(component, 'generateVirtualPlayerProfileMap').and.callFake(() => {});
//             component.ngOnInit();
//             updateObs.next([]);
//             expect(spy).toHaveBeenCalled();
//         });
//     });

//     describe('ngOndestroy', () => {
//         it('should always call next and complete on ngUnsubscribe', () => {
//             const ngUnsubscribeNextSpy = spyOn<any>(component['pageDestroyed$'], 'next');
//             const ngUnsubscribeCompleteSpy = spyOn<any>(component['pageDestroyed$'], 'complete');

//             component.ngOnDestroy();
//             expect(ngUnsubscribeNextSpy).toHaveBeenCalled();
//             expect(ngUnsubscribeCompleteSpy).toHaveBeenCalled();
//         });
//     });

//     describe('onSubmit', () => {
//         it('should call handleRecreateGame with params', () => {
//             component.onSubmit();
//             expect(gameDispatcherServiceSpy.handleRecreateGame).toHaveBeenCalledWith(component.gameParameters);
//         });

//         it('should close the dialog with isConverting = true', () => {
//             component.onSubmit();

//             expect(matDialogSpy.close).toHaveBeenCalledWith({ isConverting: true });
//         });
//     });

//     describe('returnToWaiting', () => {
//         it('should call handleRecreateGame wit no params', () => {
//             component.returnToWaiting();
//             expect(gameDispatcherServiceSpy.handleRecreateGame).toHaveBeenCalledWith();
//         });

//         it('should close the dialog with isConverting = false', () => {
//             component.returnToWaiting();

//             expect(matDialogSpy.close).toHaveBeenCalledWith({ isConverting: false });
//         });
//     });

//     describe('setupDialog', () => {
//         it('should disable closing', () => {
//             component['dialogRef'].disableClose = false;

//             component['setupDialog']();

//             expect(component['dialogRef'].disableClose).toBeTrue();
//         });

//         it('should call returnToWaiting when backdrop is clicked', () => {
//             component['setupDialog']();
//             const returnSpy = spyOn(component, 'returnToWaiting').and.callFake(() => {});

//             backdropSubject.next();

//             expect(returnSpy).toHaveBeenCalled();
//         });
//     });

//     describe('getVirtualPlayerNames', () => {
//         it('should return empty string if no virtual player map', () => {
//             component['virtualPlayerNameMap'] = undefined as unknown as Map<VirtualPlayerLevel, string[]>;
//             expect(component.getVirtualPlayerNames()).toEqual([]);
//         });

//         it('should return all names of profiles with Beginner level if this level is selected', () => {
//             component['virtualPlayerNameMap'] = MOCK_PLAYER_PROFILE_MAP;

//             component.gameParameters.patchValue({ level: VirtualPlayerLevel.Beginner });
//             const expectedResult: string[] = MOCK_PLAYER_PROFILES.filter(
//                 (profile: VirtualPlayerData) => profile.level === VirtualPlayerLevel.Beginner,
//             ).map((profile: VirtualPlayerData) => profile.name);

//             expect(component.getVirtualPlayerNames()).toEqual(expectedResult);
//         });

//         it('should return all names of profiles with Expert level if this level is selected', () => {
//             component['virtualPlayerNameMap'] = MOCK_PLAYER_PROFILE_MAP;

//             component.gameParameters.patchValue({ level: VirtualPlayerLevel.Expert });
//             const expectedResult: string[] = MOCK_PLAYER_PROFILES.filter(
//                 (profile: VirtualPlayerData) => profile.level === VirtualPlayerLevel.Expert,
//             ).map((profile: VirtualPlayerData) => profile.name);

//             expect(component.getVirtualPlayerNames()).toEqual(expectedResult);
//         });
//     });

//     it('generateVirtualPlayerProfileMap should create virtual player name map', () => {
//         component['virtualPlayerNameMap'] = new Map();
//         component['generateVirtualPlayerProfileMap'](MOCK_PLAYER_PROFILES);
//         expect(component['virtualPlayerNameMap']).toEqual(MOCK_PLAYER_PROFILE_MAP);
//     });
// });
