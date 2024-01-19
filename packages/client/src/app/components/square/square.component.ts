import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Orientation } from '@app/classes/actions/orientation';
import { SquareView } from '@app/classes/square';
import { DEFAULT_SQUARE_VIEW } from '@app/constants/game-constants';
import { SQUARE_TILE_DEFAULT_FONT_SIZE } from '@app/constants/tile-font-size-constants';
import { DragAndDropService } from '@app/services/drag-and-drop-service/drag-and-drop.service';
import { TilePlacementService } from '@app/services/tile-placement-service/tile-placement.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface CssStyleProperty {
    key: string;
    value: string;
}

@Component({
    selector: 'app-square',
    templateUrl: './square.component.html',
    styleUrls: ['./square.component.scss'],
})
export class SquareComponent implements OnInit {
    @ViewChild('square') squareElement: HTMLElement;
    @Input() squareView: SquareView = DEFAULT_SQUARE_VIEW;
    @Input() tileFontSize: number = SQUARE_TILE_DEFAULT_FONT_SIZE;
    @Input() isCursor: boolean = false;
    @Input() cursorOrientation: Orientation | undefined = Orientation.Horizontal;
    @Input() canInteract: boolean = true;
    multiplierType: string | undefined = undefined;
    multiplierValue: string | undefined = undefined;

    constructor(readonly dragAndDropService: DragAndDropService, private readonly tilePlacementService: TilePlacementService) {}

    ngOnInit(): void {
        [this.multiplierType, this.multiplierValue] = this.squareView.getText();
    }

    getOrientationClass(): string {
        if (this.cursorOrientation === undefined) return '';
        return `cursor-${this.cursorOrientation === Orientation.Horizontal ? 'horizontal' : 'vertical'}`;
    }

    canMove(): Observable<boolean> {
        return this.tilePlacementService.tilePlacements$.pipe(
            map(
                (placements) =>
                    !!placements.find(
                        (placement) =>
                            placement.position.column === this.squareView.square.position.column &&
                            placement.position.row === this.squareView.square.position.row,
                    ),
            ),
        );
    }

    canDropTile(squareView: SquareView): () => boolean {
        return () => {
            return !squareView.square.tile;
        };
    }
}
