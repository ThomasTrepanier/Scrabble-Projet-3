import { TestBed } from '@angular/core/testing';

import { PuzzleService } from './puzzle.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PuzzleController } from '@app/controllers/puzzle-controller/puzzle.controller';
import { WordPlacement } from '@common/models/word-finding';
import { MatDialogModule } from '@angular/material/dialog';

describe('PuzzleService', () => {
    let service: PuzzleService;
    let puzzleController: jasmine.SpyObj<PuzzleController>;

    beforeEach(() => {
        puzzleController = jasmine.createSpyObj(PuzzleController, ['start', 'complete', 'abandon']);

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, MatDialogModule],
            providers: [{ provide: PuzzleController, useValue: puzzleController }],
        });
        service = TestBed.inject(PuzzleService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('start', () => {
        it('should call puzzleController.start', () => {
            service.start();
            expect(puzzleController.start).toHaveBeenCalled();
        });
    });

    describe('complete', () => {
        it('should call puzzleController.complete', () => {
            service.complete({} as WordPlacement);
            expect(puzzleController.complete).toHaveBeenCalled();
        });
    });

    describe('abandon', () => {
        it('should call puzzleController.abandon', () => {
            service.abandon();
            expect(puzzleController.abandon).toHaveBeenCalled();
        });
    });
});
