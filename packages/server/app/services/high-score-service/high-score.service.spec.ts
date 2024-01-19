/* eslint-disable dot-notation */
import * as mock from 'mock-fs'; // required when running test. Otherwise compiler cannot resolve fs, path and __dirname
import { Container } from 'typedi';
import { ServicesTestingUnit } from '@app/services/service-testing-unit/services-testing-unit.spec';
import HighScoresService from './high-score.service';
import { expect } from 'chai';
import { HIGH_SCORE_COUNT } from '@app/constants/game-constants';
import { DEFAULT_HIGH_SCORES_RELATIVE_PATH, HIGH_SCORE_PLAYER_TABLE, HIGH_SCORE_TABLE } from '@app/constants/services-constants/database-const';
import { join } from 'path';
import { NoId } from '@common/types/id';
import { HighScore, HighScorePlayer, HighScoresData, HighScoreWithPlayers } from '@common/models/high-score';

const HIGH_SCORE_CLASSIC_1: NoId<HighScoreWithPlayers> = {
    names: ['testname1', 'testname2'],
    score: 13,
};

const HIGH_SCORE_CLASSIC_2: NoId<HighScoreWithPlayers> = {
    names: ['weed', 'legal'],
    score: 420,
};

const HIGH_SCORE_CLASSIC_3: NoId<HighScoreWithPlayers> = {
    names: ['nice'],
    score: 69,
};

const HIGH_SCORE_LOG2990_1: NoId<HighScoreWithPlayers> = {
    names: ['nikolay'],
    score: 666,
};

const HIGH_SCORE_LOG2990_2: NoId<HighScoreWithPlayers> = {
    names: ['michel'],
    score: 60,
};

const INITIAL_HIGH_SCORES_CLASSIC: NoId<HighScoreWithPlayers>[] = [HIGH_SCORE_CLASSIC_1, HIGH_SCORE_CLASSIC_2, HIGH_SCORE_CLASSIC_3];
const INITIAL_HIGH_SCORES_LOG2990: NoId<HighScoreWithPlayers>[] = [HIGH_SCORE_LOG2990_1, HIGH_SCORE_LOG2990_2];

const INITIAL_HIGH_SCORES: NoId<HighScoreWithPlayers>[] = INITIAL_HIGH_SCORES_CLASSIC.concat(INITIAL_HIGH_SCORES_LOG2990);

const mockInitialHighScores: HighScoresData = {
    highScores: INITIAL_HIGH_SCORES,
};

// mockPaths must be of type any because keys must be dynamic
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockPaths: any = [];
mockPaths[join(__dirname, DEFAULT_HIGH_SCORES_RELATIVE_PATH)] = JSON.stringify(mockInitialHighScores);

const DEFAULT_HIGH_SCORE: HighScore = {
    idHighScore: 1,
    score: 100,
};
const DEFAULT_HIGH_SCORE_PLAYER_1: HighScorePlayer = {
    idHighScore: 1,
    name: 'p1',
};
const DEFAULT_HIGH_SCORE_PLAYER_2: HighScorePlayer = {
    idHighScore: 1,
    name: 'p2',
};

describe('HighScoresService', () => {
    let testingUnit: ServicesTestingUnit;
    let highScoresService: HighScoresService;

    beforeEach(async () => {
        testingUnit = new ServicesTestingUnit();
        await testingUnit.withMockDatabaseService();
    });

    beforeEach(() => {
        highScoresService = Container.get(HighScoresService);
    });

    afterEach(() => {
        testingUnit.restore();
    });

    describe('getAllHighScore', () => {
        it('should return empty array if empty', async () => {
            expect((await highScoresService.getAllHighScore()).length).to.equal(0);
        });

        it('should return high score array', async () => {
            await highScoresService['table'].insert(DEFAULT_HIGH_SCORE);

            expect((await highScoresService.getAllHighScore()).length).to.equal(1);
        });

        it('should return high score with two names if two names with same score', async () => {
            await highScoresService['table'].insert(DEFAULT_HIGH_SCORE);
            await highScoresService['tableNames'].insert(DEFAULT_HIGH_SCORE_PLAYER_1);
            await highScoresService['tableNames'].insert(DEFAULT_HIGH_SCORE_PLAYER_2);

            expect((await highScoresService.getAllHighScore())[0].names.length).to.equal(2);
        });
    });

    describe('addHighScore', () => {
        it('should add a high score and a name if empty', async () => {
            await highScoresService.addHighScore(DEFAULT_HIGH_SCORE_PLAYER_1.name, DEFAULT_HIGH_SCORE.score);

            expect((await highScoresService['table'].select('*')).length).to.equal(1);
            expect((await highScoresService['tableNames'].select('*')).length).to.equal(1);
        });

        it('should add a name if high score already exists', async () => {
            await highScoresService.addHighScore(DEFAULT_HIGH_SCORE_PLAYER_1.name, DEFAULT_HIGH_SCORE.score);
            await highScoresService.addHighScore(DEFAULT_HIGH_SCORE_PLAYER_2.name, DEFAULT_HIGH_SCORE.score);

            expect((await highScoresService['table'].select('*')).length).to.equal(1);
            expect((await highScoresService['tableNames'].select('*')).length).to.equal(2);
        });

        it('should not add a name if high score and name already exists', async () => {
            await highScoresService.addHighScore(DEFAULT_HIGH_SCORE_PLAYER_1.name, DEFAULT_HIGH_SCORE.score);
            await highScoresService.addHighScore(DEFAULT_HIGH_SCORE_PLAYER_1.name, DEFAULT_HIGH_SCORE.score);

            expect((await highScoresService['table'].select('*')).length).to.equal(1);
            expect((await highScoresService['tableNames'].select('*')).length).to.equal(1);
        });

        it('should not add a high score if is lower than existing ones', async () => {
            for (let i = 0; i < HIGH_SCORE_COUNT; ++i) {
                await highScoresService.addHighScore(`${DEFAULT_HIGH_SCORE_PLAYER_1.name}-${i}`, DEFAULT_HIGH_SCORE.score - i);
            }

            expect((await highScoresService['table'].select('*')).length).to.equal(HIGH_SCORE_COUNT);

            await highScoresService.addHighScore(`${DEFAULT_HIGH_SCORE_PLAYER_1.name}-not-good`, 0);

            expect((await highScoresService['table'].select('*')).length).to.equal(HIGH_SCORE_COUNT);
        });

        it('should replace a high score if is higher than existing ones', async () => {
            for (let i = 0; i < HIGH_SCORE_COUNT; ++i) {
                await highScoresService.addHighScore(`${DEFAULT_HIGH_SCORE_PLAYER_1.name}-${i}`, DEFAULT_HIGH_SCORE.score + i);
            }

            expect((await highScoresService['table'].select('*')).length).to.equal(HIGH_SCORE_COUNT);

            const veryGoodPlayerName = `${DEFAULT_HIGH_SCORE_PLAYER_1.name}-very-good`;
            await highScoresService.addHighScore(veryGoodPlayerName, Number.MAX_SAFE_INTEGER);

            expect((await highScoresService['table'].select('*')).length).to.equal(HIGH_SCORE_COUNT);
            expect(
                (
                    await highScoresService['table']
                        .select('*')
                        .leftJoin<HighScorePlayer>(
                            HIGH_SCORE_PLAYER_TABLE,
                            `${HIGH_SCORE_PLAYER_TABLE}.idHighScore`,
                            `${HIGH_SCORE_TABLE}.idHighScore`,
                        )
                        .orderBy('score', 'desc')
                        .limit(1)
                )[0].name,
            ).to.equal(veryGoodPlayerName);
        });
    });

    describe('resetHighScores', () => {
        it('should insert default data', async () => {
            mock(mockPaths);

            await highScoresService.resetHighScores();

            expect((await highScoresService.getAllHighScore()).length).to.equal(INITIAL_HIGH_SCORES.length);

            mock.restore();
        });

        it('should insert default data even if has existing data', async () => {
            mock(mockPaths);

            await highScoresService['table'].insert(DEFAULT_HIGH_SCORE);
            await highScoresService.resetHighScores();

            expect((await highScoresService.getAllHighScore()).length).to.equal(INITIAL_HIGH_SCORES.length);

            mock.restore();
        });
    });
});
