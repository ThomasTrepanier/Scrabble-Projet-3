// import { HttpClient } from '@angular/common/http';
// import { Injectable, OnDestroy } from '@angular/core';
// import { PositiveFeedback } from '@app/constants/virtual-players-components-constants';
// import { VirtualPlayer, VirtualPlayerData, VirtualPlayerProfilesData } from '@common/models/virtual-player';
// import { Subject } from 'rxjs';
// import { takeUntil } from 'rxjs/operators';
// import { environment } from 'src/environments/environment';

// @Injectable({
//     providedIn: 'root',
// })
// export class VirtualPlayerProfilesController implements OnDestroy {
//     private endpoint = `${environment.serverUrl}/virtualPlayerProfiles`;
//     private virtualPlayerServerResponseEvent: Subject<string> = new Subject();
//     private getAllVirtualPlayersEvent: Subject<VirtualPlayer[]> = new Subject();
//     private virtualPlayerErrorEvent: Subject<string> = new Subject();
//     private serviceDestroyed$: Subject<boolean> = new Subject();
//     constructor(private readonly http: HttpClient) {}

//     ngOnDestroy(): void {
//         this.serviceDestroyed$.next(true);
//         this.serviceDestroyed$.complete();
//     }

//     handleGetAllVirtualPlayerProfilesEvent(): void {
//         this.http.get<VirtualPlayerProfilesData>(this.endpoint, { observe: 'body' }).subscribe(
//             (body) => {
//                 this.getAllVirtualPlayersEvent.next(body.virtualPlayerProfiles);
//             },
//             (error) => {
//                 this.virtualPlayerErrorEvent.next(error.error.message);
//             },
//         );
//     }

//     handleCreateVirtualPlayerProfileEvent(newProfileData: VirtualPlayerData): void {
//         this.http.post(this.endpoint, { virtualPlayerData: newProfileData }).subscribe(
//             () => {
//                 this.virtualPlayerServerResponseEvent.next(PositiveFeedback.VirtualPlayerCreated);
//             },
//             (error) => {
//                 this.virtualPlayerErrorEvent.next(error.error.message);
//             },
//         );
//     }

//     handleUpdateVirtualPlayerProfileEvent(profileData: VirtualPlayerData): void {
//         this.http.patch<void>(`${this.endpoint}/${profileData.idVirtualPlayer}`, { profileData }).subscribe(
//             () => {
//                 this.virtualPlayerServerResponseEvent.next(PositiveFeedback.VirtualPlayerUpdated);
//             },
//             (error) => {
//                 this.virtualPlayerErrorEvent.next(error.error.message);
//             },
//         );
//     }

//     handleDeleteVirtualPlayerProfileEvent(profileId: number): void {
//         this.http.delete<void>(`${this.endpoint}/${profileId}`).subscribe(
//             () => {
//                 this.virtualPlayerServerResponseEvent.next(PositiveFeedback.VirtualPlayerDeleted);
//             },
//             (error) => {
//                 this.virtualPlayerErrorEvent.next(error.error.message);
//             },
//         );
//     }

//     handleResetVirtualPlayerProfilesEvent(): void {
//         this.http.delete<void>(this.endpoint).subscribe(
//             () => {
//                 this.virtualPlayerServerResponseEvent.next(PositiveFeedback.VirtualPlayersDeleted);
//             },
//             (error) => {
//                 this.virtualPlayerErrorEvent.next(error.error.message);
//             },
//         );
//     }

//     subscribeToGetAllVirtualPlayersEvent(serviceDestroyed$: Subject<boolean>, callback: (response: VirtualPlayer[]) => void): void {
//         this.getAllVirtualPlayersEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
//     }

//     subscribeToVirtualPlayerErrorEvent(serviceDestroyed$: Subject<boolean>, callback: (response: string) => void): void {
//         this.virtualPlayerErrorEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
//     }

//     subscribeToVirtualPlayerServerResponseEvent(serviceDestroyed$: Subject<boolean>, callback: (response: string) => void): void {
//         this.virtualPlayerServerResponseEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
//     }
// }
