/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper/socket-test-helper.spec';
import { GameService, SocketService } from '@app/services';
import { of, Subject } from 'rxjs';
import { Socket } from 'socket.io-client';
import { PlayerLeavesController } from './player-leave.controller';

describe('PlayerLeavesController', () => {
    let controller: PlayerLeavesController;
    let httpMock: HttpTestingController;
    let socketServiceMock: SocketService;
    let socketHelper: SocketTestHelper;

    beforeEach(async () => {
        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketService(jasmine.createSpyObj('AlertService', ['alert', 'error', 'warn', 'success', 'info']));
        socketServiceMock['socket'] = socketHelper as unknown as Socket;
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule],
            providers: [PlayerLeavesController, { provide: SocketService, useValue: socketServiceMock }, GameService],
        });
        controller = TestBed.inject(PlayerLeavesController);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should create', () => {
        expect(controller).toBeTruthy();
    });

    it('On cleanup, configureSocket should emit resetGameEvent', async () => {
        const cleanupSpy = spyOn(controller['resetGameEvent'], 'emit').and.callFake(async () => {
            return;
        });
        socketHelper.peerSideEmit('cleanup');
        expect(cleanupSpy).toHaveBeenCalled();
    });

    it('handleLeaveGame should send delete request', () => {
        const fakeObservable = of<string>('fakeResponse');
        const deleteSpy = spyOn(controller['http'], 'delete').and.returnValue(fakeObservable);
        controller.handleLeaveGame('');
        expect(deleteSpy).toHaveBeenCalled();
    });

    describe('ngOnDestroy', () => {
        it('ngOnDestroy should call serviceDestroyed$.next', () => {
            const nextSpy = spyOn(controller['serviceDestroyed$'], 'next').and.callFake(() => {
                return;
            });
            controller.ngOnDestroy();
            expect(nextSpy).toHaveBeenCalled();
        });

        it('ngOnDestroy should call serviceDestroyed$.complete', () => {
            const completeSpy = spyOn(controller['serviceDestroyed$'], 'complete').and.callFake(() => {
                return;
            });
            controller.ngOnDestroy();
            expect(completeSpy).toHaveBeenCalled();
        });
    });

    describe('subcription methods', () => {
        let serviceDestroyed$: Subject<boolean>;
        let callback: () => void;

        beforeEach(() => {
            serviceDestroyed$ = new Subject();
            callback = () => {
                return;
            };
        });

        it('subscribeToResetGameEvent should call subscribe method on createGameEvent', () => {
            const subscriptionSpy = spyOn<any>(controller['resetGameEvent'], 'subscribe');
            controller.subscribeToResetGameEvent(serviceDestroyed$, callback);
            expect(subscriptionSpy).toHaveBeenCalled();
        });
    });
});
