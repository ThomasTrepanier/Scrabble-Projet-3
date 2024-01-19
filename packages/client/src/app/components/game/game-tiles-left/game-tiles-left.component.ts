import { Component } from '@angular/core';
import { GameService } from '@app/services';

@Component({
    selector: 'app-game-tiles-left',
    templateUrl: './game-tiles-left.component.html',
    styleUrls: ['./game-tiles-left.component.scss'],
})
export class GameTilesLeftComponent {
    constructor(private readonly gameService: GameService) {}

    getNumberOfTilesLeft(): number {
        return this.gameService.getTotalNumberOfTilesLeft();
    }
}
