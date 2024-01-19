import { ActionType } from '@app/classes/actions/action-data';

export const BAD_SYNTAX_MESSAGES = new Map<ActionType, string>([
    [ActionType.PLACE, 'La commande placer doit suivre le format _!placer ‹position› ‹lettres›_.'],
    [ActionType.EXCHANGE, 'La commande échanger doit suivre le format _!échanger ‹lettres›_.'],
    [ActionType.PASS, 'La commande passer doit suivre le format _!passer_.'],
    [ActionType.HELP, 'La commande passer doit suivre le format _!aide_.'],
    [ActionType.HINT, 'La commande passer doit suivre le format _!indice_.'],
    [ActionType.RESERVE, 'La commande passer doit suivre le format _!réserve_.'],
]);

export enum CommandExceptionMessages {
    BadSyntax = 'La commande ne respecte pas la syntaxe requise.',
    InvalidEntry = "Cette commande n'est pas reconnue. Entrez !aide pour connaitre les commandes valides.",
    ImpossibleCommand = 'Cette commande est impossible à réaliser.',
    DontHaveTiles = "Vous n'avez pas les tuiles requises.",
    PositionFormat = 'La position doit être de format _‹a-o›‹1-15›‹h/v›_.',
    NotYourTurn = "Ce n'est pas votre tour de jouer.",
    GameOver = 'La commande est impossible car la partie est terminée.',
    ExchangeRequireLowercaseLetters = 'Les lettres à échanger doivent être en minuscule.',
}

export const PLAYER_NOT_FOUND = 'Current player could not be found';
