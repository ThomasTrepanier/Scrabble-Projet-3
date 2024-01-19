/* eslint-disable dot-notation */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { GameHistoryController } from './game-history.controller';

describe('GameHistoryControllerService', () => {
    let service: GameHistoryController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(GameHistoryController);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getGameHistories', () => {
        it('should call get with endpoint', () => {
            const spy = spyOn(service['http'], 'get');

            service.getGameHistories();

            expect(spy).toHaveBeenCalledOnceWith(service['endpoint']);
        });
    });

    describe('resetGameHistories', () => {
        it('should call delete with endpoint', () => {
            const spy = spyOn(service['http'], 'delete');

            service.resetGameHistories();

            expect(spy).toHaveBeenCalledOnceWith(service['endpoint']);
        });
    });
});
