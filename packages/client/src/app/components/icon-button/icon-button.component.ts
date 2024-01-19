import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: ' app-icon-button',
    templateUrl: './icon-button.component.html',
    styleUrls: ['./icon-button.component.scss'],
})
export class IconButtonComponent {
    @Output() onClick: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();
}
