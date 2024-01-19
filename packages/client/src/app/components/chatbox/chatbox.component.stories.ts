// also exported from '@storybook/angular' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/angular/types-6-0';
import { ChatBoxComponent } from './chatbox.component';
import { moduleMetadata } from '@storybook/angular';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { IconComponent } from '@app/components/icon/icon.component';
import { IconButtonComponent } from '@app/components/icon-button/icon-button.component';

export default {
    title: 'Chatbox/Chatbox',
    component: ChatBoxComponent,
    decorators: [
        moduleMetadata({
            declarations: [IconComponent, IconButtonComponent],
            imports: [ReactiveFormsModule],
            providers: [FormBuilder],
        }),
    ],
} as Meta;

export const template: Story<ChatBoxComponent> = (args: ChatBoxComponent) => ({
    props: args,
});

template.args = {
    title: 'Chatbox',
};

export const primary = template.bind({});

primary.args = {
    title: 'Primary chatbox',
    isPrimary: true,
};
