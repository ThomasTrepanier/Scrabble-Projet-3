import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { IconComponent } from '@app/components/icon/icon.component';
import { AnalysisOverviewComponent } from './analysis-overview.component';

export default {
    title: 'Analysis/Result/Overview',
    component: AnalysisOverviewComponent,
    decorators: [
        moduleMetadata({
            declarations: [IconComponent],
            imports: [MatProgressSpinnerModule],
        }),
    ],
} as Meta;

export const primary: Story<AnalysisOverviewComponent> = (props: AnalysisOverviewComponent) => ({ props });

primary.args = {
    amount: 10,
    total: 25,
    size: 125,
};

export const hundredPercent = primary.bind({});

hundredPercent.args = {
    amount: 25,
    total: 25,
    size: 125,
};

export const lost = primary.bind({});

lost.args = {
    amount: -1,
    total: 25,
    size: 125,
};
