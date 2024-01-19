import { Component, ContentChildren, Input } from '@angular/core';
import { IconButtonComponent } from '@app/components/icon-button/icon-button.component';

@Component({
    selector: 'app-chatbox',
    templateUrl: './chatbox.component.html',
    styleUrls: ['./chatbox.component.scss'],
})
export class ChatBoxComponent {
    @ContentChildren(IconButtonComponent) actionButtons: IconButtonComponent[];
    @Input() title: string;
    @Input() hideIcon: boolean = false;
    @Input() icon: string;
    @Input() icon2?: string;
    @Input() isPrimary: boolean = false;
}
