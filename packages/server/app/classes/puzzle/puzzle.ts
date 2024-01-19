import { Puzzle as PuzzleCommon } from '@common/models/puzzle';
import { Board } from '@app/classes/board';
import { TypeOfId } from '@common/types/id';
import { User } from '@common/models/user';

export interface Puzzle extends PuzzleCommon {
    board: Board;
}

export interface ActivePuzzle {
    puzzle: Puzzle;
    isDaily: boolean;
}

export interface CachedPuzzle {
    puzzle: Puzzle;
    date: Date;
}

export interface DailyPuzzle {
    idUser: TypeOfId<User>;
    date: Date;
    score: number;
}
