import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { IconComponent } from '@app/components/icon/icon.component';
import { UserProfileInfoComponent } from './user-profile-info.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

export default {
    title: 'User/Profile/Info',
    component: UserProfileInfoComponent,
    decorators: [
        moduleMetadata({
            declarations: [IconComponent],
            imports: [MatCardModule, MatButtonModule],
        }),
    ],
} as Meta;

const template: Story<UserProfileInfoComponent> = (args: UserProfileInfoComponent) => ({
    props: args,
    template: `
        <app-user-profile-info [avatar]="avatar" [username]="username" [email]="email">
            <button color="primary" mat-flat-button user-action>
                <app-icon icon="flag" styling="solid"></app-icon>
            </button>
            <button color="primary" mat-flat-button user-action>
                <app-icon icon="user" styling="solid"></app-icon>
            </button>
        </app-user-profile-info>
    `,
});

export const primary = template.bind({});

primary.args = {
    avatar: 'https://ucarecdn.com/7657e43b-572c-4f74-8eca-e5a746a2dce9/',
    username: 'John',
    email: 'john@email.com',
};
