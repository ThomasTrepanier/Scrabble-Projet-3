import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { InitializeGameData } from '@app/classes/communication/game-config';
import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';
import { ROUTE_CREATE_WAITING, ROUTE_JOIN_WAITING } from '@app/constants/routes-constants';
import { GameDispatcherController } from '@app/controllers/game-dispatcher-controller/game-dispatcher.controller';
import GameService from '@app/services/game-service/game.service';
import { GameViewEventManagerService } from '@app/services/game-view-event-manager-service/game-view-event-manager.service';
import { UserService } from '@app/services/user-service/user.service';
import { GameVisibility } from '@common/models/game-visibility';
import { Group, GroupData } from '@common/models/group';
import { RequestingUsers } from '@common/models/requesting-users';
import { PublicUser } from '@common/models/user';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export default class GameDispatcherService implements OnDestroy {
    currentGroup: Group | undefined = undefined;
    isObserver: boolean | undefined = undefined;

    private gameCreationFailed$: Subject<HttpErrorResponse> = new Subject();
    private joinRequestEvent: Subject<RequestingUsers> = new Subject();
    private playerJoinedGroupEvent: Subject<Group> = new Subject();
    private playerLeftGroupEvent: Subject<Group> = new Subject();
    private canceledGameEvent: Subject<PublicUser> = new Subject();
    private groupFullEvent: Subject<void> = new Subject();
    private invalidPasswordEvent: Subject<void> = new Subject();
    private groupsUpdateEvent: Subject<Group[]> = new Subject();
    private joinerRejectedEvent: Subject<PublicUser> = new Subject();
    private playerCancelledRequestEvent: Subject<RequestingUsers> = new Subject();
    private serviceDestroyed$: Subject<boolean> = new Subject();

    constructor(
        private gameDispatcherController: GameDispatcherController,
        public router: Router,
        private readonly gameService: GameService,
        private readonly gameViewEventManagerService: GameViewEventManagerService,
        private readonly userService: UserService,
    ) {
        this.gameDispatcherController.subscribeToJoinRequestEvent(this.serviceDestroyed$, (requestingUsers: RequestingUsers) =>
            this.handleJoinRequest(requestingUsers),
        );
        this.gameDispatcherController.subscribeToPlayerJoinedGroupEvent(this.serviceDestroyed$, (group: Group) =>
            this.handlePlayerJoinedRequest(group),
        );
        this.gameDispatcherController.subscribeToPlayerLeftGroupEvent(this.serviceDestroyed$, (group: Group) => this.handlePlayerLeftRequest(group));
        this.gameDispatcherController.subscribeToPlayerCancelledRequestingEvent(this.serviceDestroyed$, (requestingUsers: RequestingUsers) =>
            this.handlePlayerCancelledRequest(requestingUsers),
        );
        this.gameDispatcherController.subscribeToGroupFullEvent(this.serviceDestroyed$, () => this.handleGroupFull());
        this.gameDispatcherController.subscribeToInvalidPasswordEvent(this.serviceDestroyed$, () => this.handleInvalidPassword());
        this.gameDispatcherController.subscribeToGroupRequestValidEvent(this.serviceDestroyed$, async () => {
            if (this.currentGroup?.gameVisibility === GameVisibility.Public || this.currentGroup?.gameVisibility === GameVisibility.Protected) {
                this.router.navigateByUrl(ROUTE_JOIN_WAITING);
            }
        });
        this.gameDispatcherController.subscribeToCanceledGameEvent(this.serviceDestroyed$, (hostUser: PublicUser) =>
            this.handleCanceledGame(hostUser),
        );
        this.gameDispatcherController.subscribeToJoinerRejectedEvent(this.serviceDestroyed$, (hostUser: PublicUser) =>
            this.handleJoinerRejected(hostUser),
        );
        this.gameDispatcherController.subscribeToGroupsUpdateEvent(this.serviceDestroyed$, (groups: Group[]) => this.handleGroupsUpdate(groups));
        this.gameDispatcherController.subscribeToInitializeGame(
            this.serviceDestroyed$,
            async (initializeValue: InitializeGameData | undefined) =>
                await this.gameService.handleInitializeGame(initializeValue, this.isObserver ?? false),
        );
        this.gameDispatcherController.subscribeToReplaceVirtualPlayer(
            this.serviceDestroyed$,
            async (initializeValue: InitializeGameData | undefined) => {
                this.isObserver = false;
                await this.gameService.handleReplaceVirtualPlayer(initializeValue);
            },
        );

        this.gameViewEventManagerService.subscribeToGameViewEvent('resetServices', this.serviceDestroyed$, () => this.resetServiceData());
    }

    ngOnDestroy(): void {
        this.serviceDestroyed$.next(true);
        this.serviceDestroyed$.complete();
    }

    getCurrentGroupId(): string {
        return !this.currentGroup ? '' : this.currentGroup.groupId;
    }

    resetServiceData(): void {
        this.currentGroup = undefined;
        this.isObserver = undefined;
    }

    handleJoinGroup(group: Group, isObserver: boolean, password: string = ''): void {
        this.currentGroup = group;
        this.isObserver = isObserver;
        this.gameDispatcherController.handleGroupJoinRequest(this.getCurrentGroupId(), isObserver, password);
    }

    handleGroupUpdates(group: Group, isObserver: boolean): void {
        this.currentGroup = group;
        this.isObserver = isObserver;
        this.gameDispatcherController.handleGroupUpdatesRequest(this.getCurrentGroupId(), isObserver);
    }

    handleGroupListRequest(): void {
        this.gameDispatcherController.handleGroupsListRequest();
    }

    handleCreateGame(gameParameters: FormGroup): void {
        const gameConfig: GroupData = {
            user1: this.userService.getUser(),
            numberOfObservers: 0,
            maxRoundTime: gameParameters.get('timer')?.value as number,
            virtualPlayerLevel: gameParameters.get('level')?.value as VirtualPlayerLevel,
            gameVisibility: gameParameters.get('visibility')?.value as GameVisibility,
            password:
                (gameParameters.get('visibility')?.value as GameVisibility) === GameVisibility.Protected
                    ? (gameParameters.get('password')?.value as string)
                    : '',
        };
        this.handleGameCreation(gameConfig);
    }

    // TODO: See if this is still useful
    // handleRecreateGame(gameParameters?: FormGroup): void {
    //     if (!this.currentGroup) return;
    //     if (!gameParameters) return;

    //     const groupData: GroupData = {
    //         user1: this.userService.getUser(),
    //         maxRoundTime: this.currentGroup?.maxRoundTime,
    //         // TODO: Change this when implementing different modes
    //         gameVisibility: GameVisibility.Private,
    //         virtualPlayerLevel: gameParameters.get('level')?.value as VirtualPlayerLevel,
    //     };

    //     this.handleGameCreation(groupData);
    // }

    handleCancelGame(mustResetData: boolean = true): void {
        if (this.getCurrentGroupId()) this.gameDispatcherController.handleCancelGame(this.getCurrentGroupId());
        if (mustResetData) this.resetServiceData();
    }

    handleConfirmation(opponentName: string): void {
        if (this.getCurrentGroupId())
            this.gameDispatcherController
                .handleConfirmationGameCreation(opponentName, this.getCurrentGroupId())
                .subscribe({ next: undefined, error: (error: HttpErrorResponse) => this.gameCreationFailed$.next(error) });
    }

    handleStart(): void {
        if (this.getCurrentGroupId())
            this.gameDispatcherController
                .handleStartGame(this.getCurrentGroupId())
                .subscribe({ next: undefined, error: (error: HttpErrorResponse) => this.gameCreationFailed$.next(error) });
    }

    handleRejection(opponentName: string): void {
        if (this.getCurrentGroupId()) this.gameDispatcherController.handleRejectionGameCreation(opponentName, this.getCurrentGroupId());
    }

    subscribeToJoinRequestEvent(componentDestroyed$: Subject<boolean>, callback: (requestingUsers: RequestingUsers) => void): void {
        this.joinRequestEvent.pipe(takeUntil(componentDestroyed$)).subscribe(callback);
    }

    subscribeToPlayerJoinedGroupEvent(componentDestroyed$: Subject<boolean>, callback: (group: Group) => void): void {
        this.playerJoinedGroupEvent.pipe(takeUntil(componentDestroyed$)).subscribe(callback);
    }

    subscribeToPlayerLeftGroupEvent(componentDestroyed$: Subject<boolean>, callback: (group: Group) => void): void {
        this.playerLeftGroupEvent.pipe(takeUntil(componentDestroyed$)).subscribe(callback);
    }

    subscribeToPlayerCancelledRequestEvent(componentDestroyed$: Subject<boolean>, callback: (requestingUsers: RequestingUsers) => void): void {
        this.playerCancelledRequestEvent.pipe(takeUntil(componentDestroyed$)).subscribe(callback);
    }

    subscribeToCanceledGameEvent(componentDestroyed$: Subject<boolean>, callback: (hostUser: PublicUser) => void): void {
        this.canceledGameEvent.pipe(takeUntil(componentDestroyed$)).subscribe(callback);
    }

    subscribeToGroupFullEvent(componentDestroyed$: Subject<boolean>, callback: () => void): void {
        this.groupFullEvent.pipe(takeUntil(componentDestroyed$)).subscribe(callback);
    }

    subscribeToInvalidPasswordEvent(componentDestroyed$: Subject<boolean>, callback: () => void): void {
        this.invalidPasswordEvent.pipe(takeUntil(componentDestroyed$)).subscribe(callback);
    }

    subscribeToGroupsUpdateEvent(componentDestroyed$: Subject<boolean>, callback: (groups: Group[]) => void): void {
        this.groupsUpdateEvent.pipe(takeUntil(componentDestroyed$)).subscribe(callback);
    }

    subscribeToJoinerRejectedEvent(componentDestroyed$: Subject<boolean>, callback: (hostUser: PublicUser) => void): void {
        this.joinerRejectedEvent.pipe(takeUntil(componentDestroyed$)).subscribe(callback);
    }

    observeGameCreationFailed(): Observable<HttpErrorResponse> {
        return this.gameCreationFailed$.asObservable();
    }

    private handleGameCreation(groupData: GroupData): void {
        this.gameDispatcherController.handleGameCreation(groupData).subscribe(
            (response) => {
                this.currentGroup = response.group;
                if (this.currentGroup) {
                    this.router.navigateByUrl(ROUTE_CREATE_WAITING);
                }
            },
            (error: HttpErrorResponse) => {
                this.gameCreationFailed$.next(error);
            },
        );
    }

    private handleJoinRequest(requestingUsers: RequestingUsers): void {
        this.joinRequestEvent.next(requestingUsers);
    }

    private handlePlayerJoinedRequest(group: Group): void {
        this.playerJoinedGroupEvent.next(group);
    }

    private handlePlayerLeftRequest(group: Group): void {
        this.playerLeftGroupEvent.next(group);
    }

    private handlePlayerCancelledRequest(requestingUsers: RequestingUsers): void {
        this.playerCancelledRequestEvent.next(requestingUsers);
    }

    private handleJoinerRejected(hostUser: PublicUser): void {
        this.joinerRejectedEvent.next(hostUser);
        this.resetServiceData();
    }

    private handleGroupsUpdate(groups: Group[]): void {
        this.groupsUpdateEvent.next(groups);
    }

    private handleGroupFull(): void {
        this.groupFullEvent.next();
        this.resetServiceData();
    }

    private handleInvalidPassword(): void {
        this.invalidPasswordEvent.next();
    }

    private handleCanceledGame(hostUser: PublicUser): void {
        this.canceledGameEvent.next(hostUser);
        this.resetServiceData();
    }
}
