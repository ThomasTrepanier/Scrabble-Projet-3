import { Vec2 } from '@app/classes/board-navigator/vec2';
import { Square } from '@app/classes/square';
import { NO_COLOR_FOR_MULTIPLIER, NO_SQUARE_FOR_SQUARE_VIEW } from '@app/constants/classes-errors';
import { COLORS } from '@app/constants/colors-constants';
import { MultiplierEffect, MultiplierValue } from '@common/models/game';
import { MULTIPLIER_COLOR_MAP } from './square-multiplier-to-color-map';
import { Orientation } from '@app/classes/actions/orientation';

export default class SquareView {
    square: Square;
    squareSize: Vec2;
    applied: boolean;
    newlyPlaced: boolean;
    halfOppacity?: boolean;
    isCursor?: boolean;
    cursorOrientation?: Orientation;

    constructor(square: Square, squareSize: Vec2) {
        this.square = square;
        this.squareSize = squareSize;
        this.applied = true;
        this.newlyPlaced = false;
        this.halfOppacity = false;
    }

    getColor(): COLORS {
        if (!this.square) {
            throw new Error(NO_SQUARE_FOR_SQUARE_VIEW);
        }
        if (!this.square.scoreMultiplier) {
            return COLORS.Gray;
        }

        const squareMultiplier: MultiplierValue = this.square.scoreMultiplier.multiplier;
        const squareMultiplierEffect: MultiplierEffect = this.square.scoreMultiplier.multiplierEffect;
        const multiplierToColorMap = MULTIPLIER_COLOR_MAP.get(squareMultiplierEffect);

        if (multiplierToColorMap) {
            const color = multiplierToColorMap.get(squareMultiplier);
            if (color) {
                return color;
            }
        }
        throw new Error(NO_COLOR_FOR_MULTIPLIER);
    }

    getText(): [type: string | undefined, multiplier: string | undefined] {
        if (!this.square) {
            throw new Error(NO_SQUARE_FOR_SQUARE_VIEW);
        }

        if (!this.square.scoreMultiplier || this.square.isCenter) {
            return [undefined, undefined];
        }
        const multiplierType: string = this.square.scoreMultiplier.multiplierEffect;
        const multiplier: number = this.square.scoreMultiplier.multiplier;

        return [multiplierType, `${multiplier}`];
    }
}
