import { DictionaryNode } from '@app/classes/dictionary';
import { HttpException } from '@app/classes/http-exception/http-exception';
import { LetterValue } from '@app/classes/tile';
import {
    BoardPlacement,
    DictionarySearcherStackItem,
    DictionarySearchResult,
    PerpendicularLettersPosition,
    PerpendicularWord,
    SearcherPerpendicularLetters,
} from '@app/classes/word-finding';
import { ERROR_PLAYER_DOESNT_HAVE_TILE, NEXT_NODE_DOES_NOT_EXISTS } from '@app/constants/classes-errors';
import { ALPHABET, BLANK_TILE_LETTER_VALUE, NOT_FOUND } from '@app/constants/game-constants';
import { StatusCodes } from 'http-status-codes';

export default class DictionarySearcher {
    private boardPlacement: BoardPlacement;
    private stack: DictionarySearcherStackItem[];
    private alreadyPlacedLetters: Map<number, string>;
    private perpendicularLetters: SearcherPerpendicularLetters[];
    private rootNode: DictionaryNode;

    constructor(node: DictionaryNode, playerLetters: LetterValue[], boardPlacement: BoardPlacement) {
        this.rootNode = node;
        this.boardPlacement = boardPlacement;
        this.stack = [];
        this.alreadyPlacedLetters = new Map(boardPlacement.letters.map((letter) => [letter.distance, letter.letter.toLowerCase()]));
        this.perpendicularLetters = this.convertPerpendicularWords(boardPlacement.perpendicularLetters);

        this.addChildrenToStack(node, this.convertLetterValues(playerLetters));
    }

    getAllWords(): DictionarySearchResult[] {
        const results: DictionarySearchResult[] = [];

        try {
            while (this.hasNext()) results.push(this.next());
        } catch (exception) {
            // A throw means the iterator reached its end. Nothing special to handle, only return the result
        }

        return results;
    }

    private hasNext(): boolean {
        return this.stack.length > 0;
    }

    private next(): DictionarySearchResult {
        const stackItem = this.stack.pop();

        if (!stackItem) throw new HttpException(NEXT_NODE_DOES_NOT_EXISTS, StatusCodes.INTERNAL_SERVER_ERROR);

        this.addChildrenToStack(stackItem.node, stackItem.playerLetters);

        return this.getWord(stackItem.node) ?? this.next();
    }

    private getWord(node: DictionaryNode): DictionarySearchResult | undefined {
        const word = node.getValue();

        if (word && this.isWordValid(word)) {
            const perpendicularWords = this.getPerpendicularWords(word);

            if (this.areValidPerpendicularWords(perpendicularWords)) {
                return { word, perpendicularWords };
            }
        }

        return undefined;
    }

    private addChildrenToStack(node: DictionaryNode, lettersLeft: string[]): void {
        if (node.getDepth() > this.boardPlacement.maxSize) return;

        const [lettersToUse, shouldRemoveFromLetters] = this.getSearchLettersForNextNode(node.getDepth(), lettersLeft);

        for (const letter of lettersToUse) {
            const child = node.getNode(letter);

            if (child) {
                this.stack.unshift({
                    node: child,
                    playerLetters: shouldRemoveFromLetters ? this.getLettersLeft(lettersLeft, letter) : [...lettersLeft],
                });
            }
        }
    }

    private isWordValid(word: string): boolean {
        return this.wordSizeIsWithinBounds(word) && this.nextTileIsEmpty(word) && this.hasAnyNewLetters(word);
    }

    private getSearchLettersForNextNode(index: number, letters: string[]): [lettersToUse: string[], shouldRemoveFromLetters: boolean] {
        const alreadyPlacedLetter = this.alreadyPlacedLetters.get(index + 1);

        if (alreadyPlacedLetter) return [[alreadyPlacedLetter], false];

        if (!letters.includes(BLANK_TILE_LETTER_VALUE)) return [[...new Set(letters)], true];
        return [[...new Set([...letters, ...ALPHABET])], true];
    }

    private getLettersLeft(letters: string[], playingLetter: string): string[] {
        let index = letters.indexOf(playingLetter);
        if (index === NOT_FOUND) index = letters.indexOf(BLANK_TILE_LETTER_VALUE);
        if (index === NOT_FOUND) throw new HttpException(ERROR_PLAYER_DOESNT_HAVE_TILE, StatusCodes.FORBIDDEN);

        const lettersLeft = [...letters];
        lettersLeft.splice(index, 1);
        return lettersLeft;
    }

    private getPerpendicularWords(word: string): PerpendicularWord[] {
        const perpendicularWords: PerpendicularWord[] = [];

        for (const { before, after, distance } of this.perpendicularLetters) {
            const letter = word.charAt(distance);
            if (letter !== '')
                perpendicularWords.push({
                    word: before + word.charAt(distance) + after,
                    distance,
                    junctionDistance: before.length,
                });
        }

        return perpendicularWords;
    }

    private convertLetterValues(letters: LetterValue[]): string[] {
        return letters.map((letter) => letter.toLowerCase());
    }

    private areValidPerpendicularWords(words: PerpendicularWord[]): boolean {
        return words.length > 0 ? words.every((word) => this.rootNode.wordExists(word.word)) : true;
    }

    private nextTileIsEmpty(word: string): boolean {
        return !this.alreadyPlacedLetters.has(word.length);
    }

    private wordSizeIsWithinBounds(word: string): boolean {
        return word.length >= this.boardPlacement.minSize && word.length <= this.boardPlacement.maxSize;
    }

    private convertPerpendicularWords(perpendicularLettersPosition: PerpendicularLettersPosition[]): SearcherPerpendicularLetters[] {
        return perpendicularLettersPosition.map((perpendicularLetter) => ({
            before: perpendicularLetter.before.join('').toLowerCase(),
            after: perpendicularLetter.after.join('').toLowerCase(),
            distance: perpendicularLetter.distance,
        }));
    }

    private hasAnyNewLetters(word: string): boolean {
        return this.boardPlacement.letters.filter((letter) => letter.distance < word.length).length < word.length;
    }
}
