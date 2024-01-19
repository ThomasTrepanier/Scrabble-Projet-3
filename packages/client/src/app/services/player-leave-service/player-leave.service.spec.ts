/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable dot-notation */
import { TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { PlayerLeavesController } from '@app/controllers/player-leave-controller/player-leave.controller';
import { SocketService } from '..';
import { PlayerLeavesService } from './player-leave.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('PlayerLeavesService', () => {
    let service: PlayerLeavesService;
    let playerLeavesController: PlayerLeavesController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule, MatSnackBarModule, MatDialogModule],
            providers: [PlayerLeavesController, SocketService],
        });
        service = TestBed.inject(PlayerLeavesService);
        playerLeavesController = TestBed.inject(PlayerLeavesController);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should reset gameService data when playerLeavesController.resetGameEvent emits', () => {
        const eventEmitSpy = spyOn(service['gameViewEventManager'], 'emitGameViewEvent').and.callFake(() => {});
        playerLeavesController['resetGameEvent'].emit();
        expect(eventEmitSpy).toHaveBeenCalledWith('resetServices');
    });

    // it('handleJoinerLeaveGame should call joinerLeavesGameEvent.next', () => {
    //     const joinerLeaveGameEventSpy = spyOn(service['joinerLeavesGameEvent'], 'next').and.callFake(() => {
    //         return;
    //     });
    //     service['handleJoinerLeaveGame'](DEFAULT_LEAVER);
    //     expect(joinerLeaveGameEventSpy).toHaveBeenCalled();
    // });

    it('handleLocalPlayerLeavesGame should call playerLeavesController.handleLeaveGame', () => {
        const handleLeaveGameSpy = spyOn(service['playerLeavesController'], 'handleLeaveGame').and.callFake(() => {
            return;
        });
        service.handleLocalPlayerLeavesGame();
        expect(handleLeaveGameSpy).toHaveBeenCalled();
    });

    it('handleLeaveGroup should call playerLeavesController.handleLeaveGame if this.currentGroupId is defined', () => {
        spyOn(service['gameDispatcherService'], 'getCurrentGroupId').and.returnValue('DEFAULT_GAME_ID');
        const handleLeaveGameSpy = spyOn(service['playerLeavesController'], 'handleLeaveGame').and.callFake(() => {
            return;
        });
        service.handleLeaveGroup();
        expect(handleLeaveGameSpy).toHaveBeenCalled();
    });

    it('handleLeaveGroup should call gameDispatcherService.resetServiceData', () => {
        const handleLeaveGameSpy = spyOn<any>(service['gameDispatcherService'], 'resetServiceData').and.callFake(() => {});
        service.handleLeaveGroup();
        expect(handleLeaveGameSpy).toHaveBeenCalled();
    });

    it('ngOnDestroy should call serviceDestroyed$.next', () => {
        const nextSpy = spyOn(service['serviceDestroyed$'], 'next').and.callFake(() => {
            return;
        });
        service.ngOnDestroy();
        expect(nextSpy).toHaveBeenCalled();
    });

    it('ngOnDestroy should call serviceDestroyed$.complete', () => {
        const completeSpy = spyOn(service['serviceDestroyed$'], 'complete').and.callFake(() => {
            return;
        });
        service.ngOnDestroy();
        expect(completeSpy).toHaveBeenCalled();
    });
});
