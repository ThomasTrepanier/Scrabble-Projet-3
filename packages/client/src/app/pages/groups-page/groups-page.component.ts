import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GroupRequest } from '@app/classes/communication/group-request';
import { DefaultDialogComponent } from '@app/components/default-dialog/default-dialog.component';
import { GroupPasswordDialogComponent } from '@app/components/group-password-waiting-dialog/group-password-waiting-dialog';
import { GroupRequestWaitingDialogComponent } from '@app/components/group-request-waiting-dialog/group-request-waiting-dialog';
import { NO_GROUP_CAN_BE_JOINED } from '@app/constants/component-errors';
import { DIALOG_BUTTON_CONTENT_RETURN_GROUP, DIALOG_FULL_CONTENT, DIALOG_FULL_TITLE } from '@app/constants/pages-constants';
import { GameDispatcherService } from '@app/services/';
import { GameVisibility } from '@common/models/game-visibility';
import { Group } from '@common/models/group';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-groups-page',
    templateUrl: './groups-page.component.html',
    styleUrls: ['./groups-page.component.scss'],
})
export class GroupsPageComponent implements OnInit, OnDestroy {
    groups: Group[];
    private componentDestroyed$: Subject<boolean>;

    constructor(public gameDispatcherService: GameDispatcherService, public dialog: MatDialog, private snackBar: MatSnackBar) {
        this.groups = [];
        this.componentDestroyed$ = new Subject();
    }

    ngOnInit(): void {
        this.gameDispatcherService.subscribeToGroupsUpdateEvent(this.componentDestroyed$, (groups: Group[]) => this.updateGroups(groups));
        this.gameDispatcherService.subscribeToGroupFullEvent(this.componentDestroyed$, () => this.groupFullDialog());
        this.gameDispatcherService.handleGroupListRequest();
    }

    ngOnDestroy(): void {
        this.componentDestroyed$.next(true);
        this.componentDestroyed$.complete();
    }

    joinGroup(groupRequest: GroupRequest): void {
        const wantedGroup = this.groups.filter((group) => group.groupId === groupRequest.groupId)[0];

        switch (wantedGroup.gameVisibility) {
            case GameVisibility.Private: {
                this.gameDispatcherService.handleJoinGroup(wantedGroup, groupRequest.isObserver);
                this.groupRequestWaitingDialog(wantedGroup);
                break;
            }
            case GameVisibility.Protected: {
                this.gameDispatcherService.handleGroupUpdates(wantedGroup, groupRequest.isObserver);
                this.groupPasswordDialog(wantedGroup, groupRequest.isObserver);
                break;
            }
            case GameVisibility.Public: {
                this.gameDispatcherService.handleJoinGroup(wantedGroup, groupRequest.isObserver);
                break;
            }
            // No default
        }
    }

    joinRandomGroup(): void {
        try {
            const group = this.getRandomGroup();
            this.joinGroup({ groupId: group.groupId, isObserver: false });
        } catch (exception) {
            this.snackBar.open((exception as Error).toString(), 'Ok', {
                duration: 3000,
            });
        }
    }

    private updateGroups(groups: Group[]): void {
        this.groups = groups;
    }

    private groupFullDialog(): void {
        this.dialog.open(DefaultDialogComponent, {
            data: {
                title: DIALOG_FULL_TITLE,
                content: DIALOG_FULL_CONTENT,
                buttons: [
                    {
                        content: DIALOG_BUTTON_CONTENT_RETURN_GROUP,
                        closeDialog: true,
                    },
                ],
            },
        });
    }

    private groupPasswordDialog(group: Group, isObserver: boolean): void {
        const dialogRef = this.dialog.open(GroupPasswordDialogComponent, {
            data: {
                group,
                isObserver,
            },
        });

        dialogRef.afterClosed().subscribe(() => {
            this.gameDispatcherService.handleGroupListRequest();
        });
    }

    private groupRequestWaitingDialog(group: Group): void {
        const dialogRef = this.dialog.open(GroupRequestWaitingDialogComponent, {
            data: {
                group,
            },
        });

        dialogRef.afterClosed().subscribe(() => {
            this.gameDispatcherService.handleGroupListRequest();
        });
    }

    private getRandomGroup(): Group {
        const filteredGroups = this.groups.filter((group) => group.user2 === undefined || group.user3 === undefined || group.user4 === undefined);
        if (filteredGroups.length === 0) throw new Error(NO_GROUP_CAN_BE_JOINED);
        return filteredGroups[Math.floor(Math.random() * filteredGroups.length)];
    }
}
