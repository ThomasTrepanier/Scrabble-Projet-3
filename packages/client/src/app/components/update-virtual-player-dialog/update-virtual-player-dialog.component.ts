// import { Component, Inject, OnDestroy } from '@angular/core';
// import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
// import { VirtualPlayerProfilesService } from '@app/services/virtual-player-profile-service/virtual-player-profile.service';
// import { Subject } from 'rxjs';
// import { UpdateVirtualPlayerDialogParameters } from './update-virtual-player.component.types';

// @Component({
//     selector: 'app-update-virtual-player-dialog',
//     templateUrl: './update-virtual-player-dialog.component.html',
//     styleUrls: ['./update-virtual-player-dialog.component.scss'],
// })
// export class UpdateVirtualPlayerComponent implements OnDestroy {
//     isVirtualPlayerNameValid: boolean;
//     virtualPlayerName: string;

//     private componentDestroyed$: Subject<boolean>;
//     constructor(
//         private dialogRef: MatDialogRef<UpdateVirtualPlayerComponent>,
//         private virtualPlayerProfilesService: VirtualPlayerProfilesService,
//         @Inject(MAT_DIALOG_DATA) public data: UpdateVirtualPlayerDialogParameters,
//     ) {
//         this.componentDestroyed$ = new Subject();
//         this.isVirtualPlayerNameValid = false;
//         this.virtualPlayerName = data.name;
//     }

//     ngOnDestroy(): void {
//         this.componentDestroyed$.next(true);
//         this.componentDestroyed$.complete();
//     }

//     onPlayerNameChanges([playerName, valid]: [string, boolean]): void {
//         this.virtualPlayerName = playerName;
//         this.isVirtualPlayerNameValid = valid;
//     }

//     updateVirtualPlayer(): void {
//         this.virtualPlayerProfilesService.updateVirtualPlayer({
//             name: this.virtualPlayerName,
//             level: this.data.level,
//             idVirtualPlayer: this.data.idVirtualPlayer,
//         });
//         this.closeDialog();
//     }

//     closeDialog(): void {
//         this.dialogRef.close();
//     }
// }
