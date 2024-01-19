export type MultiplierValue = 2 | 3;
export enum MultiplierEffect {
    LETTER = 'Lettre',
    WORD = 'Mot',
}

export default interface ScoreMultiplier {
    multiplierEffect: MultiplierEffect;
    multiplier: MultiplierValue;
}
