// ignore_for_file: constant_identifier_names, non_constant_identifier_names

const DIALOG_SURRENDER_TITLE = 'Abandonner la partie';
const DIALOG_SURRENDER_CONTENT = 'Voulez-vous vraiment quitter la partie?';
const DIALOG_ABANDON_BUTTON_CONFIRM = 'Abandonner la partie';
const DIALOG_ABANDON_BUTTON_CONTINUE = 'Continuer la partie';
const DIALOG_LEAVE_BUTTON_CONTINUE = 'Quitter la partie';
const DIALOG_STAY_BUTTON_CONTINUE = 'Rester sur cette page';
const DIALOG_SEE_ANALYSIS_BUTTON = "Consulter l'analyse";
const DIALOG_END_OF_GAME_RATING_CONTENT = "Votre nouveau classement Elo est de";
String Function(List<String> winners) DIALOG_END_OF_GAME_TITLE_OBSERVER =
    (List<String> winners) =>
        'Fin de la partie - Victoire de: \n ${handleWinnersToString(winners)}';
String Function(bool isLocalWinner) DIALOG_END_OF_GAME_TITLE =
    (bool isLocalWinner) =>
        'Fin de la partie - ${isLocalWinner ? 'Victoire' : 'Défaite'}';
String Function(bool isLocalWinner) DIALOG_END_OF_GAME_CONTENT =
    (bool isLocalWinner) => isLocalWinner
        ? 'Bravo pour votre victoire!'
        : 'Meilleure chance la prochaine fois!';

String handleWinnersToString(List<String> winners) {
  String winnersString =
      winners.reduce((winnersString, winner) => '$winnersString $winner et');
  return winnersString.replaceRange(
      winnersString.length - 2, winnersString.length, '');
}
