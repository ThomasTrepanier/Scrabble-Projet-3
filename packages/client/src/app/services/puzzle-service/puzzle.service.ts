import { Injectable } from '@angular/core';
import { PuzzleController } from '@app/controllers/puzzle-controller/puzzle.controller';
import { DailyPuzzleLeaderboard, Puzzle, PuzzleResult, PuzzleResultStatus } from '@common/models/puzzle';
import { WordPlacement } from '@common/models/word-finding';
import { Observable } from 'rxjs';
import {
    PuzzleLevel,
    StartPuzzleModalComponent,
    StartPuzzleModalParameters,
} from '@app/components/puzzle/start-puzzle-modal/start-puzzle-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { DefaultDialogComponent } from '@app/components/default-dialog/default-dialog.component';
import { DefaultDialogParameters } from '@app/components/default-dialog/default-dialog.component.types';
import {
    ABANDON_PUZZLE_DIALOG_BUTTON_ABANDON,
    ABANDON_PUZZLE_DIALOG_BUTTON_CONTINUE,
    ABANDON_PUZZLE_DIALOG_CONTENT,
    ABANDON_PUZZLE_DIALOG_TITLE,
} from '@app/constants/puzzle-constants';
import { ENTER, ESCAPE } from '@app/constants/components-constants';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class PuzzleService {
    constructor(private readonly puzzleController: PuzzleController, private readonly dialog: MatDialog) {}

    start(): Observable<Puzzle> {
        return this.puzzleController.start();
    }

    askToStart(onStart: (level: PuzzleLevel) => void, onCancel: () => void, defaultTime: number | undefined, isDaily: boolean = false): void {
        this.dialog.open<StartPuzzleModalComponent, Partial<StartPuzzleModalParameters>>(StartPuzzleModalComponent, {
            disableClose: true,
            data: {
                onStart,
                onCancel,
                defaultTime,
                isDaily,
                title: isDaily ? 'Puzzle du jour' : 'Nouveau puzzle',
            },
        });
    }

    complete(wordPlacement: WordPlacement): Observable<PuzzleResult> {
        return this.puzzleController.complete(wordPlacement);
    }

    abandon(): Observable<PuzzleResult> {
        return this.puzzleController.abandon();
    }

    askToAbandon(onAbandon: () => void): void {
        this.dialog.open<DefaultDialogComponent, DefaultDialogParameters>(DefaultDialogComponent, {
            data: {
                title: ABANDON_PUZZLE_DIALOG_TITLE,
                content: ABANDON_PUZZLE_DIALOG_CONTENT,
                buttons: [
                    {
                        content: ABANDON_PUZZLE_DIALOG_BUTTON_CONTINUE,
                        closeDialog: true,
                        key: ESCAPE,
                    },
                    {
                        content: ABANDON_PUZZLE_DIALOG_BUTTON_ABANDON,
                        style: 'background-color: tomato; color: white;',
                        closeDialog: true,
                        key: ENTER,
                        action: onAbandon,
                    },
                ],
            },
        });
    }

    timeout(): Observable<PuzzleResult> {
        return this.puzzleController.abandon(PuzzleResultStatus.Timeout);
    }

    startDaily(): Observable<Puzzle> {
        return this.puzzleController.startDaily();
    }

    isDailyCompleted(): Observable<boolean> {
        return this.puzzleController.isDailyCompleted().pipe(map((response) => response.isCompleted));
    }

    getDailyPuzzleLeaderboard(): Observable<DailyPuzzleLeaderboard> {
        return this.puzzleController.getDailyPuzzleLeaderboard();
    }
}
