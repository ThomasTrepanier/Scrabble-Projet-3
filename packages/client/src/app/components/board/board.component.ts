import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SquareView } from '@app/classes/square';
import { LETTER_VALUES } from '@app/constants/game-constants';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-board',
    templateUrl: './board.component.html',
    styleUrls: ['./board.component.scss'],
})
export class BoardComponent {
    @Input() isObserver: boolean = false;
    @Input() grid: Observable<SquareView[][]>;
    @Input() canInteract: boolean = true;
    @Output() clearNewlyPlacedTiles: EventEmitter<void> = new EventEmitter();
    @Output() onSquareClick: EventEmitter<SquareView> = new EventEmitter();
    letters = LETTER_VALUES;

    onBoardClick() {
        this.clearNewlyPlacedTiles.next();
    }

    squareClickHandler(e: MouseEvent, squareView: SquareView): void {
        e.stopPropagation();
        this.onSquareClick.emit(squareView);
    }
}
