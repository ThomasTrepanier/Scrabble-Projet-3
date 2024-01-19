/* eslint-disable no-console */
import { Injectable, isDevMode } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Alert, AlertType } from '@app/classes/alert/alert';
import { AlertComponent } from '@app/components/alert/alert.component';

@Injectable({
    providedIn: 'root',
})
export class AlertService {
    constructor(private snackBar: MatSnackBar) {}

    alert(type: AlertType, content: string, options?: Partial<Omit<Alert, 'type' | 'content'>>): void {
        const alert: Alert = { type, content, ...options };
        this.snackBar.openFromComponent(AlertComponent, {
            data: alert,
            duration: 5000,
            panelClass: `alert--${type}`,
        });
        this.log(alert);
    }

    error(content: string, options?: Partial<Omit<Alert, 'type' | 'content'>>): void {
        this.alert(AlertType.Error, content, { icon: 'exclamation-circle', ...options });
    }

    warn(content: string, options?: Partial<Omit<Alert, 'type' | 'content'>>): void {
        this.alert(AlertType.Warn, content, { icon: 'exclamation-triangle', ...options });
    }

    success(content: string, options?: Partial<Omit<Alert, 'type' | 'content'>>): void {
        this.alert(AlertType.Success, content, { icon: 'check-circle', ...options });
    }

    info(content: string, options?: Partial<Omit<Alert, 'type' | 'content'>>): void {
        this.alert(AlertType.Info, content, { icon: 'info-circle', ...options });
    }

    private log(alert: Alert): void {
        if (isDevMode()) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let fn: (...data: any[]) => void;

            switch (alert.type) {
                case AlertType.Error:
                    fn = console.error;
                    break;
                case AlertType.Warn:
                    fn = console.warn;
                    break;
                case AlertType.Info:
                    fn = console.info;
                    break;
                case AlertType.Success:
                    fn = console.log;
                    break;
            }

            fn(alert.log ? alert.log : alert.content);
        }
    }
}
