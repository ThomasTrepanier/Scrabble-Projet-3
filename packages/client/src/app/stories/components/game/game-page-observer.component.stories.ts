import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { MatCardModule } from '@angular/material/card';
import { GameBoardWrapperComponent } from '@app/wrappers/game-board-wrapper/game-board-wrapper.component';
import { MatDialogModule } from '@angular/material/dialog';
import { InitializedGameStoriesModule } from '@app/stories/modules/initialized-game-stories/initialized-game-stories.module';
import { BoardComponent } from '@app/components/board/board.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { SquareComponent } from '@app/components/square/square.component';
import { TileComponent } from '@app/components/tile/tile.component';
import { TileRackComponent } from '@app/components/tile-rack/tile-rack.component';
import { MatButtonModule } from '@angular/material/button';
import { IconComponent } from '@app/components/icon/icon.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { SrcDirective } from '@app/directives/src-directive/src.directive';
import { GameTilesLeftComponent } from '@app/components/game/game-tiles-left/game-tiles-left.component';
import { GameTimerComponent } from '@app/components/game/game-timer/game-timer.component';
import { CommunicationBoxComponent } from '@app/components/communication-box/communication-box.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { ObserverGamePageComponent } from '@app/pages/observer-game-page/observer-game-page.component';
import { GameObserversPlayersComponent } from '@app/components/game/game-observers-players/game-observers-players.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';

export default {
    title: 'Game/Page observer',
    component: ObserverGamePageComponent,
    decorators: [
        moduleMetadata({
            declarations: [
                GameBoardWrapperComponent,
                BoardComponent,
                SquareComponent,
                TileComponent,
                TileRackComponent,
                IconComponent,
                GameObserversPlayersComponent,
                SrcDirective,
                GameTilesLeftComponent,
                GameTimerComponent,
                CommunicationBoxComponent,
            ],
            imports: [
                MatCardModule,
                MatDialogModule,
                InitializedGameStoriesModule,
                MatGridListModule,
                MatButtonModule,
                MatTooltipModule,
                BrowserAnimationsModule,
                DragDropModule,
                FormsModule,
                ReactiveFormsModule,
                MatFormFieldModule,
                ScrollingModule,
                MatSnackBarModule,
            ],
        }),
    ],
} as Meta;

export const primary: Story<ObserverGamePageComponent> = (props: ObserverGamePageComponent) => ({ props });
