import { FeedbackMessage } from '@app/classes/communication/feedback-messages';
import { GameUpdateData } from '@app/classes/communication/game-update-data';
import Game from '@app/classes/game/game';
import Player from '@app/classes/player/player';

export default abstract class Action {
    constructor(protected player: Player, protected game: Game) {}

    getOpponentMessage(): FeedbackMessage {
        return this.getMessage();
    }

    abstract willEndTurn(): boolean;

    abstract execute(): GameUpdateData | void;

    abstract getMessage(): FeedbackMessage;
}
