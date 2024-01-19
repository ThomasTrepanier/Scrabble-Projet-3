import { Injectable } from '@angular/core';
import { AnalysisController } from '@app/controllers/analysis-controller/analysis.controller';
import { Analysis, AnalysisData, AnalysisRequestInfoType } from '@common/models/analysis';
import { GameHistory } from '@common/models/game-history';
import { TypeOfId } from '@common/types/id';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export default class AnalysisService {
    constructor(private analysisController: AnalysisController) {}

    requestAnalysis(id: TypeOfId<GameHistory> | TypeOfId<AnalysisData>, requestType: AnalysisRequestInfoType): Observable<Analysis> {
        return this.analysisController.requestAnalysis(id, requestType);
    }
}
