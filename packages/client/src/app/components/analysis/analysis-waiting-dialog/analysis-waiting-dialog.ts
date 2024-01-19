import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { throwError } from 'rxjs';
import { catchError, delay, retryWhen, take, tap } from 'rxjs/operators';
import AnalysisService from '@app/services/analysis-service/analysis.service';
import { Analysis, AnalysisRequestInfoType } from '@common/models/analysis';
import Delay from '@app/utils/delay/delay';
import { ANALYSIS_LABEL, START_DELAY, RETRY_DELAY, RETRY_COUNT, ANALYSIS_ERROR_MESSAGE } from '@app/constants/analysis-constants';
import { TypeOfId } from '@common/types/id';
import { GameHistory } from '@common/models/game-history';

export interface AnalysisWaitingDialogParameter {
    id: TypeOfId<GameHistory> | TypeOfId<Analysis>;
    type: AnalysisRequestInfoType;
}
@Component({
    selector: 'app-analysis-waiting-dialog',
    templateUrl: './analysis-waiting-dialog.html',
    styleUrls: ['./analysis-waiting-dialog.scss'],
})
export class AnalysisWaitingDialogComponent implements OnInit {
    attemptCount: number = 0;
    loading: boolean = true;
    message: string = ANALYSIS_LABEL;
    id: number;
    type: AnalysisRequestInfoType;
    constructor(
        private analysisService: AnalysisService,
        private dialogRef: MatDialogRef<AnalysisWaitingDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: AnalysisWaitingDialogParameter,
    ) {
        this.id = data.id;
        this.type = data.type;
        dialogRef.backdropClick().subscribe(() => {
            this.closeDialog();
        });
    }

    async ngOnInit(): Promise<void> {
        await this.makeAnalysisRequest();
    }

    closeDialog(): void {
        this.dialogRef.close();
    }

    async makeAnalysisRequest() {
        // Delay so the user has time to see the popup
        await Delay.for(START_DELAY);
        this.analysisService
            .requestAnalysis(this.id, this.type)
            .pipe(
                retryWhen((errors) =>
                    errors.pipe(
                        delay(RETRY_DELAY),
                        take(RETRY_COUNT),
                        catchError((err) => throwError(err)),
                        tap(() => {
                            this.attemptCount++;
                            this.message = `${ANALYSIS_LABEL} (${this.attemptCount} sec)`;
                            if (this.attemptCount > RETRY_COUNT) {
                                this.loading = false;
                                this.message = ANALYSIS_ERROR_MESSAGE;
                            }
                        }),
                    ),
                ),
            )
            .subscribe((analysis: Analysis) => {
                this.dialogRef.close(analysis);
            });
    }
}
