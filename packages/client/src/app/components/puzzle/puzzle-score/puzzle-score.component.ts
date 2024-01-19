import { Component, Input } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { IconName } from '@app/components/icon/icon.component.type';

const DEFAULT_SIZE = 100;
const FULL = 80;
const PERCENT = 100;

@Component({
    selector: 'app-puzzle-score',
    templateUrl: './puzzle-score.component.html',
    styleUrls: ['./puzzle-score.component.scss'],
})
export class PuzzleScoreComponent {
    @Input() score: number;
    @Input() total: number = PERCENT;
    @Input() size: number = DEFAULT_SIZE;
    @Input() color: ThemePalette = 'primary';
    @Input() icon?: IconName;
    full = FULL;

    get result(): number {
        return Math.min((this.score / this.total) * this.full, this.full);
    }
}
