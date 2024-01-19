import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserRequest } from '@app/classes/communication/group-request';
import { PublicUser, UNKOWN_USER } from '@common/models/user';

@Component({
    selector: 'app-requesting-user-container',
    templateUrl: './requesting-user-container.component.html',
    styleUrls: ['./requesting-user-container.component.scss'],
})
export class RequestingUserContainerComponent {
    @Input() requestingUser: PublicUser;
    @Input() isGroupFull: boolean;
    @Input() isObserver: boolean;
    @Output() acceptedUser: EventEmitter<UserRequest>;
    @Output() rejectedUser: EventEmitter<UserRequest>;

    constructor() {
        this.acceptedUser = new EventEmitter<UserRequest>();
        this.rejectedUser = new EventEmitter<UserRequest>();
        this.requestingUser = UNKOWN_USER;
    }
    accept(): void {
        this.acceptedUser.emit({ publicUser: this.requestingUser, isObserver: this.isObserver });
    }

    reject(): void {
        this.rejectedUser.emit({ publicUser: this.requestingUser, isObserver: this.isObserver });
    }
}
