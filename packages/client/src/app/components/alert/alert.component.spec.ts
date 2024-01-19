import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { Alert, AlertType } from '@app/classes/alert/alert';
import { IconComponent } from '@app/components/icon/icon.component';

import { AlertComponent } from './alert.component';

const ALERT: Alert = {
    type: AlertType.Info,
    content: 'hello',
};

describe('AlertComponent', () => {
    let component: AlertComponent;
    let fixture: ComponentFixture<AlertComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatSnackBarModule],
            declarations: [AlertComponent, IconComponent],
            providers: [{ provide: MAT_SNACK_BAR_DATA, useValue: ALERT }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AlertComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
