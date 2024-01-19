import { ActionType } from '@app/classes/actions/action-data';
import { Orientation } from '@app/classes/actions/orientation';
import { Vec2 } from '@app/classes/board-navigator/vec2';
import { Player } from '@app/classes/player';
import { Square, SquareView } from '@app/classes/square';
import { LetterValue } from '@app/classes/tile';
import { COLORS } from '@app/constants/colors-constants';
import { UNKOWN_USER } from '@common/models/user';

export const LETTER_VALUES: LetterValue[] = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
    '*',
];

export const BLANK_TILE_LETTER_VALUE: LetterValue = '*';

export const SQUARE_SIZE: Vec2 = { x: 1, y: 1 };
export const MARGIN_COLUMN_SIZE = 1;

export const DEFAULT_SQUARE_COLOR = COLORS.Beige;
export const UNDEFINED_TILE: { letter: '?'; value: number } = { letter: '?', value: -1 };
export const UNDEFINED_GRID_SIZE: Vec2 = { x: -1, y: -1 };
export const UNDEFINED_SQUARE_SIZE: Vec2 = { x: -1, y: -1 };
export const UNDEFINED_SQUARE: Square = {
    tile: null,
    position: { row: -1, column: -1 },
    scoreMultiplier: null,
    wasMultiplierUsed: false,
    isCenter: false,
};
export const DEFAULT_SQUARE_VIEW = new SquareView(UNDEFINED_SQUARE, SQUARE_SIZE);

export const VALID_MULTIPLIERS: number[] = [2, 3];

export const SECONDS_TO_MILLISECONDS = 1000;
export const MINIMUM_TIMER_TIME = 0.01;

export const GAME_ID_COOKIE = 'gameId';
export const SOCKET_ID_COOKIE = 'socketId';
export const TIME_TO_RECONNECT = 5;

export const MIN_COL_NUMBER = 0;
export const MAX_COL_NUMBER = 14;
export const MIN_ROW_NUMBER = 0;
export const MAX_ROW_NUMBER = 14;
export const BOARD_SIZE = 15;

export const MAX_LOCATION_COMMAND_LENGTH = 3;
export const MIN_LOCATION_COMMAND_LENGTH = 2;

export const MAX_INPUT_LENGTH = 512;
export const DEFAULT_ORIENTATION = Orientation.Horizontal;

export const MAX_TILES_PER_PLAYER = 7;

export const DEFAULT_PLAYER_ID = 'id';
export const DEFAULT_PLAYER = new Player(DEFAULT_PLAYER_ID, UNKOWN_USER, []);

export const SYSTEM_ID = 'system';
export const SYSTEM_ERROR_ID = 'system-error';
export const LOCAL_PLAYER_ID = 'me';
export const OPPONENT_ID = 'opponent';

export const ON_YOUR_TURN_ACTIONS = [ActionType.PLACE, ActionType.EXCHANGE, ActionType.PASS, ActionType.HINT];

export const EXPECTED_COMMAND_WORD_COUNT = new Map<ActionType, number>([
    [ActionType.PLACE, 3],
    [ActionType.EXCHANGE, 2],
    [ActionType.PASS, 1],
    [ActionType.HINT, 1],
    [ActionType.HELP, 1],
    [ActionType.RESERVE, 1],
]);

export const PLAYER_1_INDEX = 1;
export const PLAYER_2_INDEX = 2;
export const PLAYER_3_INDEX = 3;
export const PLAYER_4_INDEX = 4;

export const OBSERVER_HELP_DELAY = 15000;
export const OBSERVER_HELP_MESSAGE = "Cliquez sur le nom d'un joueur pour observer sa partie";
