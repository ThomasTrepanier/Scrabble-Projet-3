import ActionPlay from '@app/classes/actions/abstract-actions/action-play';
import { ActionData } from '@app/classes/communication/action-data';
import { FeedbackMessage } from '@app/classes/communication/feedback-messages';
import { GameUpdateData } from '@app/classes/communication/game-update-data';
import { ActionType } from '@common/models/action';

export default class ActionPass extends ActionPlay {
    static createActionData(): ActionData {
        return {
            input: '',
            type: ActionType.PASS,
            payload: {},
        };
    }

    execute(): GameUpdateData | void {
        return;
    }

    getMessage(): FeedbackMessage {
        return { message: 'Vous avez passé votre tour' };
    }

    getOpponentMessage(): FeedbackMessage {
        return { message: `${this.player.publicUser.username} a passé son tour` };
    }
}
