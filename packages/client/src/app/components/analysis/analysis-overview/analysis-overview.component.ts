import { Component, Input } from '@angular/core';
import { COLORS } from '@app/constants/colors-constants';

const DEFAULT_SIZE = 100;
const FULL = 80;
const PERCENT = 100;

@Component({
    selector: 'app-analysis-overview',
    templateUrl: './analysis-overview.component.html',
    styleUrls: ['./analysis-overview.component.scss'],
})
export class AnalysisOverviewComponent {
    @Input() amount: number;
    @Input() total: number = PERCENT;
    @Input() size: number = DEFAULT_SIZE;
    @Input() color: COLORS = COLORS.Red;
    full = FULL;

    get result(): number {
        return Math.min((this.amount / this.total) * this.full, this.full);
    }
}
