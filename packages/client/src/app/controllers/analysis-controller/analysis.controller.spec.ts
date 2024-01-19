/* eslint-disable dot-notation */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AnalysisRequestInfoType } from '@common/models/analysis';
import { AnalysisController } from './analysis.controller';

describe('AnalysisController', () => {
    let service: AnalysisController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(AnalysisController);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('requestAnalysis', () => {
        it('should call get with endpoint', () => {
            const spy = spyOn(service['http'], 'get');

            service.requestAnalysis(1, AnalysisRequestInfoType.ID_ANALYSIS);

            expect(spy).toHaveBeenCalled();
        });
    });
});
