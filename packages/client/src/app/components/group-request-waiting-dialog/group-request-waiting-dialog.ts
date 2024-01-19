import { Component, HostListener, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router, NavigationStart } from '@angular/router';
import { Timer } from '@app/classes/round/timer';
import { GameDispatcherService } from '@app/services';
import { Group } from '@common/models/group';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GroupRequestWaitingDialogParameters } from './group-request-waiting-dialog.types';
import { PlayerLeavesService } from '@app/services/player-leave-service/player-leave.service';
import { ROUTE_JOIN_WAITING } from '@app/constants/routes-constants';
import { RequestState } from '@app/classes/states/request-state';

@Component({
    selector: 'app-group-request-waiting-dialog',
    templateUrl: 'group-request-waiting-dialog.html',
    styleUrls: ['group-request-waiting-dialog.scss'],
})
export class GroupRequestWaitingDialogComponent implements OnInit, OnDestroy {
    requestedGroup: Group;
    roundTime: string;
    state: RequestState = RequestState.Ready;
    private componentDestroyed$: Subject<boolean>;
    constructor(
        public gameDispatcherService: GameDispatcherService,
        public router: Router,
        private readonly playerLeavesService: PlayerLeavesService,
        private dialogRef: MatDialogRef<GroupRequestWaitingDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: GroupRequestWaitingDialogParameters,
    ) {
        this.requestedGroup = data.group;
        dialogRef.backdropClick().subscribe(() => {
            this.closeDialog();
        });
    }

    @HostListener('window:beforeunload')
    onBeforeUnload(): void {
        this.playerLeavesService.handleLeaveGroup();
    }

    ngOnInit(): void {
        this.componentDestroyed$ = new Subject();
        const roundTime: Timer = Timer.convertTime(this.requestedGroup.maxRoundTime);
        this.roundTime = `${roundTime.minutes}:${roundTime.getTimerSecondsPadded()}`;
        this.router.events.pipe(takeUntil(this.componentDestroyed$)).subscribe((event) => {
            if (event instanceof NavigationStart) {
                this.routerChangeMethod(event.url);
            }
        });

        this.gameDispatcherService.subscribeToCanceledGameEvent(this.componentDestroyed$, (/* hostUser: PublicUser*/) => this.gameCanceled());
        this.gameDispatcherService.subscribeToJoinerRejectedEvent(this.componentDestroyed$, (/* hostUser: PublicUser*/) => this.playerRejected());
        this.gameDispatcherService.subscribeToPlayerJoinedGroupEvent(this.componentDestroyed$, (group: Group) => this.playerAccepted(group));
    }

    ngOnDestroy(): void {
        this.componentDestroyed$.next(true);
        this.componentDestroyed$.complete();
    }

    closeDialog(): void {
        this.playerLeavesService.handleLeaveGroup();
        this.dialogRef.close();
    }

    getTitle(): string {
        switch (this.state) {
            case RequestState.Ready:
                return 'En attente de la réponse du créateur';
            case RequestState.Invalid:
                return 'Vous avez été refusé par le créateur';
            case RequestState.Canceled:
                return 'La partie a été annulée';
            default:
                return '';
        }
    }

    private routerChangeMethod(url: string): void {
        if (url !== ROUTE_JOIN_WAITING) {
            this.playerLeavesService.handleLeaveGroup();
        }
    }

    private playerAccepted(group: Group): void {
        this.gameDispatcherService.currentGroup = group;
        this.dialogRef.close();
        this.router.navigateByUrl(ROUTE_JOIN_WAITING);
    }

    private playerRejected(): void {
        this.state = RequestState.Invalid;
    }

    private gameCanceled(): void {
        this.state = RequestState.Canceled;
    }
}
