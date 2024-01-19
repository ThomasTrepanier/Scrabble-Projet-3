import { Meta, moduleMetadata } from '@storybook/angular';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IconComponent } from '@app/components/icon/icon.component';
import { SwiperComponent } from '@app/modules/swiper/components/swiper/swiper.component';
import { SwiperSlideComponent } from '@app/modules/swiper/components/swiper-slide/swiper-slide.component';
import { SwiperNavigationComponent } from '@app/modules/swiper/components/swiper-navigation/swiper-navigation.component';
import { BoardComponent } from '@app/components/board/board.component';
import { SquareComponent } from '@app/components/square/square.component';
import { TileComponent } from '@app/components/tile/tile.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { AnalysisOverviewComponent } from '@app/components/analysis/analysis-overview/analysis-overview.component';
import { AnalysisResultModalComponent } from './analysis-result-modal.component';

export default {
    title: 'Analysis/Result/Modal',
    component: AnalysisResultModalComponent,
    decorators: [
        moduleMetadata({
            declarations: [
                AnalysisOverviewComponent,
                AnalysisResultModalComponent,
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
