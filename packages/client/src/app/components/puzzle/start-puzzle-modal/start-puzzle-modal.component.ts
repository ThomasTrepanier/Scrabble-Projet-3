import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { IconName } from '@app/components/icon/icon.component.type';
import { DAILY_PUZZLE_TIME } from '@app/constants/puzzle-constants';

export interface StartPuzzleModalParameters {
    onStart: (level: PuzzleLevel) => void;
    onCancel: () => void;
    defaultTime: number;
    isDaily: boolean;
    title: string;
}

export interface PuzzleLevel {
    id: string;
    name: string;
    description: string;
    time: number;
    icons: IconName[];
}

const PUZZLE_LEVELS: PuzzleLevel[] = [
    {
        id: '3',
        name: 'Débutant',
        description: '5 min',
        time: 300,
        icons: ['bolt'],
    },
    {
        id: '2',
        name: 'Avancé',
        description: '2 min',
        time: DAILY_PUZZLE_TIME,
        icons: ['bolt', 'bolt'],
    },
    {
        id: '1',
        name: 'Expert',
        description: '30 sec',
        time: 30,
        icons: ['bolt', 'bolt', 'bolt'],
    },
];

@Component({
    selector: 'app-start-puzzle-modal',
    templateUrl: './start-puzzle-modal.component.html',
    styleUrls: ['./start-puzzle-modal.component.scss'],
})
export class StartPuzzleModalComponent {
    timeField: FormControl;
    levels = PUZZLE_LEVELS;

    constructor(
        @Inject(MAT_DIALOG_DATA) private parameters: Partial<StartPuzzleModalParameters>,
        private readonly dialogRef: MatDialogRef<StartPuzzleModalComponent>,
        private readonly formBuilder: FormBuilder,
    ) {
        this.timeField = this.formBuilder.control(
            parameters.isDaily ? DAILY_PUZZLE_TIME : parameters.defaultTime ?? PUZZLE_LEVELS[0].time,
            Validators.required,
        );

        if (parameters.isDaily) this.timeField.disable();
    }

    get title(): string {
        return this.parameters.title ?? 'Puzzle';
    }

    get isDaily(): boolean {
        return this.parameters.isDaily ?? false;
    }

    onConfirm() {
        if (this.timeField.invalid) return;
        this.dialogRef.close();
        this.parameters.onStart?.(this.levels.find(({ time }) => this.timeField.value === time) ?? this.levels[0]);
    }

    onCancel() {
        this.dialogRef.close();
        this.parameters.onCancel?.();
    }
}
