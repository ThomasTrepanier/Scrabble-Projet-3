import { DEFAULT_TIMER_VALUE } from '@app/constants/pages-constants';
import { settings } from './settings';
import { bool, num, str } from './validators';

export const authenticationSettings = settings('authentication', {
    token: str(),
    username: str(),
});

export const gameSettings = settings('game', {
    timer: num({ default: DEFAULT_TIMER_VALUE }),
});

export const puzzleSettings = settings('puzzle', {
    time: num(),
});

export const soundSettings = settings('sound', {
    isMusicEnabled: bool(),
    isSoundEffectsEnabled: bool(),
});
