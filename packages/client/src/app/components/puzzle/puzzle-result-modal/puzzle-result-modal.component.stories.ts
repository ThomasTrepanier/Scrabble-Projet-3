import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { PuzzleResultModalComponent } from '@app/components/puzzle/puzzle-result-modal/puzzle-result-modal.component';
import { PuzzleScoreComponent } from '@app/components/puzzle/puzzle-score/puzzle-score.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Puzzle, PuzzleResult, PuzzleResultStatus } from '@common/models/puzzle';
import { Orientation } from '@common/models/position';
import { IconComponent } from '@app/components/icon/icon.component';
import { SwiperComponent } from '@app/modules/swiper/components/swiper/swiper.component';
import { SwiperSlideComponent } from '@app/modules/swiper/components/swiper-slide/swiper-slide.component';
import { SwiperNavigationComponent } from '@app/modules/swiper/components/swiper-navigation/swiper-navigation.component';
import { WordPlacement } from '@common/models/word-finding';
import { BoardComponent } from '@app/components/board/board.component';
import { SquareComponent } from '@app/components/square/square.component';
import { TileComponent } from '@app/components/tile/tile.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';

const RESULT: PuzzleResult = {
    userPoints: 23,
    result: PuzzleResultStatus.Won,
    targetPlacement: {
        startPosition: { row: 0, column: 0 },
        tilesToPlace: [],
        orientation: Orientation.Horizontal,
        score: 20,
    },
    allPlacements: [
        {
            startPosition: { row: 0, column: 0 },
            tilesToPlace: [
                { letter: 'M', value: 1 },
                { letter: 'N', value: 1 },
            ],
            orientation: Orientation.Vertical,
            score: 20,
        },
        {
            startPosition: { row: 0, column: 0 },
            tilesToPlace: [
                { letter: 'M', value: 1 },
                { letter: 'O', value: 1 },
                { letter: 'L', value: 1 },
            ],
            orientation: Orientation.Horizontal,
            score: 24,
        },
    ],
};

const PUZZLE: Puzzle = {
    board: {
        grid: [
            [
                { position: { row: 0, column: 0 }, isCenter: false, tile: null, scoreMultiplier: null, wasMultiplierUsed: false },
                { position: { row: 0, column: 1 }, isCenter: false, tile: null, scoreMultiplier: null, wasMultiplierUsed: false },
                { position: { row: 0, column: 2 }, isCenter: false, tile: null, scoreMultiplier: null, wasMultiplierUsed: false },
            ],
            [
                { position: { row: 1, column: 0 }, isCenter: false, tile: null, scoreMultiplier: null, wasMultiplierUsed: false },
                {
                    position: { row: 1, column: 1 },
                    isCenter: false,
                    tile: { letter: 'A', value: 1 },
                    scoreMultiplier: null,
                    wasMultiplierUsed: false,
                },
                {
                    position: { row: 1, column: 2 },
                    isCenter: false,
                    tile: { letter: 'B', value: 1 },
                    scoreMultiplier: null,
                    wasMultiplierUsed: false,
                },
            ],
            [
                { position: { row: 2, column: 0 }, isCenter: false, tile: null, scoreMultiplier: null, wasMultiplierUsed: false },
                { position: { row: 2, column: 1 }, isCenter: false, tile: null, scoreMultiplier: null, wasMultiplierUsed: false },
                { position: { row: 2, column: 2 }, isCenter: false, tile: null, scoreMultiplier: null, wasMultiplierUsed: false },
            ],
        ],
    },
    tiles: [],
};

const PLACEMENT: WordPlacement = {
    startPosition: { row: 1, column: 0 },
    tilesToPlace: [
        { letter: 'X', value: 1 },
        { letter: 'Y', value: 2 },
    ],
    orientation: Orientation.Vertical,
};

export default {
    title: 'Puzzle/Result/Modal',
    component: PuzzleResultModalComponent,
    decorators: [
        moduleMetadata({
            declarations: [
                PuzzleScoreComponent,
                PuzzleResultModalComponent,
                IconComponent,
                SwiperComponent,
                SwiperSlideComponent,
                SwiperNavigationComponent,
                BoardComponent,
                SquareComponent,
                TileComponent,
            ],
            imports: [MatProgressSpinnerModule, MatButtonModule, MatDialogModule, BrowserAnimationsModule, MatGridListModule, MatCardModule],
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            providers: [{ provide: MatDialogRef, useValue: { close: () => {} } }],
        }),
    ],
} as Meta;

export const win: Story<PuzzleResultModalComponent> = (props) => ({
    props,
    moduleMetadata: { providers: [{ provide: MAT_DIALOG_DATA, useValue: { result: RESULT, puzzle: PUZZLE, placement: PLACEMENT } }] },
});

export const valid: Story<PuzzleResultModalComponent> = (props) => ({
    props,
    moduleMetadata: {
        providers: [
            {
                provide: MAT_DIALOG_DATA,
                useValue: { result: { ...RESULT, userPoints: 10, result: PuzzleResultStatus.Valid }, puzzle: PUZZLE, placement: PLACEMENT },
            },
        ],
    },
});

export const invalid: Story<PuzzleResultModalComponent> = (props) => ({
    props,
    moduleMetadata: {
        providers: [
            {
                provide: MAT_DIALOG_DATA,
                useValue: { result: { ...RESULT, userPoints: -1, result: PuzzleResultStatus.Invalid }, puzzle: PUZZLE, placement: PLACEMENT },
            },
        ],
    },
});

export const abandonned: Story<PuzzleResultModalComponent> = (props) => ({
    props,
    moduleMetadata: {
        providers: [
            {
                provide: MAT_DIALOG_DATA,
                useValue: { result: { ...RESULT, userPoints: -1, result: PuzzleResultStatus.Abandoned }, puzzle: PUZZLE, placement: PLACEMENT },
            },
        ],
    },
});

export const timeout: Story<PuzzleResultModalComponent> = (props) => ({
    props,
    moduleMetadata: {
        providers: [
            {
                provide: MAT_DIALOG_DATA,
                useValue: { result: { ...RESULT, userPoints: -1, result: PuzzleResultStatus.Timeout }, puzzle: PUZZLE, placement: PLACEMENT },
            },
        ],
    },
});
