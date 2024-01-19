import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { TileComponent } from '@app/components/tile/tile.component';
import { ChooseBlankTileDialogComponent } from './choose-blank-tile-dialog.component';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';

const onConfirm = (letter: string) => alert('Letter : ' + letter);
const onCancel = () => alert('Cancel');

export default {
    title: 'Game/Choose blank tile',
    component: ChooseBlankTileDialogComponent,
    decorators: [
        moduleMetadata({
            declarations: [TileComponent],
            imports: [MatCardModule, MatButtonModule, MatDialogModule],
            providers: [{ provide: MAT_DIALOG_DATA, useValue: { onConfirm, onCancel } }],
        }),
    ],
} as Meta;

export const primary: Story<ChooseBlankTileDialogComponent> = (props: ChooseBlankTileDialogComponent) => ({
    props,
    template: '<mat-card><app-choose-blank-tile-dialog></app-choose-blank-tile-dialog></mat-card>',
});
