import { Component, Input } from '@angular/core';
import { PuzzleResult, PuzzleResultStatus } from '@common/models/puzzle';

@Component({
    selector: 'app-puzzle-history',
    templateUrl: './puzzle-history.component.html',
    styleUrls: ['./puzzle-history.component.scss'],
})
export class PuzzleHistoryComponent {
    @Input() results: PuzzleResult[] = [];

    shouldDisplayPoints(result: PuzzleResultStatus): boolean {
        switch (result) {
            case PuzzleResultStatus.Won:
            case PuzzleResultStatus.Valid:
                return true;
            default:
                return false;
        }
    }
}
