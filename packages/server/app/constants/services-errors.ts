import { Position } from '@app/classes/board';

export const NO_MULTIPLIER_MAPPED_TO_INPUT = (data: string): string => {
    return `Aucun multiplicateur ne correspond à la configuration ${data}`;
};

export const BOARD_CONFIG_UNDEFINED_AT = (position: Position): string => {
    return `La configuration de plateau n'est pas définie à la ligne: ${position.row}, colonne: ${position.column}`;
};

export const PLAYER_ALREADY_TRYING_TO_JOIN = 'Un joueur est déjà en train de rejoindre cette partie';
export const NO_OPPONENT_IN_WAITING_GAME = "Aucun aversaire n'est en attente de la partie";
export const OPPONENT_NAME_DOES_NOT_MATCH = "Le nom de l'adversaire ne correspond pas. Impossible d'accepter la partie";
export const CANNOT_HAVE_SAME_NAME = "Impossible de rejoindre la partie d'un joueur portant le même nom";
export const NO_DICTIONARY_INITIALIZED = 'Aucun dictionnaire à utiliser';
export const INVALID_PASSWORD = 'Mot de passe invalide';
export const INVALID_COMMAND = "Cette commande n'est pas reconnue. Entrez !aide pour connaitre les commandes valides";
export const INVALID_PAYLOAD = 'Payload invalide pour ce type de commande';
export const NOT_PLAYER_TURN = "Ce n'est pas le tour du joueur demandeur de jouer";
export const SOCKET_SERVICE_NOT_INITIALIZED = "SocketService n'est pas initalisé";
export const INVALID_ID_FOR_SOCKET = 'Identifiant invalide pour le socket';
export const MINIMUM_WORD_LENGTH = 2;
export const MAXIMUM_WORD_LENGTH = 40;
export const INVALID_WORD = (word: string) => `Le mot **${word}** n'est pas dans le dictionnaire choisi. Vous perdez votre tour.`;
export const WORD_TOO_SHORT = ' Mot trop court';
export const WORD_CONTAINS_HYPHEN = ' Le mot ne peut pas contenir de tiret';
export const WORD_CONTAINS_APOSTROPHE = " Le mot ne peut pas contenir d'apostrophe";
export const WORD_CONTAINS_ASTERISK = " Le mot ne peut pas contenir d'astérisque";
export const NO_GAME_FOUND_WITH_ID = 'Aucune partie trouvée avec cet identifiant';
export const NO_USER_FOUND_WITH_NAME = 'Aucun utilisateur trouvé avec ce nom';
export const INVALID_PLAYER_ID_FOR_GAME = 'Identifiant de joueur invalide pour cette partie';
export const INVALID_TYPES = 'Type incohérent retourné';
export const CANT_START_GAME_WITH_NO_REAL_OPPONENT = 'Interdit de commencer une partie sans avoir au moins 1 adversaire humain';
export const COMMAND_IS_INVALID = (command: string) => `La commande **${command}** est invalide :<br>`;
export const OPPONENT_PLAYED_INVALID_WORD = "Votre adversaire a joué un mot qui n'est pas dans le dictionnaire. Il perd son tour.";
export const NO_REQUEST_POINT_RANGE = 'La requête doit avoir un pointRange';
export const INVALID_REQUEST_POINT_RANGE = 'Le minimum du pointRange de la requête doit être plus petit que le maximum';
export const NO_REQUEST_POINT_HISTORY = 'La requête doit avoir un pointHistory';
export const NO_OBJECTIVE_LEFT_IN_POOL = "Il n'y a plus d'objectifs disponibles pour la partie";
export const NO_FIRST_ROUND_EXISTS = "Il n'y a aucune ronde déjà complétée ni de ronde active";
export const INVALID_PLAYER_TO_REPLACE = "Le joueur à remplacer n'existe pas";
export const NAME_ALREADY_USED = (name: string) => `Le nom ${name} est déjà utilisé pour un autre profil de joueur virtuel`;
export const CANNOT_ADD_DEFAULT_PROFILE = "Impossible d'ajouter un nouveau profil de joueur virtuel par défaut";
export const NO_PROFILE_OF_LEVEL = "Il n'y a aucun joueur du niveau demandé";
export const INVALID_LEVEL = 'Le niveau spécifié pour le nouveau profil joueur virtuel est invalide';
export const MISSING_PARAMETER = 'La requête ne contient pas toutes les spécifications requises';
export const CHANNEL_DOES_NOT_EXISTS = "Le canal n'existe pas";
export const ALREADY_EXISTING_CHANNEL_NAME = 'Le canal que vous voulez créer existe déjà';
export const ALREADY_IN_CHANNEL = 'Vous appartenez déjà à ce canal';
export const NOT_IN_CHANNEL = "Vous n'êtes pas dans ce canal";
export const UNKNOWN_ERROR_JOINING_CHANNEL = 'Il y a eu une erreur en rejoignant le canal de discussion';
export const CANNOT_SEND_MESSAGE = "Erreur lors de l'envoi du message";
export const NO_ANALYSIS_FOUND = 'Aucune analyse trouvée pour cette partie et ce joueur';
export const NO_ANALYSIS_FOUND_ID = 'Aucune analyse trouvée pour cet id';

export const NO_TOKEN = 'Vous devez être connecté pour faire cette action';
export const TOKEN_INVALID = 'Votre session est expirée. Veuillez vous reconnecter';
export const USER_NOT_FOUND = 'Utilisateur non trouvé';

export const CANNOT_GET_STATISTICS_FOR_USER = "Impossible d'obtenir les statistiques";
