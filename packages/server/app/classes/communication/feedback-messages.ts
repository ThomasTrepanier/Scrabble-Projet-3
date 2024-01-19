export interface FeedbackMessage {
    message?: string;
    isClickable?: boolean;
}

export interface FeedbackMessages {
    localPlayerFeedback: FeedbackMessage;
    opponentFeedback: FeedbackMessage;
    endGameFeedback: FeedbackMessage[];
}
