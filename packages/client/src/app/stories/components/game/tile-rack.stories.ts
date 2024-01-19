import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IconComponent } from '@app/components/icon/icon.component';
import { TileRackComponent } from '@app/components/tile-rack/tile-rack.component';
import { TileComponent } from '@app/components/tile/tile.component';
import { InitializedGameStoriesModule } from '@app/stories/modules/initialized-game-stories/initialized-game-stories.module';
import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Subject } from 'rxjs';
import { MatDialogModule } from '@angular/material/dialog';

export default {
    title: 'Game/Tile rack',
    component: TileRackComponent,
    decorators: [
        moduleMetadata({
            declarations: [IconComponent, TileComponent],
            imports: [
                InitializedGameStoriesModule,
                MatCardModule,
                MatTooltipModule,
                MatButtonModule,
                DragDropModule,
                BrowserAnimationsModule,
                MatDialogModule,
            ],
        }),
    ],
} as Meta;

const template: Story<TileRackComponent> = (args: TileRackComponent) => {
    // eslint-disable-next-line dot-notation
    args['focusableComponentDestroyed$'] = new Subject();

    return {
        props: args,
        template: '<div style="max-width: 700px;"><app-tile-rack></app-tile-rack></div>',
    };
};

export const primary = template.bind({});

primary.args = {
    allowExchange: true,
};
