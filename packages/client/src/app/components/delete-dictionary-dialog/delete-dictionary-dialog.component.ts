// import { Component, Inject } from '@angular/core';
// import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
// import { ModifyDictionaryComponent } from '@app/components/modify-dictionary-dialog/modify-dictionary-dialog.component';
// import { DictionaryService } from '@app/services/dictionary-service/dictionary.service';
// import { DeleteDictionaryDialogParameters } from './delete-dictionary-dialog.component.types';

// @Component({
//     selector: 'app-delete-dictionary-dialog',
//     templateUrl: 'delete-dictionary-dialog.component.html',
//     styleUrls: ['delete-dictionary-dialog.component.scss'],
// })
// export class DeleteDictionaryDialogComponent {
//     private dictionaryId: string;

//     constructor(
//         private dialogRef: MatDialogRef<ModifyDictionaryComponent>,
//         private dictionariesService: DictionaryService,
//         @Inject(MAT_DIALOG_DATA) public data: DeleteDictionaryDialogParameters,
//     ) {
//         this.dictionaryId = data.dictionaryId;
//     }

//     closeDialog(): void {
//         this.dialogRef.close();
//     }

//     async deleteDictionary(): Promise<void> {
//         await this.dictionariesService.deleteDictionary(this.dictionaryId);
//         this.closeDialog();
//     }
// }
