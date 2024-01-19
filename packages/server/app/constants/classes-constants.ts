interface HelpAction {
    command: string;
    useCase?: string;
    description: string;
}

export const HELP_ACTIONS: HelpAction[] = [
    {
        command: 'placer',
        useCase: '`<ligne><colonne>`[(h|v)] <lettres>',
        description: 'jouer un mot',
    },
    {
        command: 'échanger',
        useCase: '`<lettres>`',
        description: 'changer des lettres de son chevalet pour des lettres de la réserve',
    },
    {
        command: 'passer',
        description: 'passer son tour',
    },
    {
        command: 'réserve',
        description: 'afficher les lettres dans la réserve',
    },
    {
        command: 'indice',
        description: 'proposer trois placements de mots valides',
    },
    {
        command: 'aide',
        description: 'afficher la liste des commandes et leur utilisation',
    },
];

export const HINT_ACTION_NUMBER_OF_WORDS = 5;

export const START_TILES_AMOUNT = 7;
export const TILE_RESERVE_THRESHOLD = 7;
export const LETTER_DISTRIBUTION_RELATIVE_PATH = '../../../assets/letter-distribution.json';
export const END_GAME_HEADER_MESSAGE = '**Fin de partie - lettres restantes**';

export const ORIENTATION_HORIZONTAL_LETTER = 'h';
export const ORIENTATION_VERTICAL_LETTER = 'v';
export const IN_UPPER_CASE = true;

export const NO_WORDS_FOUND = 'Aucun mot trouvé';
export const FOUND_WORDS = '**Mots trouvés**';

export const WORD_FINDING_BEGINNER_ACCEPTANCE_THRESHOLD = 0.7;

export const NUMBER_OF_PLAYERS_IN_GAME = 4;
export const NUMBER_OF_PASSING_ROUNDS_TO_END_GAME = 2;

export const GAME_ROOM_ID_PREFIX = 'GameRoom_';
