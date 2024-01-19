import { DisplayGameHistoryColumns, DisplayGameHistoryKeys } from '@app/classes/admin/admin-game-history';
import { DisplayDictionaryKeys } from '@app/classes/admin/dictionaries';
import { IconName } from '@app/components/icon/icon.component.type';
import { SingleHighScore } from '@common/models/high-score';
import { SNACK_BAR_ERROR_DURATION, SNACK_BAR_SUCCESS_DURATION } from './dictionaries-components';

export const LOCAL_PLAYER_ICON: IconName[] = ['user-astronaut', 'user-cowboy', 'user-ninja', 'user-crown'];

export const BACKSPACE = 'Backspace';
export const ESCAPE = 'Escape';
export const ARROW_LEFT = 'ArrowLeft';
export const ARROW_RIGHT = 'ArrowRight';
export const ENTER = 'Enter';
export const SPACE = ' ';
export const KEYDOWN = 'keydown';
export const DEFAULT_HIGH_SCORE: SingleHighScore = { name: 'player1', score: 0 };

export const NOT_FOUND = -1;
export const DICTIONARIES_COLUMNS = {
    title: 'Nom',
    description: 'Description',
    actions: '',
};

export const VIRTUAL_PLAYERS_COLUMNS = {
    name: 'Nom',
    actions: '',
};

export const DEFAULT_DICTIONARIES_COLUMNS: DisplayDictionaryKeys[] = ['title', 'description', 'actions'];

export const GAME_HISTORY_COLUMNS: DisplayGameHistoryColumns = {
    startDate: 'Date de début',
    startTime: 'Heure de début',
    endDate: 'Date de fin',
    endTime: 'Heure de fin',
    duration: 'Durée',
    hasAbandoned: 'Partie abandonnée',
    player1Data: 'Joueur 1',
    player1Name: 'Nom joueur 1',
    player1Score: 'Pointage joueur 1',
    player2Data: 'Joueur 2',
    player2Name: 'Nom joueur 2',
    player2Score: 'Pointage joueur 2',
};

export const DEFAULT_GAME_HISTORY_COLUMNS: DisplayGameHistoryKeys[] = [
    'startDate',
    'startTime',
    'duration',
    'hasAbandoned',
    'player1Name',
    'player1Score',
    'player2Name',
    'player2Score',
];

export const YOU_COMPLETED_THIS_OBJECTIVE = 'Vous avez complété cet objectif!';
export const OPPONENT_COMPLETED_THIS_OBJECTIVE = (isPublic: boolean) =>
    isPublic ? 'Votre adversaire a complété cet objectif avant vous' : 'Votre adversaire a complété cet objectif';

export const PERCENT = 100;

export const SUCCESS_SNACK_BAR_CONFIG = { duration: SNACK_BAR_SUCCESS_DURATION, panelClass: ['success'] };
export const ERROR_SNACK_BAR_CONFIG = { duration: SNACK_BAR_ERROR_DURATION, panelClass: ['error'] };

export const IS_CLICKABLE_CLASS = 'isClickable';
export const CODE_HTML_TAG = 'CODE';

export const ASCENDING_COLUMN_SORTER = 'asc';

export const ADMIN_RESET_HISTORY_TITLE = "Voulez-vous réinitialiser l'historique de partie?";
export const ADMIN_RESET_DICTIONARY_TITLE = 'Voulez-vous réinitialiser les dictionnaires?';
export const ADMIN_RESET_VIRTUAL_PLAYER_TITLE = 'Voulez-vous réinitialiser les joueurs virtuels?';
export const ADMIN_RESET_HIGH_SCORE_TITLE = 'Voulez-vous réinitialiser les meilleurs scores?';
export const ADMIN_RESET_MESSAGE = 'Cette opération est irréversible.';
export const CANCEL = 'Annuler';
export const CANCEL_ICON: IconName = 'ban';
export const REINITIALIZE = 'Réinitialiser';
export const REINITIALIZE_ICON: IconName = 'history';
