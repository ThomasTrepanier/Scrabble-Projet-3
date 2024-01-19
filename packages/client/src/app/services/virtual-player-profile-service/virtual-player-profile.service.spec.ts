// /* eslint-disable dot-notation */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/no-empty-function */
// import { HttpClientTestingModule } from '@angular/common/http/testing';
// import { TestBed } from '@angular/core/testing';
// import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
// import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';
// import { VirtualPlayerProfilesController } from '@app/controllers/virtual-player-profile-controller/virtual-player-profile.controller';
// import { VirtualPlayer, VirtualPlayerData } from '@common/models/virtual-player';
// import { Subject } from 'rxjs';
// import { VirtualPlayerProfilesService } from './virtual-player-profile.service';

// const TEST_ID = 8980;

// const TEST_VIRTUAL_PLAYER_DATA: VirtualPlayerData = {
//     name: 'BenOuiEncoreElScrabblo',
//     idVirtualPlayer: TEST_ID,
//     level: VirtualPlayerLevel.Beginner,
// };

// const TEST_VIRTUAL_PLAYER_PROFILES: VirtualPlayer[] = [{} as VirtualPlayer];

// describe('VirtualPlayerProfilesService', () => {
//     let service: VirtualPlayerProfilesService;
//     let controller: VirtualPlayerProfilesController;

//     beforeEach(() => {
//         TestBed.configureTestingModule({
//             imports: [HttpClientTestingModule, MatSnackBarModule],
//             providers: [VirtualPlayerProfilesController, MatSnackBar],
//         });
//         controller = TestBed.inject(VirtualPlayerProfilesController);
//         service = TestBed.inject(VirtualPlayerProfilesService);
//     });

//     it('should be created', () => {
//         expect(service).toBeTruthy();
//     });

//     describe('getAllVirtualPlayersEvent', () => {
//         it('should react to getAllVirtualPlayersEvent', () => {
//             const virtualPlayerUpdateSpy = spyOn(service['virtualPlayersUpdateEvent'], 'next').and.callFake(() => {
//                 return;
//             });
//             controller['getAllVirtualPlayersEvent'].next(TEST_VIRTUAL_PLAYER_PROFILES);
//             expect(virtualPlayerUpdateSpy).toHaveBeenCalled();
//         });
//     });

//     describe('virtualPlayerServerResponseEvent', () => {
//         it('should react to virtualPlayerServerResponseEvent', async () => {
//             const componentUpdateSpy = spyOn(service['componentUpdateEvent'], 'next').and.callFake(() => {
//                 return;
//             });
//             const requestSpy = spyOn(service['requestSentEvent'], 'next').and.callFake(() => {
//                 return;
//             });
//             const getAllSpy = spyOn(service, 'getAllVirtualPlayersProfile').and.callFake(async () => {
//                 return;
//             });
//             controller['virtualPlayerServerResponseEvent'].next();
//             expect(componentUpdateSpy).toHaveBeenCalled();
//             expect(requestSpy).toHaveBeenCalled();
//             expect(getAllSpy).toHaveBeenCalled();
//         });
//     });

//     describe('VirtualPlayerErrorEvent', () => {
//         it('should react to VirtualPlayerErrorEvent', async () => {
//             const componentUpdateSpy = spyOn(service['componentUpdateEvent'], 'next').and.callFake(() => {
//                 return;
//             });
//             const getAllSpy = spyOn(service, 'getAllVirtualPlayersProfile').and.callFake(async () => {
//                 return;
//             });
//             controller['virtualPlayerErrorEvent'].next();
//             expect(componentUpdateSpy).toHaveBeenCalled();
//             expect(getAllSpy).toHaveBeenCalled();
//         });
//     });

//     describe('createVirtualPlayer', () => {
//         it('should call handleCreateVirtualPlayerProfileEvent', () => {
//             const componentUpdateSpy = spyOn(controller, 'handleCreateVirtualPlayerProfileEvent').and.callFake(async () => {
//                 return;
//             });
//             service.createVirtualPlayer(TEST_VIRTUAL_PLAYER_DATA);
//             expect(componentUpdateSpy).toHaveBeenCalled();
//         });
//     });

//     describe('updateVirtualPlayer', () => {
//         it('should call handleUpdateVirtualPlayerProfileEvent', () => {
//             const componentUpdateSpy = spyOn(controller, 'handleUpdateVirtualPlayerProfileEvent').and.callFake(async () => {
//                 return;
//             });
//             service.updateVirtualPlayer(TEST_VIRTUAL_PLAYER_DATA);
//             expect(componentUpdateSpy).toHaveBeenCalled();
//         });
//     });

//     describe('getAllVirtualPlayersProfile', () => {
//         it('should call handleGetAllVirtualPlayerProfilesEvent', () => {
//             const componentUpdateSpy = spyOn(controller, 'handleGetAllVirtualPlayerProfilesEvent').and.callFake(async () => {
//                 return;
//             });
//             service.getAllVirtualPlayersProfile();
//             expect(componentUpdateSpy).toHaveBeenCalled();
//         });
//     });

//     describe('deleteVirtualPlayer', () => {
//         it('should call handleDeleteVirtualPlayerProfileEvent', () => {
//             const componentUpdateSpy = spyOn(controller, 'handleDeleteVirtualPlayerProfileEvent').and.callFake(async () => {
//                 return;
//             });
//             service.deleteVirtualPlayer(TEST_ID);
//             expect(componentUpdateSpy).toHaveBeenCalled();
//         });
//     });

//     describe('resetVirtualPlayerProfiles', () => {
//         it('should call handleResetVirtualPlayerProfilesEvent', () => {
//             const componentUpdateSpy = spyOn(controller, 'handleResetVirtualPlayerProfilesEvent').and.callFake(async () => {
//                 return;
//             });
//             service.resetVirtualPlayerProfiles();
//             expect(componentUpdateSpy).toHaveBeenCalled();
//         });
//     });

//     describe('subcription methods', () => {
//         let serviceDestroyed$: Subject<boolean>;
//         let callback: () => void;

//         beforeEach(() => {
//             serviceDestroyed$ = new Subject();
//             callback = () => {
//                 return;
//             };
//         });

//         it('should subscribe to virtualPlayersUpdateEvent', () => {
//             const subscribeSpy = spyOn<any>(service['virtualPlayersUpdateEvent'], 'subscribe');
//             service.subscribeToVirtualPlayerProfilesUpdateEvent(serviceDestroyed$, callback);
//             expect(subscribeSpy).toHaveBeenCalled();
//         });

//         it('should subscribe to componentUpdateEvent', () => {
//             const subscribeSpy = spyOn<any>(service['componentUpdateEvent'], 'subscribe');
//             service.subscribeToComponentUpdateEvent(serviceDestroyed$, callback);
//             expect(subscribeSpy).toHaveBeenCalled();
//         });

//         it('should subscribe to requestSentEvent', () => {
//             const subscribeSpy = spyOn<any>(service['requestSentEvent'], 'subscribe');
//             service.subscribeToRequestSentEvent(serviceDestroyed$, callback);
//             expect(subscribeSpy).toHaveBeenCalled();
//         });
//     });
// });
