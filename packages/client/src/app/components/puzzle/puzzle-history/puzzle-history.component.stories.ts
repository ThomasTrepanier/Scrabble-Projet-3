import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { PuzzleHistoryComponent } from '@app/components/puzzle/puzzle-history/puzzle-history.component';
import { PuzzleResultStatus } from '@common/models/puzzle';
import { ScoredWordPlacement } from '@common/models/word-finding';

export default {
    title: 'Puzzle/History',
    component: PuzzleHistoryComponent,
    decorators: [
        moduleMetadata({
            declarations: [],
            imports: [],
        }),
    ],
} as Meta;

export const primary: Story<PuzzleHistoryComponent> = (props: PuzzleHistoryComponent) => ({ props });

primary.args = {
    results: [
        {
            result: PuzzleResultStatus.Won,
            userPoints: 10,
            targetPlacement: {
                score: 10,
            } as ScoredWordPlacement,
            allPlacements: [],
        },
        {
            result: PuzzleResultStatus.Invalid,
            userPoints: -1,
            targetPlacement: {
                score: 10,
            } as ScoredWordPlacement,
            allPlacements: [],
        },
        {
            result: PuzzleResultStatus.Valid,
            userPoints: 5,
            targetPlacement: {
                score: 12,
            } as ScoredWordPlacement,
            allPlacements: [],
        },
        {
            result: PuzzleResultStatus.Abandoned,
            userPoints: 10,
            targetPlacement: {
                score: 10,
            } as ScoredWordPlacement,
            allPlacements: [],
        },
    ],
};
