import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NavigationStart, Router } from '@angular/router';
import { Timer } from '@app/classes/round/timer';
import { DefaultDialogComponent } from '@app/components/default-dialog/default-dialog.component';
import { getRandomFact } from '@app/constants/fun-facts-scrabble-constants';
import { DEFAULT_GROUP, DIALOG_BUTTON_CONTENT_RETURN_GROUP, DIALOG_CANCEL_CONTENT, DIALOG_CANCEL_TITLE } from '@app/constants/pages-constants';
import { ROUTE_GAME, ROUTE_GAME_OBSERVER, ROUTE_GROUPS } from '@app/constants/routes-constants';
import GameDispatcherService from '@app/services/game-dispatcher-service/game-dispatcher.service';
import { PlayerLeavesService } from '@app/services/player-leave-service/player-leave.service';
import { Group } from '@common/models/group';
import { PublicUser } from '@common/models/user';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-waiting-page',
    templateUrl: './join-waiting-page.component.html',
    styleUrls: ['./join-waiting-page.component.scss'],
})
export class JoinWaitingPageComponent implements OnInit, OnDestroy {
    currentGroup: Group;
    funFact: string;
    roundTime: string;

    private componentDestroyed$: Subject<boolean>;

    constructor(
        public dialog: MatDialog,
        public gameDispatcherService: GameDispatcherService,
        private readonly playerLeavesService: PlayerLeavesService,
        public router: Router,
    ) {
        this.componentDestroyed$ = new Subject();
    }

    @HostListener('window:beforeunload')
    onBeforeUnload(): void {
        this.playerLeavesService.handleLeaveGroup();
    }

    ngOnInit(): void {
        this.currentGroup = this.gameDispatcherService.currentGroup ?? DEFAULT_GROUP;
        const roundTime: Timer = Timer.convertTime(this.currentGroup.maxRoundTime);
        this.roundTime = `${roundTime.minutes}:${roundTime.getTimerSecondsPadded()}`;

        this.funFact = getRandomFact();

        this.router.events.pipe(takeUntil(this.componentDestroyed$)).subscribe((event) => {
            if (event instanceof NavigationStart) {
                this.routerChangeMethod(event.url);
            }
        });

        this.gameDispatcherService.subscribeToPlayerJoinedGroupEvent(this.componentDestroyed$, (group: Group) => this.setGroup(group));
        this.gameDispatcherService.subscribeToPlayerLeftGroupEvent(this.componentDestroyed$, (group: Group) => this.setGroup(group));

        this.gameDispatcherService.subscribeToCanceledGameEvent(this.componentDestroyed$, (hostUser: PublicUser) =>
            this.hostHasCanceled(hostUser.username),
        );
    }

    ngOnDestroy(): void {
        this.componentDestroyed$.next(true);
        this.componentDestroyed$.complete();
    }

    private setGroup(group: Group) {
        this.currentGroup = group;
    }

    private routerChangeMethod(url: string): void {
        if (url !== ROUTE_GAME && url !== ROUTE_GAME_OBSERVER) {
            this.playerLeavesService.handleLeaveGroup();
        }
    }

    private hostHasCanceled(hostName: string): void {
        const dialogRef = this.dialog.open(DefaultDialogComponent, {
            data: {
                title: DIALOG_CANCEL_TITLE,
                content: hostName + DIALOG_CANCEL_CONTENT,
                buttons: [
                    {
                        content: DIALOG_BUTTON_CONTENT_RETURN_GROUP,
                        redirect: ROUTE_GROUPS,
                        closeDialog: true,
                    },
                ],
            },
        });
        dialogRef.backdropClick().subscribe(() => {
            this.router.navigateByUrl(ROUTE_GROUPS);
        });
    }
}
