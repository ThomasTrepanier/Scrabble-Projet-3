/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable dot-notation */
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { ConnectionState } from '@app/classes/connection-state-service/connection-state';
import { SocketTestHelper } from '@app/classes/socket-test-helper/socket-test-helper.spec';
import { SOCKET_ID_UNDEFINED } from '@app/constants/services-errors';
import { SocketService } from '@app/services/';
import { AlertService } from '@app/services/alert-service/alert.service';
import { SocketErrorResponse } from '@common/models/error';

describe('SocketService', () => {
    let service: SocketService;
    let socket: SocketTestHelper;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatSnackBarModule, BrowserAnimationsModule],
            providers: [AlertService],
        });
        service = TestBed.inject(SocketService);

        socket = new SocketTestHelper();

        spyOn<any>(service, 'getSocket').and.returnValue(socket);
        service['socket'] = service['getSocket']();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('connectSocket', () => {
        it('should emit true on connection', (done) => {
            service.connectSocket().subscribe((connected) => {
                expect(connected).toBeTrue();
                done();
            });

            socket.peerSideEmit('connect');
        });

        it('should emit false on connection fail', (done) => {
            service.connectSocket().subscribe((connected) => {
                expect(connected).toBeFalse();
                done();
            });

            socket.peerSideEmit('connect_error');
        });

        it('should emit to socketError on error', (done) => {
            service.socketError.subscribe(() => {
                expect(true).toBeTrue();
                done();
            });
            service.connectSocket().subscribe();

            const error: SocketErrorResponse = { error: '', message: '', status: 0 };
            socket.peerSideEmit('error', error);
        });
    });

    it('should call socket.on with an event', () => {
        const event = 'helloWorld';
        const action = () => {};
        const spy = spyOn(service['socket'], 'on');
        service.on(event, action);
        expect(spy).toHaveBeenCalledWith(event as any, action);
    });

    it('should throw when socket is undefined on getId', () => {
        (service['socket'] as unknown) = undefined;
        expect(() => service.getId()).toThrowError(SOCKET_ID_UNDEFINED);
    });
});
