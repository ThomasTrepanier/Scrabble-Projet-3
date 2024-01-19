// import { Component, Inject } from '@angular/core';
// import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
// import { DeleteVirtualPlayerDialogParameters } from '@app/components/admin-virtual-players/admin-virtual-players.types';
// import { VirtualPlayerProfilesService } from '@app/services/virtual-player-profile-service/virtual-player-profile.service';

// @Component({
//     selector: 'app-delete-virtual-player-dialog',
//     templateUrl: 'delete-virtual-player-dialog.component.html',
//     styleUrls: ['delete-virtual-player-dialog.component.scss'],
// })
// export class DeleteVirtualPlayerDialogComponent {
//     virtualPlayerId: number;
//     constructor(
//         private dialogRef: MatDialogRef<DeleteVirtualPlayerDialogComponent>,
//         private virtualPlayerProfilesService: VirtualPlayerProfilesService,
//         @Inject(MAT_DIALOG_DATA) public data: DeleteVirtualPlayerDialogParameters,
//     ) {
//         this.virtualPlayerId = data.idVirtualPlayer;
//     }

//     closeDialog(): void {
//         this.dialogRef.close();
//     }

//     deleteVirtualPlayer(): void {
//         this.virtualPlayerProfilesService.deleteVirtualPlayer(this.virtualPlayerId);
//         this.closeDialog();
//     }
// }
