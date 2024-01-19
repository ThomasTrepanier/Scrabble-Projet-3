import ActionInfo from '@app/classes/actions/abstract-actions/action-info';
import { FeedbackMessage } from '@app/classes/communication/feedback-messages';
import { HELP_ACTIONS } from '@app/constants/classes-constants';

export default class ActionHelp extends ActionInfo {
    getMessage(): FeedbackMessage {
        return {
            message: HELP_ACTIONS.map((action) => `!**${action.command}**${action.useCase ? ' ' + action.useCase : ''}: ${action.description}`).join(
                '<br>',
            ),
        };
    }

    getOpponentMessage(): FeedbackMessage {
        return {};
    }
}
