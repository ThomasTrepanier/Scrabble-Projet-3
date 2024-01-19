/* eslint-disable complexity */
import { DictionaryNode } from '@app/classes/dictionary';
import { BoardPlacement } from '@app/classes/word-finding';
import { LETTER_VALUES } from '@app/constants/game-constants';
import { Random } from '@app/utils/random/random';
import * as seedrandom from 'seedrandom';

export class DictionarySearcherRandom {
    /**
     * Map keeping track of valid letters that can be placed at a distance in accordance of its perpendicular word.
     *
     * A `null` value means that there are no restriction.
     * An empty array means that no value can be placed there.
     */
    private perpendicularMap: Map<number, string[] | null>;

    /**
     * This map represents the letters already placed.
     * The entry `[2, A]` means that the word must have the letter `A` as its 3rd letter.
     */
    private lettersMap: Map<number, string>;

    /**
     * Each levels of the array (the first dimension) represents the depth of the node.
     * Which means that all nodes at `stack[2]` are the 3rd letter in the word.
     *
     * Each nodes in a level represents the available nodes for this level.
     * Missing nodes have either been already consumed or are not available at this point of the search.
     *
     * Each nodes in a level are children of the last popped node at the previous level.
     * Which mean that when we remove a node from the upmost level, we create a new level with its children.
     * When all the nodes at a level and at the superior levels has been consumed,
     * we remove the level and those above it and pop a node at the level before it.
     */
    private stack: DictionaryNode[][];
    private readonly random: seedrandom.PRNG;

    constructor(private node: DictionaryNode, private boardPlacement: BoardPlacement, random = seedrandom()) {
        this.random = random;
    }

    *[Symbol.iterator](): Generator<string> {
        this.initSearch();

        const { minSize, maxSize } = this.boardPlacement;

        // Before starting iteration, checking if any square has no possible value according to its perpendicular word.
        for (let i = 0; i <= minSize; ++i) {
            if (!this.hasAvailableLetterForPerpendicular(i)) return;
        }

        let currentNode: DictionaryNode | undefined = this.node;

        do {
            const value = currentNode.getValue();

            if (this.validateValue(value)) {
                yield value;
            }

            // If we are deeper than the max length, we don't need to continue the search deeper.
            if (currentNode.getDepth() < maxSize - 1) {
                const fixedLetter = this.lettersMap.get(this.stack.length);
                const validLetters = this.getPerpendicularLetters(this.stack.length);

                if (fixedLetter) {
                    // If the letter for this position is fixed, only pass the letter's node to the next level.
                    const nextNode = currentNode.getNode(fixedLetter.toLowerCase());
                    if (nextNode) {
                        this.stack.push([nextNode]);
                    }
                } else if (validLetters) {
                    // If the placement has a perpendicular word/letter, only pass the valid letter's node to the next level.
                    const nextNodes = validLetters.map((letter) => currentNode?.getNode(letter)).filter((node): node is DictionaryNode => !!node);
                    if (nextNodes.length > 0) this.stack.push(nextNodes);
                } else {
                    // Otherwise, pass all children nodes to the next level.
                    const nextNodes = currentNode.getNodes();
                    if (nextNodes.length > 0) {
                        this.stack.push(nextNodes);
                    }
                }
            }

            this.clearEmptyLevelsFromStack();
        } while (this.stack.length > 0 && (currentNode = Random.popRandom(this.stack[this.stack.length - 1], this.random)));
    }

    private initSearch(): void {
        this.perpendicularMap = new Map();
        this.stack = [];
        this.lettersMap = new Map(this.boardPlacement.letters.map(({ distance, letter }) => [distance, letter.toLowerCase()]));
    }

    private validateValue(value: string | undefined): value is string {
        return !!value && value.length >= this.boardPlacement.minSize && value.length <= this.boardPlacement.maxSize;
    }

    private hasAvailableLetterForPerpendicular(distance: number): boolean {
        const validLetters = this.getPerpendicularLetters(distance);
        return validLetters === null || validLetters.length > 0;
    }

    private getPerpendicularLetters(distance: number): string[] | null {
        let validLetters = this.perpendicularMap.get(distance);

        if (validLetters === undefined) {
            validLetters = this.calculatePerpendicularLetters(distance);
            this.perpendicularMap.set(distance, validLetters);
        }

        return validLetters;
    }

    private calculatePerpendicularLetters(distance: number): string[] | null {
        const perpendicularLetters = this.boardPlacement.perpendicularLetters.find(({ distance: d }) => distance === d);

        if (!perpendicularLetters) return null;

        const res = LETTER_VALUES.filter((letter) =>
            this.node.wordExists(
                `${perpendicularLetters.before.join('')}${letter.toLowerCase()}${perpendicularLetters.after.join('')}`.toLowerCase(),
            ),
        ).map((letter) => letter.toLowerCase());

        return res;
    }

    private clearEmptyLevelsFromStack(): void {
        while (this.stack.length > 0 && this.stack[this.stack.length - 1].length === 0) {
            this.stack.pop();
        }
    }
}
