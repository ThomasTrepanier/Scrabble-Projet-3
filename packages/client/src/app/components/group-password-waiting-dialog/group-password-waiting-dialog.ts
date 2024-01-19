import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NavigationStart, Router } from '@angular/router';
import { GameDispatcherService } from '@app/services';
import { Group } from '@common/models/group';
import { Subject } from 'rxjs';
import { GroupPasswordDialogParameters } from './group-password-waiting-dialog.types';
import { ROUTE_JOIN_WAITING } from '@app/constants/routes-constants';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NAME_VALIDATION } from '@app/constants/name-validation';
import { RequestState } from '@app/classes/states/request-state';
import { PlayerLeavesService } from '@app/services/player-leave-service/player-leave.service';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-group-password-waiting-dialog',
    templateUrl: 'group-password-waiting-dialog.html',
    styleUrls: ['group-password-waiting-dialog.scss'],
})
export class GroupPasswordDialogComponent implements OnInit, OnDestroy {
    protectedGroup: Group;
    isObserver: boolean;
    state: RequestState = RequestState.Ready;
    passwordForm: FormGroup;
    private componentDestroyed$: Subject<boolean>;
    constructor(
        public gameDispatcherService: GameDispatcherService,
        public router: Router,
        private readonly playerLeavesService: PlayerLeavesService,
        private dialogRef: MatDialogRef<GroupPasswordDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: GroupPasswordDialogParameters,
    ) {
        this.protectedGroup = data.group;
        this.isObserver = data.isObserver;
        dialogRef.backdropClick().subscribe(() => {
            this.closeDialog();
        });
    }

    ngOnInit(): void {
        this.componentDestroyed$ = new Subject();
        this.passwordForm = new FormGroup({
            password: new FormControl('', [
                Validators.required,
                Validators.minLength(NAME_VALIDATION.minLength),
                Validators.maxLength(NAME_VALIDATION.maxLength),
                Validators.pattern(NAME_VALIDATION.rule),
            ]),
        });

        this.router.events.pipe(takeUntil(this.componentDestroyed$)).subscribe((event) => {
            if (event instanceof NavigationStart) {
                this.routerChangeMethod(event.url);
            }
        });

        this.gameDispatcherService.subscribeToCanceledGameEvent(this.componentDestroyed$, (/* hostUser: PublicUser*/) => this.groupCanceled());
        this.gameDispatcherService.subscribeToPlayerJoinedGroupEvent(this.componentDestroyed$, (group: Group) => this.playerAccepted(group));
        this.gameDispatcherService.subscribeToGroupFullEvent(this.componentDestroyed$, () => this.groupFull());
        this.gameDispatcherService.subscribeToInvalidPasswordEvent(this.componentDestroyed$, () => this.invalidPassword());
        this.gameDispatcherService.subscribeToJoinerRejectedEvent(this.componentDestroyed$, (/* hostUser: PublicUser*/) => this.gameStarted());
    }

    ngOnDestroy(): void {
        this.componentDestroyed$.next(true);
        this.componentDestroyed$.complete();
    }

    closeDialog(): void {
        this.playerLeavesService.handleLeaveGroup();
        this.dialogRef.close();
    }

    groupFull(): void {
        this.state = RequestState.Full;
    }

    groupCanceled(): void {
        this.state = RequestState.Canceled;
    }

    invalidPassword(): void {
        this.state = RequestState.Invalid;
    }

    gameStarted(): void {
        this.state = RequestState.Started;
    }

    isFormValid(): boolean {
        return this.passwordForm.valid;
    }

    sendRequest(): void {
        if (this.isFormValid()) {
            this.state = RequestState.Waiting;
            this.gameDispatcherService.handleJoinGroup(this.protectedGroup, this.isObserver, this.passwordForm?.get('password')?.value);
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
}
