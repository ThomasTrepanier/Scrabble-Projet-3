/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable dot-notation */
import { expect } from 'chai';
import DictionaryNode from './dictionary-node';

const WORDS = ['abc', 'abcd', 'abcde', 'xyz', 'wxyz', 'ablmnop'];

describe('DictionaryNode', () => {
    let node: DictionaryNode;

    beforeEach(() => {
        node = new DictionaryNode();
    });

    describe('addWord', () => {
        it('should have word after addWord', () => {
            for (const word of WORDS) {
                expect(node.wordExists(word)).to.be.false;
                node['addWord'](word);
                expect(node.wordExists(word)).to.be.true;
            }
        });
    });

    describe('word exists', () => {
        const word = 'abcdefg';

        beforeEach(() => {
            node['addWord'](word);
        });

        it('should return true if word exists', () => {
            expect(node.wordExists(word)).to.be.true;
        });

        it('should be false if node does not exists', () => {
            expect(node.wordExists('xyz')).to.be.false;
        });

        it('should be false if node exists but is not a word', () => {
            expect(node.wordExists(word.slice(0, 3))).to.be.false;
        });
    });

    describe('getValue', () => {
        it('should return value', () => {
            const expected = 'expcted-value';
            node['value'] = expected;
            expect(node.getValue()).to.equal(expected);
        });
    });

    describe('getDepth', () => {
        it('should return depth', () => {
            const expected = 4;
            node['depth'] = expected;
            expect(node.getDepth()).to.equal(expected);
        });
    });

    describe('getNode', () => {
        const word = 'abcdefg';

        beforeEach(() => {
            node['addWord'](word);
        });

        it('should return node', () => {
            const foundNode = node.getNode(word);

            expect(foundNode).to.not.be.undefined;
            expect(foundNode?.getValue()).to.equal(word);
        });

        it('should return node even if not a word', () => {
            const slicedWord = word.slice(0, 3);
            const foundNode = node.getNode(slicedWord);

            expect(foundNode).to.not.be.undefined;
            expect(foundNode?.getValue()).to.be.undefined;
        });
    });
});
