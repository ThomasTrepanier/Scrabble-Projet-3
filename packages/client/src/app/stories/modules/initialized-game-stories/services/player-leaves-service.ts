import { Injectable, OnDestroy } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class PlayerLeavesService implements OnDestroy {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    ngOnDestroy(): void {}

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    handleLocalPlayerLeavesGame(): void {}

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    handleLeaveGroup(): void {}
}
