/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { InitializeState } from '@app/classes/connection-state-service/connection-state';
import { Subject } from 'rxjs';
import { DatabaseService } from '@app/services/database-service/database.service';
import { InitializerService } from './initializer.service';
import { STATE_ERROR_DATABASE_NOT_CONNECTED_MESSAGE } from '@app/constants/services-errors';
import { AuthenticationService } from '@app/services/authentication-service/authentication.service';
import { RouterTestingModule } from '@angular/router/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import Delay from '@app/utils/delay/delay';
import { TokenValidation } from '@app/classes/authentication/token-validation';

describe('InitializerService', () => {
    let service: InitializerService;
    let databaseService: jasmine.SpyObj<DatabaseService>;
    let authenticationService: jasmine.SpyObj<AuthenticationService>;

    beforeEach(() => {
        databaseService = jasmine.createSpyObj('DatabaseService', ['ping']);
        authenticationService = jasmine.createSpyObj('AuthenticationService', ['validateToken', 'signOut']);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule, MatDialogModule],
            providers: [
                InitializerService,
                { provide: DatabaseService, useValue: databaseService },
                { provide: AuthenticationService, useValue: authenticationService },
            ],
        });
        service = TestBed.inject(InitializerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('initialize', () => {
        it('should emit Ready on success', (done) => {
            const validateSubject = new Subject<TokenValidation>();
            const dbSubject = new Subject<void>();

            authenticationService.validateToken.and.returnValue(validateSubject);

            databaseService.ping.and.returnValue(dbSubject);

            service.state.subscribe((state) => {
                if (state.state === InitializeState.Ready) {
                    expect(true).toBeTrue();
                    done();
                }
            });

            service.initialize();

            (async () => {
                // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                await Delay.for(10);
                dbSubject.next();

                // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                await Delay.for(10);
                validateSubject.next(TokenValidation.Ok);
                validateSubject.complete();
            })();
        });

        it('should emit Trying DB on DB error', (done) => {
            const dbSubject = new Subject<void>();

            databaseService.ping.and.returnValue(dbSubject);

            service.state.subscribe((state) => {
                if (state.state === InitializeState.Trying && state.message === STATE_ERROR_DATABASE_NOT_CONNECTED_MESSAGE) {
                    expect(true).toBeTrue();
                    done();
                }
            });

            service.initialize();

            setTimeout(() => {
                dbSubject.error('error');
                // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            }, 40);
        });

        it('should handle invalid connection on already connected', (done) => {
            const dialog = TestBed.inject(MatDialog);
            const spy = spyOn(dialog, 'open');
            const validateSubject = new Subject<TokenValidation>();
            const dbSubject = new Subject<void>();

            authenticationService.validateToken.and.returnValue(validateSubject);

            databaseService.ping.and.returnValue(dbSubject);

            service.initialize();

            (async () => {
                // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                await Delay.for(10);
                dbSubject.next();

                // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                await Delay.for(10);
                validateSubject.next(TokenValidation.AlreadyConnected);
                validateSubject.complete();

                // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                await Delay.for(10);

                expect(spy).toHaveBeenCalled();
                done();
            })();
        });
    });
});
