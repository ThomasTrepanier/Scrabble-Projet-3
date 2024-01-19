import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { ChatBoxComponent } from '@app/components/chatbox/chatbox.component';
import { ChatboxContainerComponent } from './chatbox-container.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { IconComponent } from '@app/components/icon/icon.component';
import { MatButtonModule } from '@angular/material/button';
import { ChatboxMessageComponent } from '@app/components/chatbox-message/chatbox-message.component';
import { IconButtonComponent } from '@app/components/icon-button/icon-button.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ClientChannel } from '@app/classes/chat/channel';

export default {
    title: 'Chatbox/Container',
    component: ChatboxContainerComponent,
    decorators: [
        moduleMetadata({
            declarations: [ChatBoxComponent, ChatboxMessageComponent, IconComponent, IconButtonComponent],
            imports: [ReactiveFormsModule, MatButtonModule, MatDialogModule],
            providers: [FormBuilder],
        }),
    ],
} as Meta;

const template: Story<ChatboxContainerComponent> = (args: ChatboxContainerComponent) => ({
    props: args,
});

export const primary = template.bind({});

const channels: ClientChannel[] = [
    {
        id: '1',
        name: 'Chat 1',
        canQuit: true,
        messages: [
            {
                sender: { username: 'John', avatar: 'https://placedog.net/50', email: '' },
                content: 'Bonjour!',
                date: new Date(),
            },
        ],
    },
    {
        id: '2',
        name: 'Chat 2',
        canQuit: true,
        messages: [],
    },
];

primary.args = {
    channels,
    openedChannels: [channels[0]],
    channelMenuIsOpen: true,
};

export const withVeryLongName = template.bind({});

withVeryLongName.args = {
    channels: [
        {
            id: '1',
            name: 'Very long channel name that never finishes because why not',
            canQuit: true,
            messages: [],
        },
    ],
};
