import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EndGameDialogParameters } from './end-game-dialog.types';
import { DIALOG_END_OF_GAME_LOSS_MESSAGE, DIALOG_END_OF_GAME_TITLE, DIALOG_END_OF_GAME_WIN_MESSAGE } from '@app/constants/pages-constants';
import { ROUTE_HOME } from '@app/constants/routes-constants';
import { Router } from '@angular/router';
import { SoundName, SoundService } from '@app/services/sound-service/sound.service';

@Component({
    selector: 'app-end-game-dialog',
    templateUrl: 'end-game-dialog.html',
    styleUrls: ['end-game-dialog.scss'],
})
export class EndGameDialogComponent {
    title: string;
    hasWon: boolean;
    message: string;
    adjustedRating: number;
    ratingVariation: number;
    action?: () => void;
    actionAnalysis?: () => void;
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: EndGameDialogParameters,
        private router: Router,
        private soundService: SoundService,
        private dialogRef: MatDialogRef<EndGameDialogComponent>,
    ) {
        this.hasWon = data.hasWon;
        this.title = DIALOG_END_OF_GAME_TITLE(this.hasWon);
        this.message = this.hasWon ? DIALOG_END_OF_GAME_WIN_MESSAGE : DIALOG_END_OF_GAME_LOSS_MESSAGE;
        this.ratingVariation = data.ratingVariation;
        this.adjustedRating = data.adjustedRating;
        this.action = data.action;
        this.actionAnalysis = data.actionAnalysis;
        this.soundService.playSound(this.hasWon ? SoundName.VictorySound : SoundName.EndGameSound);
    }

    handleButtonClick() {
        if (this.action) this.action();
        this.router.navigate([ROUTE_HOME]);
        this.dialogRef.close();
    }

    handleAnalysisButtonClick() {
        if (this.actionAnalysis) this.actionAnalysis();
        this.dialogRef.close();
    }
}
