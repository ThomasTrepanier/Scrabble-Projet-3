import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ClientChannel, ViewClientChannel } from '@app/classes/chat/channel';
import { DefaultDialogComponent } from '@app/components/default-dialog/default-dialog.component';
import {
    CHANNEL_NAME_MAX_LENGTH,
    CONFIRM_DELETE_CHANNEL,
    CONFIRM_DELETE_DIALOG_TITLE,
    CONFIRM_QUIT_CHANNEL,
    CONFIRM_QUIT_DIALOG_TITLE,
    DELETE,
    GROUP_CHANNEL_NAME,
    MAX_OPEN_CHAT,
    QUIT,
} from '@app/constants/chat-constants';
import { CANCEL } from '@app/constants/components-constants';
import { Channel } from '@common/models/chat/channel';
import { TypeOfId } from '@common/types/id';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-chatbox-container',
    templateUrl: './chatbox-container.component.html',
    styleUrls: ['./chatbox-container.component.scss'],
})
export class ChatboxContainerComponent implements OnDestroy, OnInit {
    @Input() channels: Observable<ClientChannel[]> = new Observable();
    @Input() joinableChannels: Observable<ClientChannel[]> = new Observable();
    @Input() joinedChannel: Observable<ClientChannel> = new Observable();
    @Input() quittedChannel: Observable<ClientChannel> = new Observable();
    @Output() sendMessage: EventEmitter<[Channel, string]> = new EventEmitter();
    @Output() createChannel: EventEmitter<string> = new EventEmitter();
    @Output() joinChannel: EventEmitter<Channel> = new EventEmitter();
    @Output() quitChannel: EventEmitter<Channel> = new EventEmitter();
    @Output() deleteChannel: EventEmitter<Channel> = new EventEmitter();
    @ViewChild('createChannelInput') createChannelInput: ElementRef<HTMLInputElement>;
    @ViewChild('joinChannelInput') joinChannelInput: ElementRef<HTMLInputElement>;
    createChannelForm: FormGroup;
    joinChannelForm: FormGroup;
    openedChannels: BehaviorSubject<TypeOfId<Channel>[]>;
    channelMenuIsOpen: boolean = false;
    channelNameMaxLength: number = CHANNEL_NAME_MAX_LENGTH;
    private componentDestroyed$: Subject<boolean> = new Subject<boolean>();

    constructor(private readonly formBuilder: FormBuilder, private readonly dialog: MatDialog) {
        this.openedChannels = new BehaviorSubject<TypeOfId<Channel>[]>([]);

        this.createChannelForm = this.formBuilder.group({
            createChannel: new FormControl(''),
        });
    }

    get createChannelField(): FormControl {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.createChannelForm.get('createChannel')! as FormControl;
    }

    getOpenedChannels(): Observable<ClientChannel[]> {
        return combineLatest([this.channels, this.openedChannels]).pipe(
            map(([channels, openedChannels]) => channels.filter((channel) => openedChannels.includes(channel.idChannel))),
        );
    }

    ngOnInit(): void {
        this.joinedChannel.pipe(takeUntil(this.componentDestroyed$)).subscribe((channel) => {
            if (!channel) return;
            if (this.channelMenuIsOpen || channel.name === GROUP_CHANNEL_NAME) this.showChannel(channel);
        });

        this.quittedChannel.pipe(takeUntil(this.componentDestroyed$)).subscribe((channel) => {
            if (!channel) return;
            this.minimizeChannel(channel);
        });
    }

    ngOnDestroy(): void {
        this.componentDestroyed$.next(false);
        this.componentDestroyed$.complete();
    }

    getChannelsForMenu(): Observable<ViewClientChannel[]> {
        const channelName: string = this.createChannelField.value;

        return combineLatest([this.channels, this.openedChannels]).pipe(
            map(([channels, openedChannels]) =>
                channels
                    .filter((channel) => channel.name.toLowerCase().startsWith(channelName.trim().toLowerCase()))
                    .map((channel) => ({ ...channel, canOpen: !openedChannels.find((id) => channel.idChannel === id) })),
            ),
        );
    }

    getJoinableChannelsForMenu(): Observable<ViewClientChannel[]> {
        const channelName: string = this.createChannelField.value;

        return combineLatest([this.joinableChannels, this.openedChannels]).pipe(
            map(([joinableChannels, openedChannels]) =>
                joinableChannels
                    .filter((channel) => channel.name.toLowerCase().startsWith(channelName.trim().toLowerCase()))
                    .map((channel) => ({
                        ...channel,
                        canOpen: !openedChannels.find((id) => channel.idChannel === id),
                    })),
            ),
        );
    }

    showChannel(channel: ClientChannel): void {
        let openedChannels = this.openedChannels.value;
        openedChannels.push(channel.idChannel);
        openedChannels = openedChannels.slice(-1 * MAX_OPEN_CHAT);

        this.openedChannels.next(openedChannels);

        this.closeMenu();
    }

    minimizeChannel(channel: ClientChannel): void {
        const index = this.openedChannels.value.findIndex((idChannel) => channel.idChannel === idChannel);
        if (index >= 0) {
            const openedChannels = this.openedChannels.value;
            openedChannels.splice(index, 1);
            this.openedChannels.next(openedChannels);
        }
    }

    closeMenu(): void {
        this.createChannelField.setValue('');
        this.channelMenuIsOpen = false;
    }

    toggleMenu(): void {
        this.channelMenuIsOpen = !this.channelMenuIsOpen;

        if (this.channelMenuIsOpen) {
            const openedChannels = this.openedChannels.value;
            this.openedChannels.next(openedChannels.slice(-1));
        }
    }

    handleSendMessage(channel: Channel, content: string): void {
        this.sendMessage.next([channel, content]);
    }

    joinChannelFromMenu(channel: ClientChannel): void {
        this.joinChannel.emit(channel);
        this.showChannel(channel);
    }

    handleCreateChannel(): void {
        if (!this.createChannelForm.valid) return;

        const channelName = this.createChannelForm.value.createChannel.trim();

        if (channelName.length === 0) return;

        this.createChannel.next(channelName);
        this.createChannelForm.reset();
        this.createChannelForm.setValue({ createChannel: '' });
        this.createChannelForm.setErrors({ createChannel: false });
        this.createChannelInput?.nativeElement?.blur();
    }

    handleQuitChannel(channel: ClientChannel): void {
        this.dialog.open(DefaultDialogComponent, {
            data: {
                title: CONFIRM_QUIT_DIALOG_TITLE,
                content: CONFIRM_QUIT_CHANNEL(channel.name),
                buttons: [
                    {
                        content: CANCEL,
                        closeDialog: true,
                        style: 'background-color: rgb(231, 231, 231)',
                    },
                    {
                        content: QUIT,
                        closeDialog: true,
                        style: 'background-color: #FA6B84; color: rgb(0, 0, 0)',
                        action: () => this.quitChannelFromMenu(channel),
                    },
                ],
            },
        });
    }

    handleDeleteChannel(channel: ClientChannel): void {
        this.dialog.open(DefaultDialogComponent, {
            data: {
                title: CONFIRM_DELETE_DIALOG_TITLE,
                content: CONFIRM_DELETE_CHANNEL(channel.name),
                buttons: [
                    {
                        content: CANCEL,
                        closeDialog: true,
                        style: 'background-color: rgb(231, 231, 231)',
                    },
                    {
                        content: DELETE,
                        closeDialog: true,
                        style: 'background-color: #FA6B84; color: rgb(0, 0, 0)',
                        action: () => this.deleteChannelFromMenu(channel),
                    },
                ],
            },
        });
    }

    isGameChannel(channel: ClientChannel): boolean {
        return channel.name === GROUP_CHANNEL_NAME && channel.private === true;
    }

    private quitChannelFromMenu(channel: ClientChannel): void {
        this.minimizeChannel(channel);
        this.quitChannel.emit(channel);
    }

    private deleteChannelFromMenu(channel: ClientChannel): void {
        this.minimizeChannel(channel);
        this.deleteChannel.emit(channel);
    }
}
