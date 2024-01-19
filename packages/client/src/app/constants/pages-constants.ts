import { GameVisibility } from '@common/models/game-visibility';
import { Group } from '@common/models/group';
import { UNKOWN_USER } from '@common/models/user';
import { VirtualPlayerLevel } from '@common/models/virtual-player-level';

export const HOST_WAITING_MESSAGE = "En attente d'un adversaire";
export const OPPONENT_FOUND_MESSAGE = ' a rejoint votre partie.';
export const DIALOG_TITLE = 'Attention!';
export const DIALOG_CONTENT = " a quitté le salon. Veuillez patientez le temps qu'un autre joueur veuille vous affronter.";
export const DIALOG_BUTTON_CONTENT_REJECTED = 'Retourner en attente.';
export const DIALOG_BUTTON_CONTENT_RETURN_GROUP = 'Retourner à la sélection de parties.';
export const DIALOG_REJECT_TITLE = 'Rejeté';
export const DIALOG_REJECT_CONTENT = ' vous a rejeté de la partie.';
export const DIALOG_CANCEL_TITLE = 'Partie annulée';
export const DIALOG_CANCEL_CONTENT = ' a annulé la partie.';
export const DIALOG_FULL_TITLE = 'Partie Remplie';
export const DIALOG_FULL_CONTENT = 'La partie est déjà remplie';
export const DIALOG_CANCELED_TITLE = 'Partie annulée';
export const DIALOG_CANCELED_CONTENT = 'La partie a été annulée';
export const DIALOG_ABANDON_TITLE = 'Abandonner la partie';
export const DIALOG_ABANDON_CONTENT = 'Voulez-vous vraiment ABANDONNER?';
export const DIALOG_ABANDON_BUTTON_CONFIRM = 'Abandonner la partie';
export const DIALOG_ABANDON_BUTTON_CONTINUE = 'Continuer la partie';
export const DIALOG_QUIT_TITLE = 'Quitter la partie';
export const DIALOG_QUIT_CONTENT = 'Voulez-vous vraiment quitter la partie?';
export const DIALOG_QUIT_BUTTON_CONFIRM = 'Quitter la partie';
export const DIALOG_REPLACE_TITLE = 'Remplacer joueur virtuel';
export const DIALOG_REPLACE_BUTTON_CONTINUE = 'Continuer à observer la partie';
export const DIALOG_REPLACE_CONTENT = (virtualPlayerName: string) => `Voulez-vous vraiment remplacer ${virtualPlayerName}?`;
export const DIALOG_REPLACE_BUTTON_CONFIRM = 'Remplacer';
export const DIALOG_ANALYSIS_BUTTON_CONFIRM = 'Analyser la partie';
export const DIALOG_QUIT_STAY = 'Rester dans la partie';
export const DIALOG_NO_ACTIVE_GAME_TITLE = 'Aucune partie en cours';
export const DIALOG_NO_ACTIVE_GAME_CONTENT = "Vous n'avez aucune partie en cours. Veuillez en joindre ou en créer une.";
export const DIALOG_NO_ACTIVE_GAME_BUTTON = "Retour à la page d'accueil";

export const DIALOG_END_OF_GAME_TITLE = (isLocalPlayerWinner: boolean) => `Fin de la partie - ${isLocalPlayerWinner ? 'Victoire' : 'Défaite'}`;
export const DIALOG_END_OF_GAME_WIN_MESSAGE = 'Bravo pour votre victoire!';
export const DIALOG_END_OF_GAME_LOSS_MESSAGE = 'Meilleure chance la prochaine fois!';

export const DIALOG_END_OF_GAME_OBSERVER_TITLE = 'Fin de la partie';
export const DIALOG_END_OF_GAME_OBSERVER_CONTENT = (winnerNames: string[]) =>
    `Bravo à${winnerNames.reduce((acc: string, current: string) => acc + ' ' + current, '')} pour la victoire!`;
export const DIALOG_END_OF_GAME_CLOSE_BUTTON = 'Rester sur cette page';
export const DIALOG_END_OF_GAME_EXIT_BUTTON = "Retourner à l'acceuil";
export const MIN_CONFETTI_COUNT = 100;
export const MAX_CONFETTI_COUNT = 150;

export const DEFAULT_TIMER_VALUE = 60;
export const DEFAULT_TIMER_STRING = '1:00';
export const MINIMUM_TIMER_VALUE = 30;
export const MAXIMUM_TIMER_VALUE = 300;
export const TIMER_VALUE_INCREMENTS = 30;
export const KEEP_DATA = false;

export const DEFAULT_GROUP: Group = {
    groupId: '',
    user1: UNKOWN_USER,
    maxRoundTime: 60,
    gameVisibility: GameVisibility.Public,
    virtualPlayerLevel: VirtualPlayerLevel.Beginner,
    password: '',
    numberOfObservers: 0,
};
