import { Square } from '@app/classes/square';
import { LetterValue, Tile } from '@app/classes/tile';
import { letterDistributionMap } from '@app/constants/letter-distributions';

export class StringConversion {
    static wordsToString(words: [Square, Tile][][]): string[] {
        return words.map((word) => word.reduce((previous, [, tile]) => previous + StringConversion.tileToString(tile), ''));
    }

    static tileToString(tile: Tile): string {
        return tile.playedLetter ? tile.playedLetter : tile.letter;
    }

    static convertTileToStringDatabase(tile: Tile): string {
        if (tile.isBlank) {
            if (tile.playedLetter) {
                return tile.playedLetter.toLowerCase();
            } else {
                return tile.letter.toLowerCase();
            }
        } else {
            return tile.letter;
        }
    }

    static convertStringToTile(tileString: string): Tile {
        let tile: Tile;

        if (tileString === tileString.toLowerCase()) {
            // it is a blanktile
            tile = { letter: '*', value: 0, isBlank: true, playedLetter: tileString !== '*' ? (tileString.toUpperCase() as LetterValue) : undefined };
        } else {
            tile = {
                letter: tileString as LetterValue,
                value: letterDistributionMap.get(tileString as LetterValue)?.score ?? 1,
                isBlank: false,
            };
        }
        return tile;
    }
}
