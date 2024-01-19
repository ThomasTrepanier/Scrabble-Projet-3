import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-user-profile-stats-item',
    templateUrl: './user-profile-stats-item.component.html',
    styleUrls: ['./user-profile-stats-item.component.scss'],
})
export class UserProfileStatsItemComponent {
    @Input() title: string;
    @Input() value: string | number;
}
