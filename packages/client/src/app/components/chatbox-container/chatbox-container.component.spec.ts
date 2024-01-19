/* eslint-disable dot-notation */
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ClientChannel } from '@app/classes/chat/channel';
import { ChatboxMessageComponent } from '@app/components/chatbox-message/chatbox-message.component';
import { ChatBoxComponent } from '@app/components/chatbox/chatbox.component';
import { IconButtonComponent } from '@app/components/icon-button/icon-button.component';
import { IconComponent } from '@app/components/icon/icon.component';
import { BehaviorSubject, Subject } from 'rxjs';

import { ChatboxContainerComponent } from './chatbox-container.component';

const CHANNEL_1: ClientChannel = {
    idChannel: 1,
    name: '1',
    messages: [],
    canQuit: true,
    private: false,
    default: false,
};

describe('ChatboxContainerComponent', () => {
    let component: ChatboxContainerComponent;
    let fixture: ComponentFixture<ChatboxContainerComponent>;
    let joinedChannel: Subject<ClientChannel>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ReactiveFormsModule, MatDialogModule],
            providers: [FormBuilder],
            declarations: [ChatboxContainerComponent, ChatBoxComponent, ChatboxMessageComponent, IconComponent, IconButtonComponent],
        }).compileComponents();

        joinedChannel = new Subject();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ChatboxContainerComponent);
        component = fixture.componentInstance;
        component.joinedChannel = joinedChannel;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should show channel on joinedChannel if channelMenuIsOpen', fakeAsync(() => {
            const spy = spyOn(component, 'showChannel');
            component.ngOnInit();
            component.channelMenuIsOpen = true;

            joinedChannel.next(CHANNEL_1);

            tick();

            expect(spy).toHaveBeenCalled();
        }));
    });

    describe('ngOnDestroy', () => {
        it('should emit to componentDestroyed$', () => {
            spyOn(component['componentDestroyed$'], 'next');
            component.ngOnDestroy();
            expect(component['componentDestroyed$'].next).toHaveBeenCalled();
        });
    });

    describe('showChannel', () => {
        it('should add an open channel', () => {
            component.showChannel(CHANNEL_1);
            expect(component.openedChannels.value).toHaveSize(1);
        });
    });

    describe('minimizeChannel', () => {
        it('should add an open channel', () => {
            component.openedChannels = new BehaviorSubject([CHANNEL_1.idChannel]);
            component.minimizeChannel(CHANNEL_1);
            expect(component.openedChannels.value).toHaveSize(0);
        });
    });

    describe('closeStartChannel', () => {
        it('should set startChannelIsOpen to false', () => {
            component.channelMenuIsOpen = true;
            component.closeMenu();
            expect(component.channelMenuIsOpen).toBeFalse();
        });
    });

    describe('toggleNewMessage', () => {
        it('should set startChannelIsOpen to false it true', () => {
            component.channelMenuIsOpen = true;
            component.toggleMenu();
            expect(component.channelMenuIsOpen).toBeFalse();
        });

        it('should set startChannelIsOpen to true it false', () => {
            component.channelMenuIsOpen = false;
            component.toggleMenu();
            expect(component.channelMenuIsOpen).toBeTrue();
        });
    });

    describe('handleSendMessage', () => {
        it('should emit to sendMessage', () => {
            spyOn(component.sendMessage, 'next');
            component.handleSendMessage(CHANNEL_1, '');
            expect(component.sendMessage.next).toHaveBeenCalled();
        });
    });

    describe('handleCreateChannel', () => {
        it('should emit to createChannel', () => {
            component.createChannelForm.setValue({ createChannel: 'abc' });
            spyOn(component.createChannel, 'next');
            component.handleCreateChannel();
            expect(component.createChannel.next).toHaveBeenCalled();
        });
    });

    describe('handleQuitChannel', () => {
        it('should open dialog', () => {
            const dialog = TestBed.inject(MatDialog);
            const spy = spyOn(dialog, 'open');

            component.handleQuitChannel(CHANNEL_1);

            expect(spy).toHaveBeenCalled();
        });
    });

    describe('handleDeleteChannel', () => {
        it('should open dialog', () => {
            const dialog = TestBed.inject(MatDialog);
            const spy = spyOn(dialog, 'open');

            component.handleDeleteChannel(CHANNEL_1);

            expect(spy).toHaveBeenCalled();
        });
    });
});
