// import { Injectable } from '@angular/core';
// import { VirtualPlayerProfilesController } from '@app/controllers/virtual-player-profile-controller/virtual-player-profile.controller';
// import { Subject } from 'rxjs';
// import { takeUntil } from 'rxjs/operators';
// import { VirtualPlayer, VirtualPlayerData } from '@common/models/virtual-player';

// @Injectable({
//     providedIn: 'root',
// })
// export class VirtualPlayerProfilesService {
//     private serviceDestroyed$: Subject<boolean>;
//     private virtualPlayersUpdateEvent: Subject<VirtualPlayer[]>;
//     private componentUpdateEvent: Subject<string>;
//     private requestSentEvent: Subject<undefined>;
//     constructor(private readonly virtualPlayerProfilesController: VirtualPlayerProfilesController) {
//         this.serviceDestroyed$ = new Subject();
//         this.virtualPlayersUpdateEvent = new Subject();
//         this.componentUpdateEvent = new Subject();
//         this.requestSentEvent = new Subject();
//         this.virtualPlayerProfilesController.subscribeToGetAllVirtualPlayersEvent(this.serviceDestroyed$, (profiles) => {
//             this.virtualPlayersUpdateEvent.next(profiles);
//         });
//         this.virtualPlayerProfilesController.subscribeToVirtualPlayerServerResponseEvent(this.serviceDestroyed$, (message) => {
//             this.requestSentEvent.next();
//             this.componentUpdateEvent.next(message);
//             this.getAllVirtualPlayersProfile();
//         });
//         this.virtualPlayerProfilesController.subscribeToVirtualPlayerErrorEvent(this.serviceDestroyed$, (message) => {
//             this.componentUpdateEvent.next(message);
//             this.getAllVirtualPlayersProfile();
//         });
//     }

//     createVirtualPlayer(virtualPlayerData: VirtualPlayerData): void {
//         this.virtualPlayerProfilesController.handleCreateVirtualPlayerProfileEvent(virtualPlayerData);
//     }

//     updateVirtualPlayer(virtualPlayerData: VirtualPlayerData): void {
//         this.virtualPlayerProfilesController.handleUpdateVirtualPlayerProfileEvent(virtualPlayerData);
//     }

//     getAllVirtualPlayersProfile(): void {
//         this.virtualPlayerProfilesController.handleGetAllVirtualPlayerProfilesEvent();
//     }

//     resetVirtualPlayerProfiles(): void {
//         this.virtualPlayerProfilesController.handleResetVirtualPlayerProfilesEvent();
//     }

//     deleteVirtualPlayer(id: number): void {
//         this.virtualPlayerProfilesController.handleDeleteVirtualPlayerProfileEvent(id);
//     }

//     subscribeToVirtualPlayerProfilesUpdateEvent(serviceDestroyed$: Subject<boolean>, callback: (profiles: VirtualPlayer[]) => void): void {
//         this.virtualPlayersUpdateEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
//     }
//     subscribeToComponentUpdateEvent(serviceDestroyed$: Subject<boolean>, callback: (message: string) => void): void {
//         this.componentUpdateEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
//     }
//     subscribeToRequestSentEvent(serviceDestroyed$: Subject<boolean>, callback: () => void): void {
//         this.requestSentEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
//     }
// }
