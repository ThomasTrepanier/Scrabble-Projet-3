import { Orientation, Position } from '@app/classes/board';
import { ActionType } from '@common/models/action';
import { Tile } from '@app/classes/tile';
import { WordPlacement } from '@app/classes/word-finding';
import { ORIENTATION_HORIZONTAL_LETTER, ORIENTATION_VERTICAL_LETTER } from '@app/constants/classes-constants';
import { ACTION_COMMAND_INDICATOR } from '@app/constants/services-constants/word-finding-const';

export class PlacementToString {
    static positionNumberToLetter(position: number): string {
        return String.fromCharCode(position + 'a'.charCodeAt(0));
    }

    static tilesToString(tiles: Tile[], inUpperCase: boolean = false): string {
        return tiles.reduce((str, tile) => {
            return str + this.tileToLetterConversion(tile, inUpperCase);
        }, '');
    }

    static wordPlacementToCommandString(placement: WordPlacement): string {
        return `${ACTION_COMMAND_INDICATOR}${ActionType.PLACE} ${this.positionAndOrientationToString(
            placement.startPosition,
            placement.orientation,
        )} ${this.tilesToString(placement.tilesToPlace)}`;
    }
    private static orientationToLetter(orientation: Orientation): string {
        switch (orientation) {
            case Orientation.Horizontal:
                return ORIENTATION_HORIZONTAL_LETTER;
            case Orientation.Vertical:
                return ORIENTATION_VERTICAL_LETTER;
        }
    }

    private static positionAndOrientationToString(position: Position, orientation: Orientation): string {
        return `${this.positionNumberToLetter(position.row)}${position.column + 1}${this.orientationToLetter(orientation)}`;
    }

    private static tileToLetterConversion(tile: Tile, inUpperCase: boolean = false): string {
        return inUpperCase || tile.isBlank ? this.getLetterFromBlankTile(tile) : tile.letter.toLowerCase();
    }

    private static getLetterFromBlankTile(tile: Tile): string {
        if (!tile.isBlank) return tile.letter;

        return tile.playedLetter ? tile.playedLetter.toUpperCase() : tile.letter.toUpperCase();
    }
}
