import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { SoundService } from '@app/services/sound-service/sound.service';
import { soundSettings } from '@app/utils/settings';

@Component({
    selector: 'app-sound-settings-dialog',
    templateUrl: 'sound-settings-dialog.html',
    styleUrls: ['sound-settings-dialog.scss'],
})
export class SoundSettingsDialogComponent implements OnInit {
    isMusicEnabled: boolean;
    isSoundEnabled: boolean;
    constructor(private soundService: SoundService, private dialogRef: MatDialogRef<SoundSettingsDialogComponent>) {}

    ngOnInit() {
        this.isMusicEnabled = this.soundService.isMusicEnabledSetting;
        this.isSoundEnabled = SoundService.isSoundEnabled;
        this.dialogRef.backdropClick().subscribe(() => {
            this.closeDialog();
        });
    }

    closeDialog(): void {
        this.dialogRef.close();
    }

    saveMusic() {
        this.soundService.isMusicEnabledSetting = this.isMusicEnabled;
    }
    saveSound() {
        SoundService.isSoundEnabled = this.isSoundEnabled;
        soundSettings.set('isSoundEffectsEnabled', this.isSoundEnabled);
    }
}
