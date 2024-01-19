import ActionInfo from '@app/classes/actions/abstract-actions/action-info';
import { FeedbackMessage } from '@app/classes/communication/feedback-messages';

export default class ActionReserve extends ActionInfo {
    getMessage(): FeedbackMessage {
        return {
            message: Array.from(this.game.getTilesLeftPerLetter(), ([v, k]) => [v, k])
                .map(([letter, amount]) => `**<span>${letter}</span>**: ${amount}`)
                .join('<br>'),
        };
    }

    getOpponentMessage(): FeedbackMessage {
        return {};
    }
}
