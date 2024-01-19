import { Component, Input } from '@angular/core';
import { UserAchievement } from '@common/models/achievement';
import { MatDialog } from '@angular/material/dialog';
import { UserAchievementDialogComponent } from '@app/components/user-profile/user-achievement-dialog/user-achievement-dialog.component';

enum MessageType {
    MaxedOut = 'MaxedOut',
    NextLevel = 'NextLevel',
}

@Component({
    selector: 'app-user-achievement',
    templateUrl: './user-achievement.component.html',
    styleUrls: ['./user-achievement.component.scss'],
})
export class UserAchievementComponent {
    @Input() achievement: UserAchievement;

    constructor(private readonly dialog: MatDialog) {}

    get messageType(): string {
        return this.achievement.levelIndex === this.achievement.achievement.levels.length - 1 ? MessageType.MaxedOut : MessageType.NextLevel;
    }

    get nextLevelPoints(): number {
        return this.messageType === MessageType.MaxedOut
            ? Number.POSITIVE_INFINITY
            : this.achievement.levelIndex !== undefined
            ? this.achievement.achievement.levels[this.achievement.levelIndex + 1].value
            : this.achievement.achievement.levels[0].value;
    }

    get previousLevelPoints(): number {
        return this.achievement.levelIndex !== undefined ? this.achievement.achievement.levels[this.achievement.levelIndex].value : 0;
    }

    get levelsMarks(): number[] {
        return new Array(this.achievement.achievement.levels.length).fill(0).map((_, i) => i + 1);
    }

    get progress(): number {
        const previousLevel = this.previousLevelPoints;
        const nextLevel = this.nextLevelPoints;
        const progress = (this.achievement.value - previousLevel) / (nextLevel - previousLevel);

        return (
            ((this.achievement.levelIndex ?? -1) + 1) / (this.achievement.achievement.levels.length + 1) +
            progress / (this.achievement.achievement.levels.length + 1)
        );
    }

    openDialog(): void {
        this.dialog.open(UserAchievementDialogComponent, {
            data: this.achievement,
        });
    }
}
