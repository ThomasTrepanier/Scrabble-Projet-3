/* eslint-disable dot-notation */
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Alert, AlertType } from '@app/classes/alert/alert';

import { AlertService } from './alert.service';

describe('AlertService', () => {
    let service: AlertService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [BrowserAnimationsModule, MatSnackBarModule],
        });
        service = TestBed.inject(AlertService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('alert', () => {
        it('should call snackBar.openFromComponent', () => {
            spyOn(service['snackBar'], 'openFromComponent');
            service.alert(AlertType.Error, '');
            expect(service['snackBar'].openFromComponent).toHaveBeenCalled();
        });

        it('should call log', () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            spyOn(service as any, 'log');
            service.alert(AlertType.Error, '');
            expect(service['log']).toHaveBeenCalled();
        });
    });

    describe('error', () => {
        it('should call alert', () => {
            spyOn(service, 'alert');
            service.error('');
            expect(service.alert).toHaveBeenCalled();
        });
    });

    describe('warn', () => {
        it('should call alert', () => {
            spyOn(service, 'alert');
            service.warn('');
            expect(service.alert).toHaveBeenCalled();
        });
    });

    describe('success', () => {
        it('should call alert', () => {
            spyOn(service, 'alert');
            service.success('');
            expect(service.alert).toHaveBeenCalled();
        });
    });

    describe('info', () => {
        it('should call alert', () => {
            spyOn(service, 'alert');
            service.info('');
            expect(service.alert).toHaveBeenCalled();
        });
    });

    describe('log', () => {
        it('should log as Error when given error type', () => {
            const alert: Alert = {
                content: 'pas-content',
                type: AlertType.Error,
            };
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const spy = spyOn(console, 'error');
            service['log'](alert);
            expect(spy).toHaveBeenCalled();
        });
        it('should log as Warn  when given warn type', () => {
            const alert: Alert = {
                content: 'pas-content',
                type: AlertType.Warn,
            };
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const spy = spyOn(console, 'warn');
            service['log'](alert);
            expect(spy).toHaveBeenCalled();
        });
        it('should log as info when given info type', () => {
            const alert: Alert = {
                content: 'pas-content',
                type: AlertType.Info,
            };
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const spy = spyOn(console, 'info');
            service['log'](alert);
            expect(spy).toHaveBeenCalled();
        });
        it('should log as log when given success type', () => {
            const alert: Alert = {
                content: 'pas-content',
                type: AlertType.Success,
            };
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const spy = spyOn(console, 'log');
            service['log'](alert);
            expect(spy).toHaveBeenCalled();
        });
    });
});
