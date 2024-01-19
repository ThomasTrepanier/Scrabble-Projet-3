// import { Component, OnDestroy } from '@angular/core';
// import { FormControl, FormGroup, Validators } from '@angular/forms';
// import { MatDialogRef } from '@angular/material/dialog';
// import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';
// import { VIRTUAL_PLAYER_NAME_VALIDATION } from '@app/constants/virtual-player-name-validation';
// import { VirtualPlayerProfilesService } from '@app/services/virtual-player-profile-service/virtual-player-profile.service';
// import { VirtualPlayerData } from '@common/models/virtual-player';
// import { Subject } from 'rxjs';

// @Component({
//     selector: 'app-create-virtual-player-dialog',
//     templateUrl: './create-virtual-player-dialog.component.html',
//     styleUrls: ['./create-virtual-player-dialog.component.scss'],
// })
// export class CreateVirtualPlayerComponent implements OnDestroy {
//     formParameters: FormGroup;
//     virtualPlayerLevels: typeof VirtualPlayerLevel;
//     isVirtualPlayerNameValid: boolean;

//     private virtualPlayerName: string;
//     private componentDestroyed$: Subject<boolean>;

//     constructor(private dialogRef: MatDialogRef<CreateVirtualPlayerComponent>,
// private virtualPlayerProfilesService: VirtualPlayerProfilesService) {
//         this.componentDestroyed$ = new Subject();
//         this.virtualPlayerLevels = VirtualPlayerLevel;
//         this.virtualPlayerName = '';
//         this.isVirtualPlayerNameValid = false;
//         this.formParameters = new FormGroup({
//             level: new FormControl(VirtualPlayerLevel.Beginner),
//             inputVirtualPlayerName: new FormControl(this.virtualPlayerName, [
//                 Validators.required,
//                 Validators.minLength(VIRTUAL_PLAYER_NAME_VALIDATION.minLength),
//                 Validators.maxLength(VIRTUAL_PLAYER_NAME_VALIDATION.maxLength),
//             ]),
//         });
//     }

//     onPlayerNameChanges([playerName, valid]: [string, boolean]): void {
//         this.virtualPlayerName = playerName;
//         this.isVirtualPlayerNameValid = valid;
//     }

//     ngOnDestroy(): void {
//         this.componentDestroyed$.next(true);
//         this.componentDestroyed$.complete();
//     }

//     async createVirtualPlayer(): Promise<void> {
//         this.virtualPlayerProfilesService.createVirtualPlayer({
//             name: this.virtualPlayerName,
//             level: this.formParameters.get('level')?.value as VirtualPlayerLevel,
//         } as VirtualPlayerData);
//         this.closeDialog();
//     }

//     closeDialog(): void {
//         this.dialogRef.close();
//     }
// }
