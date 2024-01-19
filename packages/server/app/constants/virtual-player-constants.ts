import { env } from '@app/utils/environment/environment';

export const VIRTUAL_PLAYER_ID_PREFIX = 'virtual-player-';
export const BEGINNER_NAME_SUFFIX = ' (débutant)';
export const EXPERT_NAME_SUFFIX = ' (expert)';
export const GAME_SHOULD_CONTAIN_ROUND = 'Game object should contain round to enable virtual player to play.';
// eslint-disable-next-line @typescript-eslint/no-magic-numbers
export const PRELIMINARY_WAIT_TIME = env.isDev ? 10 : 3000;
export const FINAL_WAIT_TIME = 20000;
export const PLACE_ACTION_THRESHOLD = 0.8;
export const EXCHANGE_ACTION_THRESHOLD = 0.9;
export const LOW_SCORE_THRESHOLD = 0.4;
export const MEDIUM_SCORE_THRESHOLD = 0.7;
export const CONTENT_TYPE = 'Content-Type';
export const LOW_SCORE_RANGE_MIN = 0;
export const LOW_SCORE_RANGE_MAX = 6;
export const MEDIUM_SCORE_RANGE_MIN = 7;
export const MEDIUM_SCORE_RANGE_MAX = 12;
export const HIGH_SCORE_RANGE_MIN = 13;
export const HIGH_SCORE_RANGE_MAX = 18;
export const MINIMUM_TILES_LEFT_FOR_EXCHANGE = 7;

export const VIRTUAL_PLAYER_NAMES = ['Ahmad', 'Ali', 'Nikolay', 'Michel', 'Éric', 'Martine', 'Maud', 'Émilie'];
