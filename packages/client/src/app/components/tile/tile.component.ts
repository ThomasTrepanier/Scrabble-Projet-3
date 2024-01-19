import { Component, Input, OnInit } from '@angular/core';
import { LetterValue, Tile } from '@app/classes/tile';
import { BLANK_TILE_LETTER_VALUE, UNDEFINED_TILE } from '@app/constants/game-constants';

const AMOUNT_OF_TILE_BACKGROUND_IMAGES = 4;

@Component({
    selector: 'app-tile',
    templateUrl: './tile.component.html',
    styleUrls: ['./tile.component.scss'],
})
export class TileComponent implements OnInit {
    @Input() tile: Tile | { letter: '?'; value: number; isBlank?: boolean; playedLetter?: LetterValue };
    @Input() fontSize: string;
    @Input() hideValue: boolean;
    @Input() applied: boolean;
    @Input() newlyPlaced: boolean;
    @Input() halfOppacity?: boolean;
    backgroundPath: string;

    constructor() {
        this.tile = UNDEFINED_TILE;
        this.fontSize = '1em';
        this.hideValue = false;
        this.applied = true;
        this.newlyPlaced = false;
        this.halfOppacity = false;
        this.backgroundPath = this.getBackgroundPath();
    }

    ngOnInit(): void {
        if (this.isWorthlessTile()) {
            this.hideValue = true;
        }
    }

    private getBackgroundPath(): string {
        const index = Math.floor(Math.random() * AMOUNT_OF_TILE_BACKGROUND_IMAGES) + 1;
        return `assets/img/tiles/bg_${index}.svg`;
    }

    private isWorthlessTile(): boolean {
        return this.tile.isBlank || (this.tile.letter === BLANK_TILE_LETTER_VALUE && this.tile.value === 0);
    }
}
