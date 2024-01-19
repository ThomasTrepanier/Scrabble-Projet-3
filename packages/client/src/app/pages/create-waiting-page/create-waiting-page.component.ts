import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { UserRequest } from '@app/classes/communication/group-request';
import { Timer } from '@app/classes/round/timer';
import { ERROR_SNACK_BAR_CONFIG } from '@app/constants/components-constants';
import { getRandomFact } from '@app/constants/fun-facts-scrabble-constants';
import { DEFAULT_GROUP, DEFAULT_TIMER_STRING } from '@app/constants/pages-constants';
import { ROUTE_GAME_CREATION } from '@app/constants/routes-constants';
import { GameDispatcherService } from '@app/services/';
import { GameVisibility } from '@common/models/game-visibility';
import { Group } from '@common/models/group';
import { RequestingUsers } from '@common/models/requesting-users';
import { PublicUser } from '@common/models/user';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-create-waiting-page',
    templateUrl: './create-waiting-page.component.html',
    styleUrls: ['./create-waiting-page.component.scss'],
})
export class CreateWaitingPageComponent implements OnInit, OnDestroy {
    requestingUsers: RequestingUsers = { requestingObservers: [], requestingPlayers: [] };

    isGroupEmpty: boolean = true;
    isGroupFull: boolean = false;
    isGamePrivate: boolean = false;
    roundTime: string = DEFAULT_TIMER_STRING;
    currentGroup: Group = DEFAULT_GROUP;
    funFact: string = '';

    private isStartingGame: boolean = false;
    private componentDestroyed$: Subject<boolean> = new Subject();

    constructor(
        public dialog: MatDialog,
        public gameDispatcherService: GameDispatcherService,
        public router: Router,
        private snackBar: MatSnackBar,
    ) {}

    @HostListener('window:beforeunload')
    ngOnDestroy(): void {
        this.componentDestroyed$.next(true);
        this.componentDestroyed$.complete();
        if (!this.isStartingGame) this.gameDispatcherService.handleCancelGame();
    }

    ngOnInit(): void {
        this.currentGroup = this.gameDispatcherService.currentGroup ?? DEFAULT_GROUP;
        this.isGamePrivate = this.currentGroup.gameVisibility === GameVisibility.Private;
        const roundTime: Timer = Timer.convertTime(this.currentGroup.maxRoundTime);
        this.roundTime = `${roundTime.minutes}:${roundTime.getTimerSecondsPadded()}`;
        this.funFact = getRandomFact();

        this.gameDispatcherService.subscribeToJoinRequestEvent(this.componentDestroyed$, (requestingUsers: RequestingUsers) =>
            this.updateRequestingUsers(requestingUsers),
        );
        this.gameDispatcherService.subscribeToPlayerCancelledRequestEvent(this.componentDestroyed$, (requestingUsers: RequestingUsers) =>
            this.updateRequestingUsers(requestingUsers),
        );
        this.gameDispatcherService.subscribeToPlayerLeftGroupEvent(this.componentDestroyed$, (group: Group) => this.updateGroup(group));
        this.gameDispatcherService.subscribeToPlayerJoinedGroupEvent(this.componentDestroyed$, (group: Group) => this.updateGroup(group));

        this.gameDispatcherService
            .observeGameCreationFailed()
            .pipe(takeUntil(this.componentDestroyed$))
            .subscribe((error: HttpErrorResponse) => this.handleGameCreationFail(error));
    }

    startGame(): void {
        this.isStartingGame = true;
        if (!this.isGroupEmpty) {
            this.gameDispatcherService.handleStart();
        }
    }
    updateGroup(group: Group) {
        this.currentGroup = group;
        this.updateGroupStatus();
    }

    updateRequestingUsers(requestingUsers: RequestingUsers) {
        this.requestingUsers = requestingUsers;
    }

    updateGroupStatus() {
        this.isGroupEmpty = this.currentGroup.user2 === undefined && this.currentGroup.user3 === undefined && this.currentGroup.user4 === undefined;
        this.isGroupFull = this.currentGroup.user2 !== undefined && this.currentGroup.user3 !== undefined && this.currentGroup.user4 !== undefined;
    }

    acceptUser(userRequest: UserRequest): void {
        if (this.isGroupFull && !userRequest.isObserver) return;

        if (!this.removeRequestingUser(userRequest)) return;

        if (userRequest.isObserver) this.currentGroup.numberOfObservers++;
        else {
            if (!this.currentGroup.user2) this.currentGroup.user2 = userRequest.publicUser;
            else if (!this.currentGroup.user3) this.currentGroup.user3 = userRequest.publicUser;
            else if (!this.currentGroup.user4) this.currentGroup.user4 = userRequest.publicUser;

            this.updateGroupStatus();
        }
        this.gameDispatcherService.handleConfirmation(userRequest.publicUser.username);
    }

    rejectUser(userRequest: UserRequest): void {
        if (!this.removeRequestingUser(userRequest)) return;

        this.gameDispatcherService.handleRejection(userRequest.publicUser.username);
    }

    private removeRequestingUser(userRequest: UserRequest): boolean {
        let requestingArray: PublicUser[] = [];
        if (userRequest.isObserver) requestingArray = this.requestingUsers.requestingObservers;
        else requestingArray = this.requestingUsers.requestingPlayers;

        const requestingUsers = requestingArray.filter((user_) => userRequest.publicUser === user_);
        if (requestingUsers.length === 0) return false;
        const requestingUser = requestingUsers[0];
        const index = requestingArray.indexOf(requestingUser);
        requestingArray.splice(index, 1);
        return true;
    }

    private handleGameCreationFail(error: HttpErrorResponse): void {
        this.snackBar.open(error.error.message, 'Fermer', ERROR_SNACK_BAR_CONFIG);
        this.router.navigateByUrl(ROUTE_GAME_CREATION);
    }
}
