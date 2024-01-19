import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AnalysisController } from '@app/controllers/analysis-controller/analysis.controller';
import AnalysisService from './analysis.service';
import { AnalysisRequestInfoType } from '@common/models/analysis';

describe('AnalysisService', () => {
    let service: AnalysisService;
    let analysisService: jasmine.SpyObj<AnalysisController>;

    beforeEach(() => {
        analysisService = jasmine.createSpyObj(AnalysisController, ['requestAnalysis']);

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [{ provide: AnalysisController, useValue: analysisService }],
        });
        service = TestBed.inject(AnalysisService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('requestAnalysis', () => {
        it('should call analysisService.start', () => {
            service.requestAnalysis(1, AnalysisRequestInfoType.ID_ANALYSIS);
            expect(analysisService.requestAnalysis).toHaveBeenCalled();
        });
    });
});
