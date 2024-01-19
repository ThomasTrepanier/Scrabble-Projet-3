import { ActionType, ACTION_COMMAND_INDICATOR, ExchangeActionPayload, PlaceActionPayload } from '@app/classes/actions/action-data';
import { Orientation, ORIENTATION_HORIZONTAL_LETTER, ORIENTATION_VERTICAL_LETTER } from '@app/classes/actions/orientation';
import { Tile } from '@app/classes/tile';
import { INVALID_PAYLOAD_FOR_ACTION_TYPE } from '@app/constants/services-errors';

const COLUMN_INDEX_ADJUSTMENT = 1;

export class ActionPayloadToString {
    static placeActionPayloadToString(placePayload: PlaceActionPayload): string {
        if (this.isInvalidPlacePayload(placePayload)) throw new Error(INVALID_PAYLOAD_FOR_ACTION_TYPE);

        const tiles = this.tilesToString(placePayload.tiles);
        const positionRow = this.positionNumberToLetter(placePayload.startPosition.row);
        const positionColumn = `${placePayload.startPosition.column + COLUMN_INDEX_ADJUSTMENT}`;
        const orientation = this.orientationToLetter(placePayload.orientation);
        return `${ACTION_COMMAND_INDICATOR}${ActionType.PLACE} ${positionRow}${positionColumn}${orientation} ${tiles}`;
    }

    static exchangeActionPayloadToString(exchangePayload: ExchangeActionPayload): string {
        if (!exchangePayload.tiles) throw new Error(INVALID_PAYLOAD_FOR_ACTION_TYPE);

        return `${ACTION_COMMAND_INDICATOR}${ActionType.EXCHANGE} ${this.tilesToString(exchangePayload.tiles)}`;
    }

    static simpleActionToString(actionType: ActionType): string {
        return `${ACTION_COMMAND_INDICATOR}${actionType}`;
    }

    private static positionNumberToLetter(position: number): string {
        return String.fromCharCode(position + 'a'.charCodeAt(0));
    }

    private static orientationToLetter(orientation: Orientation): string {
        return orientation === Orientation.Horizontal ? ORIENTATION_HORIZONTAL_LETTER : ORIENTATION_VERTICAL_LETTER;
    }

    private static tilesToString(tiles: Tile[]): string {
        return tiles.reduce((str, tile) => {
            return str + this.tileToLetterConversion(tile);
        }, '');
    }

    private static tileToLetterConversion(tile: Tile): string {
        return tile.isBlank ? this.getBlankTileLetter(tile).toUpperCase() : tile.letter.toLocaleLowerCase();
    }

    private static getBlankTileLetter(tile: Tile): string {
        return tile.playedLetter ? tile.playedLetter : tile.letter;
    }

    private static isInvalidPlacePayload(placePayload: PlaceActionPayload): boolean {
        return placePayload.orientation === undefined || !placePayload.startPosition || !placePayload.tiles;
    }
}
