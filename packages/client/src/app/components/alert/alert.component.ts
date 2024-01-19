import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { Alert } from '@app/classes/alert/alert';

@Component({
    selector: 'app-alert',
    templateUrl: './alert.component.html',
    styleUrls: ['./alert.component.scss'],
})
export class AlertComponent {
    constructor(@Inject(MAT_SNACK_BAR_DATA) public data: Alert) {}
}
