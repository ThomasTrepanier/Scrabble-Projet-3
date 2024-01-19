import { Component, HostListener, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LetterValue, Tile } from '@app/classes/tile';
import { ENTER } from '@app/constants/components-constants';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ChooseBlankTileDialogParameters {
    onConfirm?: (letter: string) => void;
    onCancel?: () => void;
}

@Component({
    selector: 'app-choose-blank-tile-dialog',
    templateUrl: './choose-blank-tile-dialog.component.html',
    styleUrls: ['./choose-blank-tile-dialog.component.scss'],
})
export class ChooseBlankTileDialogComponent {
    letter: BehaviorSubject<string | undefined> = new BehaviorSubject<string | undefined>('');

    constructor(
        @Inject(MAT_DIALOG_DATA) private data: ChooseBlankTileDialogParameters,
        private dialogRef: MatDialogRef<ChooseBlankTileDialogComponent>,
    ) {}

    @HostListener('document:keypress', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): void {
        const key = event.key.toUpperCase();

        if (key.length === 1 && key >= 'A' && key <= 'Z') {
            this.letter.next(key);
            event.stopPropagation();
        }

        if (event.key === ENTER) this.handleConfirm();
    }

    get tile(): Observable<Tile> {
        return this.letter.pipe(map<string | undefined, Tile>((letter) => ({ letter: (letter ?? '') as LetterValue, value: 0 })));
    }

    get cannotConfirm(): Observable<boolean> {
        return this.letter.pipe(map((letter) => !letter));
    }

    handleConfirm(): void {
        const letter = this.letter.value;

        if (!letter) return;

        this.data.onConfirm?.(letter);
        this.dialogRef.close();
    }

    handleCancel(): void {
        this.data.onCancel?.();
        this.dialogRef.close();
    }
}
