import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { StartPuzzleModalComponent } from '@app/components/puzzle/start-puzzle-modal/start-puzzle-modal.component';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { IconComponent } from '@app/components/icon/icon.component';
import { MatButtonModule } from '@angular/material/button';

export default {
    title: 'Puzzle/Start puzzle modal',
    component: StartPuzzleModalComponent,
    decorators: [
        moduleMetadata({
            declarations: [IconComponent],
            imports: [FormsModule, ReactiveFormsModule, MatCardModule, MatButtonModule],
            providers: [{ provide: MAT_DIALOG_DATA, useValue: {} }],
        }),
    ],
} as Meta;

export const template: Story<StartPuzzleModalComponent> = (props: StartPuzzleModalComponent) => ({ props });
