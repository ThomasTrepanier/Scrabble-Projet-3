import { MultiplierEffect } from '@app/classes/square/score-multiplier';
import { Multiplier } from '@app/classes/square/square';

export const BOARD_CONFIG: string[][] = [
    ['W3', 'x', 'x', 'L2', 'x', 'x', 'x', 'W3', 'x', 'x', 'x', 'L2', 'x', 'x', 'W3'],
    ['x', 'W2', 'x', 'x', 'x', 'L3', 'x', 'x', 'x', 'L3', 'x', 'x', 'x', 'W2', 'x'],
    ['x', 'x', 'W2', 'x', 'x', 'x', 'L2', 'x', 'L2', 'x', 'x', 'x', 'W2', 'x', 'x'],
    ['L2', 'x', 'x', 'W2', 'x', 'x', 'x', 'L2', 'x', 'x', 'x', 'W2', 'x', 'x', 'L2'],
    ['x', 'x', 'x', 'x', 'W2', 'x', 'x', 'x', 'x', 'x', 'W2', 'x', 'x', 'x', 'x'],
    ['x', 'L3', 'x', 'x', 'x', 'L3', 'x', 'x', 'x', 'L3', 'x', 'x', 'x', 'L3', 'x'],
    ['x', 'x', 'L2', 'x', 'x', 'x', 'L2', 'x', 'L2', 'x', 'x', 'x', 'L2', 'x', 'x'],
    ['W3', 'x', 'x', 'L2', 'x', 'x', 'x', 'S', 'x', 'x', 'x', 'L2', 'x', 'x', 'W3'],
    ['x', 'x', 'L2', 'x', 'x', 'x', 'L2', 'x', 'L2', 'x', 'x', 'x', 'L2', 'x', 'x'],
    ['x', 'L3', 'x', 'x', 'x', 'L3', 'x', 'x', 'x', 'L3', 'x', 'x', 'x', 'L3', 'x'],
    ['x', 'x', 'x', 'x', 'W2', 'x', 'x', 'x', 'x', 'x', 'W2', 'x', 'x', 'x', 'x'],
    ['L2', 'x', 'x', 'W2', 'x', 'x', 'x', 'L2', 'x', 'x', 'x', 'W2', 'x', 'x', 'L2'],
    ['x', 'x', 'W2', 'x', 'x', 'x', 'L2', 'x', 'L2', 'x', 'x', 'x', 'W2', 'x', 'x'],
    ['x', 'W2', 'x', 'x', 'x', 'L3', 'x', 'x', 'x', 'L3', 'x', 'x', 'x', 'W2', 'x'],
    ['W3', 'x', 'x', 'L2', 'x', 'x', 'x', 'W3', 'x', 'x', 'x', 'L2', 'x', 'x', 'W3'],
];

export const BOARD_CONFIG_MAP: Map<string, Multiplier> = new Map([
    ['x', null],
    ['L2', { multiplier: 2, multiplierEffect: MultiplierEffect.LETTER }],
    ['L3', { multiplier: 3, multiplierEffect: MultiplierEffect.LETTER }],
    ['W2', { multiplier: 2, multiplierEffect: MultiplierEffect.WORD }],
    ['W3', { multiplier: 3, multiplierEffect: MultiplierEffect.WORD }],
    ['S', { multiplier: 2, multiplierEffect: MultiplierEffect.WORD }],
]);
