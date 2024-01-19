import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserAchievement } from '@common/models/achievement';

@Component({
    selector: 'app-user-achievement-dialog',
    templateUrl: './user-achievement-dialog.component.html',
    styleUrls: ['./user-achievement-dialog.component.scss'],
})
export class UserAchievementDialogComponent {
    constructor(@Inject(MAT_DIALOG_DATA) readonly achievement: UserAchievement, readonly ref: MatDialogRef<UserAchievementDialogComponent>) {}
}
