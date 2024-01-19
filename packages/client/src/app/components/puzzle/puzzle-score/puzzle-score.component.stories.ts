import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { PuzzleScoreComponent } from '@app/components/puzzle/puzzle-score/puzzle-score.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { IconComponent } from '@app/components/icon/icon.component';

export default {
    title: 'Puzzle/Result/Score',
    component: PuzzleScoreComponent,
    decorators: [
        moduleMetadata({
            declarations: [IconComponent],
            imports: [MatProgressSpinnerModule],
        }),
    ],
} as Meta;

export const primary: Story<PuzzleScoreComponent> = (props: PuzzleScoreComponent) => ({ props });

primary.args = {
    score: 10,
    total: 25,
    size: 125,
};

export const hundredPercent = primary.bind({});

hundredPercent.args = {
    score: 25,
    total: 25,
    size: 125,
};

export const lost = primary.bind({});

lost.args = {
    score: -1,
    total: 25,
    size: 125,
    color: 'warn',
    icon: 'times',
};
