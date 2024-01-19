import { COLORS } from '@app/constants/colors-constants';
import { MultiplierEffect } from '@common/models/game';

const LETTER_MULTIPLIER_COLOR_MAP: Map<number, COLORS> = new Map([
    [2, COLORS.Letter2x],
    [3, COLORS.Letter3x],
]);

const WORD_MULTIPLIER_COLOR_MAP: Map<number, COLORS> = new Map([
    [2, COLORS.Word2x],
    [3, COLORS.Word3x],
]);

export const MULTIPLIER_COLOR_MAP: Map<MultiplierEffect, Map<number, COLORS>> = new Map([
    [MultiplierEffect.LETTER, LETTER_MULTIPLIER_COLOR_MAP],
    [MultiplierEffect.WORD, WORD_MULTIPLIER_COLOR_MAP],
]);
