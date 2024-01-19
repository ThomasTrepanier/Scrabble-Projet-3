export const PLAYER_NAME_REQUIRED = 'Le corps de la requête doit contenir un playerName';
export const GAME_TYPE_REQUIRED = 'Le corps de la requête doit contenir un gameType';
export const GAME_MODE_REQUIRED = 'Le corps de la requête doit contenir un gameMode';
export const MAX_ROUND_TIME_REQUIRED = 'Le corps de la requête doit contenir un maxRoundTime';
export const DICTIONARY_REQUIRED = 'Le corps de la requête doit contenir un dictionary';
export const VIRTUAL_PLAYER_NAME_REQUIRED = 'Le corps de la requête pour une partie solo doit contenir un virtualPlayerName';
export const VIRTUAL_PLAYER_LEVEL_REQUIRED = 'Le corps de la requête pour une partie solo doit contenir un virtualPlayerLevel';
export const NAME_IS_INVALID = "L'identifiant du joueur est invalide";
export const GAME_IS_OVER = 'La partie est maintenant terminée. Impossible de la joindre';
export const PLAYER_LEFT_GAME = (isGameOver: boolean): string =>
    isGameOver ? ' a quitté la partie.' : ' a quitté la partie.<br>Un joueur virtuel a pris sa place.';

export const CONTENT_REQUIRED = 'message content is required';
export const SENDER_REQUIRED = 'message sender is required';

export const NO_LOGIN = 'Could not login with credentials';
export const NO_SIGNUP = 'Could not sign up with credentials';
export const NO_VALIDATE = 'Could generate a token';
export const ALREADY_LOGGED = "L'utilisateur est déjà connecté";
export const SOCKET_ID_IS_REQUIRED = 'Socket ID is required';
export const USER_ID_IS_REQUIRED = 'User ID is required';

export const SEARCH_QUERY_IS_REQUIRED = 'Le champ "q" est requis';
