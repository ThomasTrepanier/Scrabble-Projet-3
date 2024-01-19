import { Message } from '@app/classes/communication/message';
import { SYSTEM_ID } from './game-constants';

export const MISSING_PLAYER_DATA_TO_INITIALIZE = 'Certaines informations sont manquantes pour créer le joueur';
export const NO_LOCAL_PLAYER = "Aucun joueur local n'a encore été défini";
export const INVALID_PAYLOAD_FOR_ACTION_TYPE = 'Payload invalide pour ce type de commande';
export const NO_CURRENT_ROUND = "Aucune round n'est active présentement";
export const NO_START_GAME_TIME = "La partie n'et pas encore commencée, alors il n'y a pas encore de temps de départ";
export const SOCKET_ID_UNDEFINED = "L'identifiant du socket n'est pas défini";
export const INVALID_ROUND_DATA_PLAYER = 'Impossible de convertir le round data avec ce joueur';
export const EXPIRED_COOKIE_AGE = '-99999999';
export const NO_SUBJECT_FOR_EVENT = "Il n'y a aucun Subject associé à l'événement demandé";
export const IS_NOT_BEHAVIOR_OBJECT = "Le Subject n'est pas un BehaviourSubject et n'a donc pas de valeur";
export const PLAYER_NUMBER_INVALID = (playerNumber: number) => `Il n'y a pas de joueur #${playerNumber} dans la partie`;
export const ACTIVE_PLAYER_NOT_FOUND = 'Aucun joueur actif trouvé';

export const WAIT_FOR_COMMAND_CONFIRMATION_MESSAGE = (gameId: string): Message => {
    return {
        content: "Veuillez attendre la confirmation de votre commande précédente avant d'en envoyer une autre.",
        senderId: SYSTEM_ID,
        gameId,
    };
};

export const RECONNECTION_DELAY = 1500;
export const RECONNECTION_RETRIES = 3;
export const DEBOUNCE_TIME = 300;

export const STATE_LOADING_MESSAGE = "Chargement de l'application";
export const STATE_ERROR_SERVER_NOT_CONNECTED_MESSAGE = "Impossible d'établir une connexion avec le serveur.";
export const STATE_ERROR_DATABASE_NOT_CONNECTED_MESSAGE = "Impossible d'établir une connexion avec la base de donnée";
export const STATE_ERROR_DATABASE_NOT_CONNECTED_MESSAGE_TRY_AGAIN =
    "Impossible d'établir une connexion avec la base de donnée.\nVeuillez réessayer ultérieurement.";

export const INVALID_CONNECTION_TITLE = 'Vous êtes déjà connecté';
export const INVALID_CONNECTION_CONTENT =
    // eslint-disable-next-line max-len
    "Vous ne pouvez pas être connecté au même compte plus d'une fois.\nVeuillez vous connecter avec un autre compte ou rafraichir cette page lorsque vous vous serez déconnecté.";
export const INVALID_CONNECTION_RETURN = 'Se déconnecter';

export const LOGIN_REQUIRED = 'Vous devez être connecté pour performer cet action.';

export const USER_NOT_FOUND = "L'utilisateur n'existe pas";
