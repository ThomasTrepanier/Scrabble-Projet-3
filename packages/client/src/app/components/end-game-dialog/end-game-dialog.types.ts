export interface EndGameDialogParameters {
    hasWon: boolean;
    adjustedRating: number;
    ratingVariation: number;
    action?: () => void;
    actionAnalysis?: () => void;
}
