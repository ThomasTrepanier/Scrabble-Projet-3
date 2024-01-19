import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { GroupRequestWaitingDialogComponent } from '@app/components/group-request-waiting-dialog/group-request-waiting-dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { GroupRequestWaitingDialogParameters } from '@app/components/group-request-waiting-dialog/group-request-waiting-dialog.types';
import { GameVisibility } from '@common/models/game-visibility';
import { VirtualPlayerLevel } from '@common/models/virtual-player-level';
import { Subject } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { SrcDirective } from '@app/directives/src-directive/src.directive';
import { IconComponent } from '@app/components/icon/icon.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

const data: GroupRequestWaitingDialogParameters = {
    pageTitle: 'Waiting for host to accept your request',
    group: {
        groupId: '1',
        user1: {
            username: 'user1',
            email: '',
            avatar: 'https://ucarecdn.com/c6307532-10cb-481c-af7f-a9dc73dcf902/',
        },
        maxRoundTime: 60,
        gameVisibility: GameVisibility.Protected,
        virtualPlayerLevel: VirtualPlayerLevel.Beginner,
        password: 'a',
        numberOfObservers: 1,
    },
};

const ref: Partial<MatDialogRef<GroupRequestWaitingDialogComponent>> = {
    backdropClick: () => new Subject(),
};

export default {
    title: 'Group/Request waiting dialog',
    component: GroupRequestWaitingDialogComponent,
    decorators: [
        moduleMetadata({
            declarations: [SrcDirective, IconComponent],
            imports: [
                HttpClientTestingModule,
                MatSnackBarModule,
                RouterTestingModule,
                MatDialogModule,
                MatButtonModule,
                MatChipsModule,
                MatProgressSpinnerModule,
            ],
            providers: [
                { provide: MatDialogRef, useValue: ref },
                { provide: MAT_DIALOG_DATA, useValue: data },
            ],
        }),
    ],
} as Meta;

export const primary: Story<GroupRequestWaitingDialogComponent> = (props: GroupRequestWaitingDialogComponent) => ({ props });
