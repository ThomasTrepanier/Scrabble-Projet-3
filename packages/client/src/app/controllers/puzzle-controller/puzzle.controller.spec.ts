import { TestBed } from '@angular/core/testing';

import { PuzzleController } from './puzzle.controller';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('PuzzleControllerService', () => {
    let service: PuzzleController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(PuzzleController);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
