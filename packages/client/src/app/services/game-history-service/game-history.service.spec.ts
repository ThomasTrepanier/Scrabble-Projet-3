import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { GameHistoryController } from '@app/controllers/game-history-controller/game-history.controller';
import { GameHistoryForUser } from '@common/models/game-history';
import { Observable, Subject, throwError } from 'rxjs';

import { GameHistoryService } from './game-history.service';

describe('GameHistoryService', () => {
    let service: GameHistoryService;
    let controllerSpy: jasmine.SpyObj<GameHistoryController>;

    beforeEach(() => {
        controllerSpy = jasmine.createSpyObj(GameHistoryController, {
            getGameHistories: new Observable<GameHistoryForUser[]>(),
            resetGameHistories: new Observable<void>(),
        });

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [{ provide: GameHistoryController, useValue: controllerSpy }],
        });
        service = TestBed.inject(GameHistoryService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('resetGameHistories', () => {
        it('should call resetGameHistories', () => {
            service.resetGameHistories();
            expect(controllerSpy.resetGameHistories).toHaveBeenCalled();
        });

        it('should resolve on next', (done) => {
            const subject = new Subject<void>();
            controllerSpy.resetGameHistories.and.returnValue(subject);

            let success = false;
            service
                .resetGameHistories()
                .then(() => {
                    success = true;
                })
                .finally(() => {
                    expect(success).toBeTrue();
                    done();
                });

            subject.next();
        });

        it('should reject on error', (done) => {
            controllerSpy.resetGameHistories.and.returnValue(throwError('error'));

            let success = false;
            service
                .resetGameHistories()
                .catch(() => {
                    success = true;
                })
                .finally(() => {
                    expect(success).toBeTrue();
                    done();
                });
        });
    });
});
