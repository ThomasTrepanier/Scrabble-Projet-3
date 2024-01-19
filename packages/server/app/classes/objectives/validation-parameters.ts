import Game from '@app/classes/game/game';
import { Square } from '@app/classes/square';
import { Tile } from '@app/classes/tile';
import { WordPlacement } from '@app/classes/word-finding';

export interface ObjectiveValidationParameters {
    wordPlacement: WordPlacement;
    game: Game;
    scoredPoints: number;
    createdWords: [Square, Tile][][];
}
