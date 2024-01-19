export interface PuzzleGeneratorParameters {
    /** Minimum word size for board generation. */
    minWordSize: number;
    /** Maximum word size for board generation.
     *
     * Words can be longer than this value on the generated board has they can be combined by a next generated word. */
    maxWordSize: number;
    /** Minimum word count for board generation.
     *
     * There can be less words than this value has words can be combined.
     */
    minWordCount: number;
    /** Maximum word count for board generation. */
    maxWordCount: number;
    /** Distance of a letter for which the placement will be skipped and be placed at the end of the queue.
     *
     * For example, a value of `4` means that a word with pattern `_ _ _ _ X _ _` will be skipped because the fixed letter is too far.
     * Those kind of patterns are harder to find by the algorithm, so it is faster to skip them.
     *
     * A value that is smaller will be faster, but will make the generation appear less random.
     */
    skipPlacementDistanceCutoff: number;
    /** Number of tiles to place to make a bingo */
    bingoWordSize: number;
}
