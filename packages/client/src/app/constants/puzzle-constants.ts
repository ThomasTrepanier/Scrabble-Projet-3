export const ABANDON_PUZZLE_DIALOG_TITLE = 'Abandonner le puzzle ?';
export const ABANDON_PUZZLE_DIALOG_CONTENT = 'Vous pourrez passer au puzzle suivant.';
export const ABANDON_PUZZLE_DIALOG_BUTTON_CONTINUE = 'Continuer le puzzle';
export const ABANDON_PUZZLE_DIALOG_BUTTON_ABANDON = 'Abandonner';

export const PUZZLE_ERROR_DIALOG_TITLE = 'Un erreur est survenu';
export const PUZZLE_ERROR_DIALOG_CONTENT = 'Un erreur inconnu est survenu lors de la vérification du puzzle';
export const PUZZLE_ERROR_DIALOG_BUTTON_CONTINUE = 'Puzzle suivant';
export const PUZZLE_ERROR_DIALOG_BUTTON_GO_HOME = "Retour à l'accueil";

export const DAILY_PUZZLE_MESSAGE_NOT_COMPLETED = "Vous n'avez pas complété le puzzle du jour. Débutez le maintenant!";
export const DAILY_PUZZLE_MESSAGE_FIRST = 'Vous êtes le premier dans le classement! Revenez à 8 P.M. pour le prochain puzzle.';
export const DAILY_PUZZLE_MESSAGE_IN_LEADERBOARD = 'Vous êtes dans le classement! Revenez à 8 P.M. pour le prochain puzzle.';
export const DAILY_PUZZLE_MESSAGE_NOT_IN_LEADERBOARD = (rank: number, total: number) =>
    `Vous êtes ${rank}e sur ${total} joueurs. Revenez à 8 P.M. pour le prochain puzzle.`;
export const DAILY_PUZZLE_MESSAGE_NOT_WON = "Vous n'avez pas réussi le puzzle du jour. Revenez à 8 P.M. pour le prochain puzzle.";

export const DAILY_PUZZLE_LEADERBOARD_COUNT = 5;
export const DAILY_PUZZLE_TIME = 120;
