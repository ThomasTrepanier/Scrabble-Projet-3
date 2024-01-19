/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ActionType, ACTION_COMMAND_INDICATOR, ExchangeActionPayload, PlaceActionPayload } from '@app/classes/actions/action-data';
import { Orientation, ORIENTATION_HORIZONTAL_LETTER, ORIENTATION_VERTICAL_LETTER } from '@app/classes/actions/orientation';
import { Position } from '@app/classes/board-navigator/position';
import { Tile } from '@app/classes/tile';
import { INVALID_PAYLOAD_FOR_ACTION_TYPE } from '@app/constants/services-errors';
import { ActionPayloadToString } from './action-payload-to-string';

const DEFAULT_TILES: Tile[] = [new Tile('A', 1), new Tile('A', 2, true)];

const DEFAULT_PLACE_PAYLOAD: PlaceActionPayload = {
    tiles: DEFAULT_TILES,
    startPosition: { row: 0, column: 0 },
    orientation: Orientation.Horizontal,
};
const EXPECTED_PLACE_INPUT = `${ACTION_COMMAND_INDICATOR}${ActionType.PLACE} a1h aA`;

const DEFAULT_EXCHANGE_PAYLOAD: ExchangeActionPayload = {
    tiles: DEFAULT_TILES,
};
const EXPECTED_EXCHANGE_INPUT = `${ACTION_COMMAND_INDICATOR}${ActionType.EXCHANGE} aA`;

const EXPECTED_HELP_INPUT = `${ACTION_COMMAND_INDICATOR}${ActionType.HELP}`;

describe('ActionPayloadToString', () => {
    describe('placeActionPayloadToString', () => {
        it('should throw INVALID_PAYLOAD_FOR_TYPE if PLACE action with invalid payload', () => {
            spyOn<any>(ActionPayloadToString, 'isInvalidPlacePayload').and.returnValue(true);
            expect(() => {
                ActionPayloadToString.placeActionPayloadToString(DEFAULT_PLACE_PAYLOAD);
            }).toThrowError(INVALID_PAYLOAD_FOR_ACTION_TYPE);
        });

        it('should call tilesToString, positionNumberToLetter and orientationToLetter', () => {
            const tilesToStringSpy = spyOn<any>(ActionPayloadToString, 'tilesToString');
            const positionNumberToLetterSpy = spyOn<any>(ActionPayloadToString, 'positionNumberToLetter');
            const orientationToLetterSpy = spyOn<any>(ActionPayloadToString, 'orientationToLetter');

            ActionPayloadToString.placeActionPayloadToString(DEFAULT_PLACE_PAYLOAD);

            expect(tilesToStringSpy).toHaveBeenCalled();
            expect(positionNumberToLetterSpy).toHaveBeenCalled();
            expect(orientationToLetterSpy).toHaveBeenCalled();
        });

        it('should return corresponding input for valid exchange input', () => {
            expect(ActionPayloadToString.placeActionPayloadToString(DEFAULT_PLACE_PAYLOAD)).toEqual(EXPECTED_PLACE_INPUT);
        });
    });

    describe('exchangeActionPayloadToString', () => {
        it('should throw INVALID_PAYLOAD_FOR_TYPE if EXCHANGE action with invalid payload', () => {
            expect(() => {
                ActionPayloadToString.exchangeActionPayloadToString({} as ExchangeActionPayload);
            }).toThrowError(INVALID_PAYLOAD_FOR_ACTION_TYPE);
        });

        it('should call tilesToString', () => {
            const tilesToStringSpy = spyOn<any>(ActionPayloadToString, 'tilesToString');

            ActionPayloadToString.exchangeActionPayloadToString(DEFAULT_EXCHANGE_PAYLOAD);

            expect(tilesToStringSpy).toHaveBeenCalled();
        });

        it('should return corresponding input for valid exchange input', () => {
            expect(ActionPayloadToString.exchangeActionPayloadToString(DEFAULT_EXCHANGE_PAYLOAD)).toEqual(EXPECTED_EXCHANGE_INPUT);
        });
    });

    describe('simpleActionToString', () => {
        it('should return corresponding input for valid help input (same as other simple commands)', () => {
            expect(ActionPayloadToString.simpleActionToString(ActionType.HELP)).toEqual(EXPECTED_HELP_INPUT);
        });
    });

    describe('positionNumberToLetter', () => {
        it('should return corresponding letter for position number)', () => {
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            const TEST_LETTERS = [0, 5, 8, 12, 14];
            const EXPECTED_NUMBER = ['a', 'f', 'i', 'm', 'o'];

            for (let i = 0; i < TEST_LETTERS.length; i++) {
                expect(ActionPayloadToString['positionNumberToLetter'](TEST_LETTERS[i])).toEqual(EXPECTED_NUMBER[i]);
            }
        });
    });

    describe('orientationToLetter', () => {
        it('should return h for horizontal orientation', () => {
            expect(ActionPayloadToString['orientationToLetter'](Orientation.Horizontal)).toEqual(ORIENTATION_HORIZONTAL_LETTER);
        });

        it('should return v for vertical orientation', () => {
            expect(ActionPayloadToString['orientationToLetter'](Orientation.Vertical)).toEqual(ORIENTATION_VERTICAL_LETTER);
        });
    });

    describe('tilesToString', () => {
        it('should expected strings for letters', () => {
            const spy = spyOn<any>(ActionPayloadToString, 'tileToLetterConversion');
            const TEST_TILES = [new Tile('A', 1), new Tile('B', 1), new Tile('C', 1), new Tile('D', 1)];
            ActionPayloadToString['tilesToString'](TEST_TILES);
            expect(spy).toHaveBeenCalledTimes(TEST_TILES.length);
        });
    });

    describe('tileToLetterConversion', () => {
        it('should expected strings for letters', () => {
            const blankPlayedTile: Tile = new Tile('*', 0, true);
            blankPlayedTile.playedLetter = 'E';
            const TEST_TILES = [new Tile('A', 1), new Tile('E', 1, true), new Tile('Z', 1), new Tile('I', 0, true), blankPlayedTile];
            const EXPECTED_LETTERS = ['a', 'E', 'z', 'I', 'E'];

            for (let i = 0; i < TEST_TILES.length; i++) {
                expect(ActionPayloadToString['tileToLetterConversion'](TEST_TILES[i])).toEqual(EXPECTED_LETTERS[i]);
            }
        });
    });

    describe('getBlankTileLetter', () => {
        it('should return playedLetter if it is defined', () => {
            const tile: Tile = new Tile('*', 0, true);
            tile.playedLetter = 'E';
            expect(ActionPayloadToString['getBlankTileLetter'](tile)).toEqual('E');
        });

        it('should return letter if playedLetter is undefined', () => {
            const tile: Tile = new Tile('*', 0, true);
            expect(ActionPayloadToString['getBlankTileLetter'](tile)).toEqual('*');
        });
    });

    describe('isInvalidPlacePayload', () => {
        it('should return false if orientation is undefined', () => {
            expect(
                ActionPayloadToString['isInvalidPlacePayload']({ ...DEFAULT_PLACE_PAYLOAD, orientation: undefined as unknown as Orientation }),
            ).toBeTrue();
        });

        it('should return false if position is undefined', () => {
            expect(
                ActionPayloadToString['isInvalidPlacePayload']({ ...DEFAULT_PLACE_PAYLOAD, startPosition: undefined as unknown as Position }),
            ).toBeTrue();
        });

        it('should return false if tiles are undefined', () => {
            expect(ActionPayloadToString['isInvalidPlacePayload']({ ...DEFAULT_PLACE_PAYLOAD, tiles: undefined as unknown as Tile[] })).toBeTrue();
        });

        it('should return true if all payload attributes are defined', () => {
            expect(ActionPayloadToString['isInvalidPlacePayload'](DEFAULT_PLACE_PAYLOAD)).toBeFalse();
        });
    });
});
