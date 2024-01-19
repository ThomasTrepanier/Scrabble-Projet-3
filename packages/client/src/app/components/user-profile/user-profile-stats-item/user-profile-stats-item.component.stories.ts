import { IconComponent } from '@app/components/icon/icon.component';
import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { UserProfileStatsItemComponent } from './user-profile-stats-item.component';

export default {
    title: 'User/Profile/Stats item',
    component: UserProfileStatsItemComponent,
    decorators: [
        moduleMetadata({
            declarations: [IconComponent],
        }),
    ],
} as Meta;

export const primary: Story<UserProfileStatsItemComponent> = (args: UserProfileStatsItemComponent) => ({ props: args });

primary.args = {
    title: 'Statistic',
    value: '52',
};

export const withIcon: Story<UserProfileStatsItemComponent> = (args: UserProfileStatsItemComponent) => ({
    props: args,
    template: `
        <app-user-profile-stats-item [title]="title" [value]="value">
            <app-icon stats-icon icon="flag" styling="solid"></app-icon>
        </app-user-profile-stats-item>
    `,
});

withIcon.args = {
    title: 'Statistic',
    value: '52',
};
