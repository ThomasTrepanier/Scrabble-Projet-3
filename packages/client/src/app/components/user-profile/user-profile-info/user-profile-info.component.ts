import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-user-profile-info',
    templateUrl: './user-profile-info.component.html',
    styleUrls: ['./user-profile-info.component.scss'],
})
export class UserProfileInfoComponent {
    @Input() avatar?: string;
    @Input() username?: string;
    @Input() email?: string;
}
