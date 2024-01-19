import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Analysis, AnalysisData, AnalysisRequestInfoType } from '@common/models/analysis';
import { GameHistory } from '@common/models/game-history';
import { TypeOfId } from '@common/types/id';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class AnalysisController {
    private endpoint = `${environment.serverUrl}/analysis`;

    constructor(private http: HttpClient) {}

    requestAnalysis(id: TypeOfId<GameHistory> | TypeOfId<AnalysisData>, requestType: AnalysisRequestInfoType): Observable<Analysis> {
        const endpoint = `${this.endpoint}/${id}`;
        const params = new HttpParams().set('requestType', requestType);
        return this.http.get<Analysis>(endpoint, { params, observe: 'body' });
    }
}
