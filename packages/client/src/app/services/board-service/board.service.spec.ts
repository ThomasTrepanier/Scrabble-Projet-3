/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { TestBed } from '@angular/core/testing';
import { Square } from '@app/classes/square';
import { BoardService } from '@app/services';
import { Observable, Subscription } from 'rxjs';

// eslint-disable-next-line no-undef
const DEFAULT_SQUARE: Square = {
    tile: null,
    position: { column: 0, row: 0 },
    scoreMultiplier: null,
    wasMultiplierUsed: false,
    isCenter: false,
};
const DEFAULT_BOARD: Square[][] = [
    [
        { ...DEFAULT_SQUARE, position: { column: 0, row: 0 } },
        { ...DEFAULT_SQUARE, position: { column: 0, row: 1 } },
    ],
    [
        { ...DEFAULT_SQUARE, position: { column: 1, row: 0 } },
        { ...DEFAULT_SQUARE, position: { column: 1, row: 1 } },
    ],
];

describe('BoardService', () => {
    let service: BoardService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(BoardService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('initializeBoard should set value of initialBoard', () => {
        service['initialBoard'] = [[]];
        service.initializeBoard(DEFAULT_BOARD);
        expect(service['initialBoard']).toEqual(DEFAULT_BOARD);
    });

    it('initializeBoard should emit boardInitializationEvent', () => {
        const spy = spyOn(service['boardInitialization$'], 'next').and.callFake(() => {
            return;
        });
        service.initializeBoard(DEFAULT_BOARD);
        expect(spy).toHaveBeenCalled();
    });

    it('updateBoard should emit boardUpdateEvent', () => {
        const spy = spyOn(service['boardUpdateEvent$'], 'next');
        const squaresUpdated = [DEFAULT_SQUARE];
        service.updateBoard(squaresUpdated);
        expect(spy).toHaveBeenCalledWith(squaresUpdated);
    });

    it('subscribeToInitializeBoard should return subscription', () => {
        const fakeInit = (board: Square[][]) => board;
        const fakeDestroy$: Observable<boolean> = new Observable();

        const pipedObs: Observable<Square[][]> = new Observable();
        const expectedSubscription: Subscription = new Subscription();
        const pipedSpy = spyOn(service['boardInitialization$'], 'pipe').and.returnValue(pipedObs);
        const subscribeSpy = spyOn<any>(pipedObs, 'subscribe').and.returnValue(expectedSubscription);

        service.subscribeToInitializeBoard(fakeDestroy$, fakeInit);

        expect(pipedSpy).toHaveBeenCalled();
        expect(subscribeSpy).toHaveBeenCalledWith(fakeInit);
    });

    it('subscribeToBoardUpdate should return subscription', () => {
        const fakeUpdate = (squares: Square[]) => squares;
        const fakeDestroy$: Observable<boolean> = new Observable();

        const pipedObs: Observable<Square[]> = new Observable();
        const expectedSubscription: Subscription = new Subscription();
        const pipedSpy = spyOn(service['boardUpdateEvent$'], 'pipe').and.returnValue(pipedObs);
        const subscribeSpy = spyOn<any>(pipedObs, 'subscribe').and.returnValue(expectedSubscription);

        service.subscribeToBoardUpdate(fakeDestroy$, fakeUpdate);

        expect(pipedSpy).toHaveBeenCalled();
        expect(subscribeSpy).toHaveBeenCalledWith(fakeUpdate);
    });

    it('readInitialBoard should return copy of initialBoard', () => {
        service['initialBoard'] = DEFAULT_BOARD;
        const actualBoard = service.readInitialBoard();

        expect(actualBoard === DEFAULT_BOARD).toBeFalse();
        expect(actualBoard).toEqual(DEFAULT_BOARD);
    });
});
