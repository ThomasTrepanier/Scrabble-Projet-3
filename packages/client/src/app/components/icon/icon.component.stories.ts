// also exported from '@storybook/angular' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/angular/types-6-0';
import { IconComponent } from './icon.component';

export default {
    title: 'Icon',
    component: IconComponent,
} as Meta;

const template: Story<IconComponent> = (args: IconComponent) => ({
    props: args,
});

export const primary = template.bind({});

primary.args = {
    icon: 'flag',
};
