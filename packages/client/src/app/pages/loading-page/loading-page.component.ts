import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-loading-page',
    templateUrl: './loading-page.component.html',
    styleUrls: ['./loading-page.component.scss'],
})
export class LoadingPageComponent {
    @Input() message?: string;
    @Input() isError?: boolean;
    @Input() isLoading: boolean = false;
    @Input() isTrying: boolean = false;
}
