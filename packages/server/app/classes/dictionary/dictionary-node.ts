export default class DictionaryNode {
    protected depth: number;
    private value: string | undefined;
    private nodes: Map<string, DictionaryNode>;

    constructor(value?: string, depth: number = 0) {
        this.nodes = new Map();
        this.value = value;
        this.depth = depth;
    }

    wordExists(word: string): boolean {
        return this.getNode(word)?.value !== undefined;
    }

    getValue(): string | undefined {
        return this.value;
    }

    getDepth(): number {
        return this.depth;
    }

    getNode(word: string): DictionaryNode | undefined {
        const [key, rest] = this.separateWord(word);
        const node = this.nodes.get(key);

        if (!node) return undefined;
        if (rest.length === 0) return node;
        return node.getNode(rest);
    }

    getRandomNode(): DictionaryNode | undefined {
        if (this.nodes.size === 0) return;

        const keys = [...this.nodes.keys()];
        return this.nodes.get(keys[Math.floor(Math.random() * keys.length)]);
    }

    getNodes(): DictionaryNode[] {
        return [...this.nodes.values()];
    }

    protected addWord(word: string, value = '', depth = 0): void {
        const [key, rest] = this.separateWord(word);

        if (rest.length > 0) {
            this.getOrCreateNode(key, undefined, depth).addWord(rest, value + key, depth + 1);
        } else {
            this.getOrCreateNode(key, value + key, depth);
        }
    }

    private getOrCreateNode(key: string, value?: string, depth?: number): DictionaryNode {
        let node = this.nodes.get(key);
        if (!node) {
            node = new DictionaryNode(value, depth);
            this.nodes.set(key, node);
        }
        return node;
    }

    private separateWord(entry: string): [key: string, rest: string] {
        return [entry[0], entry.slice(1)];
    }
}
