/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { Orientation, Position } from '@app/classes/board';
import { Dictionary, DictionaryNode } from '@app/classes/dictionary';
import { LetterValue } from '@app/classes/tile';
import { BoardPlacement, DictionarySearcherStackItem, PerpendicularWord, SearcherPerpendicularLetters } from '@app/classes/word-finding';
import { ERROR_PLAYER_DOESNT_HAVE_TILE, NEXT_NODE_DOES_NOT_EXISTS } from '@app/constants/classes-errors';
import { ALPHABET, BLANK_TILE_LETTER_VALUE } from '@app/constants/game-constants';
import DictionaryService from '@app/services/dictionary-service/dictionary.service';
import { ServicesTestingUnit } from '@app/services/service-testing-unit/services-testing-unit.spec';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { SinonStub, SinonStubbedInstance, stub } from 'sinon';
import { Container } from 'typedi';
import DictionarySearcher from './dictionary-searcher';

const DEFAULT_WORD = 'ORNITHORINQUE';

describe('DictionarySearcher', () => {
    let searcher: DictionarySearcher;
    let node: DictionaryNode;
    let nodeStub: SinonStubbedInstance<DictionaryNode>;
    let playerLetters: LetterValue[];
    let boardPlacement: BoardPlacement;
    let testingUnit: ServicesTestingUnit;

    beforeEach(() => {
        testingUnit = new ServicesTestingUnit().withStubbedDictionaryService();
    });

    beforeEach(() => {
        const dictionaryService = Container.get(DictionaryService);
        node = dictionaryService.getDictionary('test');
        nodeStub = testingUnit.getStubbedInstance(Dictionary);
        playerLetters = ['A', 'B', 'C', '*'];
        boardPlacement = {
            letters: [
                { letter: 'A', distance: 0 },
                { letter: 'B', distance: 1 },
            ],
            perpendicularLetters: [{ before: ['X'], after: ['Y'], distance: 2 }],
            position: new Position(0, 0),
            orientation: Orientation.Horizontal,
            minSize: 0,
            maxSize: 10,
        };

        searcher = new DictionarySearcher(node, playerLetters, boardPlacement);
    });

    afterEach(() => {
        Container.reset();
        sinon.restore();
        testingUnit.restore();
    });

    describe('constructor', () => {
        it('should add letters as map', () => {
            for (const letter of boardPlacement.letters) {
                expect(searcher['alreadyPlacedLetters'].get(letter.distance)).to.equal(letter.letter.toLowerCase());
            }
        });
    });

    describe('hasNext', () => {
        it('should return true if stack has items left', () => {
            searcher['stack'] = [{}, {}, {}] as DictionarySearcherStackItem[];

            expect(searcher['hasNext']()).to.be.true;
        });

        it('should return false if stack has no item left', () => {
            searcher['stack'] = [] as DictionarySearcherStackItem[];

            expect(searcher['hasNext']()).to.be.false;
        });
    });

    describe('next', () => {
        let nextStub: SinonStub;
        let popStub: SinonStub;
        let addChildrenToStackStub: SinonStub;
        let getWordStub: SinonStub;

        beforeEach(() => {
            nextStub = stub(searcher, <any>'next');
            popStub = stub(searcher['stack'], 'pop').returns({ node, playerLetters: [] });
            addChildrenToStackStub = stub(searcher, 'addChildrenToStack' as any);
            getWordStub = stub(searcher, 'getWord' as any);

            nextStub.callThrough();
            nextStub.onCall(1).callsFake(() => {});
        });

        it('next to pop item from stack', () => {
            searcher['next']();
            expect(popStub.called).to.be.true;
        });

        it('next should throw if stack is empty', () => {
            popStub.returns(undefined);
            expect(() => searcher['next']()).to.throw(NEXT_NODE_DOES_NOT_EXISTS);
        });

        it('should call addChildrenToStack with node and playerTile', () => {
            popStub.returns({ node, playerLetters });
            searcher['next']();
            expect(addChildrenToStackStub.calledWith(node, playerLetters)).to.be.true;
        });

        it('should return getWord result if defined', () => {
            popStub.returns({ node, playerLetters });
            getWordStub.returns({});

            searcher['next']();

            expect(getWordStub.calledWith(node)).to.be.true;
        });

        it('should return next result if getWord is undefined', () => {
            const expected = {};
            getWordStub.returns(undefined);
            nextStub.onCall(1).returns(expected);

            const result = searcher['next']();

            expect(result).to.equal(expected);
        });
    });

    describe('getAllWords', () => {
        let hasNextStub: SinonStub;
        let nextStub: SinonStub;

        beforeEach(() => {
            hasNextStub = stub(searcher, <any>'hasNext').returns(false);
            nextStub = stub(searcher, <any>'next').returns({ word: '', perpendicularWords: [] });
        });

        it('should call hasNext while its value is true', () => {
            const n = 5;

            for (let i = 0; i < n; ++i) hasNextStub.onCall(i).returns(true);

            searcher.getAllWords();

            expect(hasNextStub.callCount).to.equal(n + 1);
        });

        it('should call next while hasNext is true', () => {
            const n = 6;

            for (let i = 0; i < n; ++i) hasNextStub.onCall(i).returns(true);

            searcher.getAllWords();

            expect(nextStub.callCount).to.equal(n);
        });

        it('should return as many object as next returns', () => {
            const n = 7;

            for (let i = 0; i < n; ++i) hasNextStub.onCall(i).returns(true);

            const result = searcher.getAllWords();

            expect(result).to.have.length(nextStub.callCount);
        });
    });

    describe('getWord', () => {
        let getValueStub: SinonStub;
        let isWordValidStub: SinonStub;
        let getPerpendicularWordsStub: SinonStub;
        let areValidPerpendicularWordsStub: SinonStub;

        beforeEach(() => {
            getValueStub = nodeStub.getValue.returns(DEFAULT_WORD);
            isWordValidStub = stub(searcher, 'isWordValid' as any).returns(true);
            getPerpendicularWordsStub = stub(searcher, 'getPerpendicularWords' as any).returns([]);
            areValidPerpendicularWordsStub = stub(searcher, 'areValidPerpendicularWords' as any).returns(true);
        });

        it('should call getValue', () => {
            searcher['getWord'](node);
            expect(getValueStub.called).to.be.true;
        });

        it('should call isWordValid with getValue result', () => {
            searcher['getWord'](node);
            expect(isWordValidStub.calledWith(DEFAULT_WORD));
        });

        it('should call getPerpendicularWords with getValue result', () => {
            searcher['getWord'](node);
            expect(getPerpendicularWordsStub.calledWith(DEFAULT_WORD));
        });

        it('should call areValidPerpendicularWords with getPerpendicularWords result', () => {
            const perpendicularWords: PerpendicularWord[] = [];
            getPerpendicularWordsStub.returns(perpendicularWords);
            searcher['getWord'](node);
            expect(areValidPerpendicularWordsStub.calledWith(perpendicularWords));
        });

        it('should return getValue result', () => {
            const result = searcher['getWord'](node);
            expect(result?.word).to.equal(DEFAULT_WORD);
        });

        it('should return getPerpendicularWords result', () => {
            const perpendicularWords: PerpendicularWord[] = [];
            getPerpendicularWordsStub.returns(perpendicularWords);
            const result = searcher['getWord'](node);
            expect(result?.perpendicularWords).to.equal(perpendicularWords);
        });

        it('should return undefined if getValue returns undefined', () => {
            getValueStub.returns(undefined);
            const result = searcher['getWord'](node);
            expect(result).to.be.undefined;
        });

        it('should return undefined if isWordValid is false', () => {
            isWordValidStub.returns(false);
            const result = searcher['getWord'](node);
            expect(result).to.be.undefined;
        });

        it('should return undefined if areValidPerpendicularWords is false', () => {
            areValidPerpendicularWordsStub.returns(false);
            const result = searcher['getWord'](node);
            expect(result).to.be.undefined;
        });
    });

    describe('addChildrenToStack', () => {
        let getDepthStub: SinonStub;
        let getSearchLettersForNextNodeStub: SinonStub;
        let getNodeStub: SinonStub;
        let unshiftStub: SinonStub;
        let getLettersLeftStub: SinonStub;
        let letters: string[];

        beforeEach(() => {
            getDepthStub = nodeStub.getDepth.returns(0);
            getSearchLettersForNextNodeStub = stub(searcher, 'getSearchLettersForNextNode' as any).returns([['A', 'B'], true]);
            getNodeStub = nodeStub.getNode.returns(node);
            unshiftStub = stub(searcher['stack'], 'unshift');
            getLettersLeftStub = stub(searcher, 'getLettersLeft' as any).returns([]);
            letters = ['X', 'Y'];
        });

        it('should call getDepth', () => {
            searcher['addChildrenToStack'](node, letters);
            expect(getDepthStub.called).to.be.true;
        });

        it('should call getSearchLettersForNextNode with depth and letters', () => {
            const depth = 4;
            getDepthStub.returns(depth);
            searcher['addChildrenToStack'](node, letters);
            expect(getSearchLettersForNextNodeStub.calledWith(depth, letters));
        });

        it('should call getNode with every letters to use from getSearchLettersForNextNode', () => {
            const lettersToUse: string[] = ['l', 'm', 'n'];
            getSearchLettersForNextNodeStub.returns([lettersToUse, true]);
            searcher['addChildrenToStack'](node, letters);

            for (const letter of lettersToUse) {
                expect(getNodeStub.calledWith(letter));
            }
        });

        it('should call unshift for every letter that returns a node', () => {
            const lettersToUse: string[] = ['l', 'm', 'n'];
            getSearchLettersForNextNodeStub.returns([lettersToUse, true]);
            searcher['addChildrenToStack'](node, letters);

            expect(unshiftStub.callCount).to.equal(lettersToUse.length);
        });

        it('should not call unshift if getNode returns undefined', () => {
            getNodeStub.returns(undefined);
            searcher['addChildrenToStack'](node, letters);
            expect(unshiftStub.called).to.be.false;
        });

        it('should add every node to stack', () => {
            const n = 3;
            const nodes: DictionaryNode[] = [];
            const lettersToUse: string[] = new Array(n).fill('a');

            getNodeStub.reset();

            for (let i = 0; i < n; ++i) {
                const currentNode = new DictionaryNode();
                getNodeStub.onCall(i).returns(currentNode);
                nodes.push(currentNode);
            }
            getSearchLettersForNextNodeStub.returns([lettersToUse, true]);
            searcher['stack'] = [];

            searcher['addChildrenToStack'](node, letters);

            for (let i = 0; i < n; ++i) {
                expect(searcher['stack'][n - i - 1].node).to.equal(nodes[i]);
            }
        });

        it('should set getLettersLeft result as playerLetters if removeFromLetters is true', () => {
            const expected = 'expected';
            getLettersLeftStub.returns(expected);
            searcher['stack'] = [];

            searcher['addChildrenToStack'](node, letters);

            expect(searcher['stack'][0].playerLetters).to.equal(expected);
        });

        it('should set letters as playerLetters if removeFromLetters is false', () => {
            searcher['stack'] = [];
            getSearchLettersForNextNodeStub.returns([['A'], false]);

            searcher['addChildrenToStack'](node, letters);

            expect(searcher['stack'][0].playerLetters).to.deep.equal(letters);
        });

        it('should not continue if depth exceeded max size', () => {
            const max = 5;
            getDepthStub.returns(max + 1);
            searcher['boardPlacement'].maxSize = max;

            searcher['addChildrenToStack'](node, letters);

            expect(getSearchLettersForNextNodeStub.called).to.be.false;
        });
    });

    describe('isWordValid', () => {
        let wordSizeIsWithinBoundsStub: SinonStub;
        let nextTileIsEmptyStub: SinonStub;

        beforeEach(() => {
            wordSizeIsWithinBoundsStub = stub(searcher, 'wordSizeIsWithinBounds' as any);
            nextTileIsEmptyStub = stub(searcher, 'nextTileIsEmpty' as any);
        });

        const tests: [sizeValid: boolean, nextLetter: boolean, expected: boolean][] = [
            [false, false, false],
            [true, false, false],
            [false, true, false],
            [true, true, true],
        ];

        for (const [sizeValid, nextLetter, expected] of tests) {
            it(`should return ${expected} for ${sizeValid} && ${nextLetter}`, () => {
                wordSizeIsWithinBoundsStub.returns(sizeValid);
                nextTileIsEmptyStub.returns(nextLetter);

                const result = searcher['isWordValid'](DEFAULT_WORD);

                expect(result).to.equal(expected);
            });
        }

        it('should call wordSizeIsWithinBounds with word', () => {
            searcher['isWordValid'](DEFAULT_WORD);

            expect(wordSizeIsWithinBoundsStub.calledWith(DEFAULT_WORD)).to.be.true;
        });

        it('should call nextTileIsEmpty with word', () => {
            wordSizeIsWithinBoundsStub.returns(true);

            searcher['isWordValid'](DEFAULT_WORD);

            expect(nextTileIsEmptyStub.calledWith(DEFAULT_WORD)).to.be.true;
        });
    });

    describe('getSearchLettersForNextNode', () => {
        const tests: [lock: string | undefined, hasWildcard: boolean, removeFromLetters: boolean][] = [
            [undefined, false, true],
            [undefined, true, true],
            ['x', false, false],
        ];

        let index = 0;
        for (const [lock, hasWildCard, removeFromLetters] of tests) {
            it(`should return valid removeFromLetters (${index})`, () => {
                const letters = ['a', 'b', 'c'];
                if (hasWildCard) letters.push(BLANK_TILE_LETTER_VALUE);

                stub(searcher['alreadyPlacedLetters'], 'get').returns(lock);

                const [, result] = searcher['getSearchLettersForNextNode'](0, letters);

                expect(result).to.equal(removeFromLetters);
            });
            index++;
        }

        it('should return array with letters if no lock and no wild card', () => {
            const letters = ['a', 'b', 'c'];

            stub(searcher['alreadyPlacedLetters'], 'get').returns(undefined);

            const [result] = searcher['getSearchLettersForNextNode'](0, letters);

            expect(result).to.have.length(letters.length);
            for (const letter of letters) expect(result).to.include(letter);
        });

        it('should return array with every letters in alphabet if wildcard', () => {
            const letters = ['a', 'b', 'c', '*'];

            stub(searcher['alreadyPlacedLetters'], 'get').returns(undefined);

            const [result] = searcher['getSearchLettersForNextNode'](0, letters);

            expect(result).to.have.length(ALPHABET.length + 1);
            for (const letter of ALPHABET) expect(result).to.include(letter);
        });

        it('should return lock letter if it exists', () => {
            const letters = ['a', 'b', 'c'];
            const lock = 'z';

            stub(searcher['alreadyPlacedLetters'], 'get').returns(lock);

            const [result] = searcher['getSearchLettersForNextNode'](0, letters);

            expect(result).to.have.length(1);
            expect(result).to.include(lock);
        });
    });

    describe('getLettersLeft', () => {
        const tests: [letters: string[], playing: string, expected: string[]][] = [
            [['a', 'b', 'c'], 'b', ['a', 'c']],
            [['a', 'b', '*'], 'z', ['a', 'b']],
            [['a', 'b', '*'], 'b', ['a', '*']],
        ];

        let index = 0;
        for (const [letters, playing, expected] of tests) {
            it(`should remove playing letter (${index})`, () => {
                expect(searcher['getLettersLeft'](letters, playing)).to.deep.equal(expected);
            });
            index++;
        }

        it('should throw if letter not present', () => {
            const letters = ['a', 'b', 'c'];
            const playing = 'z';

            expect(() => searcher['getLettersLeft'](letters, playing)).to.throw(ERROR_PLAYER_DOESNT_HAVE_TILE);
        });
    });

    describe('getPerpendicularWords', () => {
        const tests: [
            word: string,
            perpendicular: SearcherPerpendicularLetters[],
            expected: [word: string, distance: number, junctionDistance: number][],
        ][] = [
            ['abc', [{ before: 'xy', after: 'z', distance: 1 }], [['xybz', 1, 2]]],
            ['abc', [{ before: 'xy', after: 'z', distance: 5 }], []],
            [
                'abc',
                [
                    { before: 'xy', after: 'z', distance: 1 },
                    { before: '', after: 'lmn', distance: 2 },
                ],
                [
                    ['xybz', 1, 2],
                    ['clmn', 2, 0],
                ],
            ],
        ];

        let index = 0;
        for (const [word, perpendicular, expected] of tests) {
            it(`should extract perpendicular words (${index})`, () => {
                searcher['perpendicularLetters'] = perpendicular;

                expect(searcher['getPerpendicularWords'](word)).to.deep.equal(
                    expected.map(([w, distance, junctionDistance]) => ({ word: w, distance, junctionDistance })),
                );
            });
            index++;
        }
    });

    describe('convertLetterValues', () => {
        const tests: [input: LetterValue[], output: string[]][] = [
            [
                ['A', 'B', 'C'],
                ['a', 'b', 'c'],
            ],
            [[], []],
        ];

        let index = 0;
        for (const [input, output] of tests) {
            it(`should copy array and set to lowercase (${index})`, () => {
                const result = searcher['convertLetterValues'](input);

                expect(result).to.not.equal(output);
                expect(result).to.deep.equal(output);
            });
            index++;
        }
    });

    describe('areValidPerpendicularWords', () => {
        let wordExistsStub: SinonStub;
        let words: PerpendicularWord[];

        beforeEach(() => {
            wordExistsStub = nodeStub.wordExists.returns(true);
            words = [
                { word: 'abc', distance: 0, junctionDistance: 0 },
                { word: 'abcd', distance: 0, junctionDistance: 0 },
                { word: 'abcde', distance: 0, junctionDistance: 0 },
            ];
        });

        it('should return true if empty', () => {
            expect(searcher['areValidPerpendicularWords']([])).to.be.true;
        });

        it('should return true if every word exists', () => {
            expect(searcher['areValidPerpendicularWords'](words)).to.be.true;
        });

        for (let i = 0; i < 3; ++i) {
            it(`should return false if any word does not exists (${i})`, () => {
                wordExistsStub.onCall(i).returns(false);
                expect(searcher['areValidPerpendicularWords'](words)).to.be.false;
            });
        }
    });

    describe('nextTileIsEmpty', () => {
        const tests: [word: string, position: number, expected: boolean][] = [
            ['abc', 2, true],
            ['abc', 3, false],
            ['abc', 4, true],
        ];

        let index = 0;
        for (const [word, position, expected] of tests) {
            it(`should check (${index})`, () => {
                searcher['alreadyPlacedLetters'] = new Map([[position, 'z']]);
                expect(searcher['nextTileIsEmpty'](word)).to.equal(expected);
            });
            index++;
        }
    });

    describe('wordSizeIsWithinBounds', () => {
        const tests: [word: string, min: number, max: number, expected: boolean][] = [
            ['abc', 0, 5, true],
            ['abc', 3, 3, true],
            ['abc', 0, 2, false],
            ['abc', 4, 5, false],
        ];

        let index = 0;
        for (const [word, min, max, expected] of tests) {
            it(`should check if word is within bounds (${index})`, () => {
                searcher['boardPlacement'].minSize = min;
                searcher['boardPlacement'].maxSize = max;
                expect(searcher['wordSizeIsWithinBounds'](word)).to.equal(expected);
            });
            index++;
        }
    });
});
