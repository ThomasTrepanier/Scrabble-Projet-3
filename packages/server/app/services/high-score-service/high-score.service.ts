import { HIGH_SCORE_COUNT } from '@app/constants/game-constants';
import { DEFAULT_HIGH_SCORES_RELATIVE_PATH, HIGH_SCORE_PLAYER_TABLE, HIGH_SCORE_TABLE } from '@app/constants/services-constants/database-const';
import DatabaseService from '@app/services/database-service/database.service';
import { aggregate } from '@app/utils/aggregate/aggregate';
import { HighScore, HighScorePlayer, HighScoresData, HighScoreWithPlayers } from '@common/models/high-score';
import { NoId } from '@common/types/id';
import { promises } from 'fs';
import 'mock-fs'; // required when running test. Otherwise compiler cannot resolve fs, path and __dirname
import { join } from 'path';
import { Service } from 'typedi';

@Service()
export default class HighScoresService {
    constructor(private databaseService: DatabaseService) {}

    private get table() {
        return this.databaseService.knex<HighScore>(HIGH_SCORE_TABLE);
    }

    private get tableNames() {
        return this.databaseService.knex<HighScorePlayer>(HIGH_SCORE_PLAYER_TABLE);
    }

    private static async fetchDefaultHighScores(): Promise<NoId<HighScoreWithPlayers>[]> {
        const filePath = join(__dirname, DEFAULT_HIGH_SCORES_RELATIVE_PATH);
        const dataBuffer = await promises.readFile(filePath, 'utf-8');
        const defaultHighScores: HighScoresData = JSON.parse(dataBuffer);
        return defaultHighScores.highScores;
    }

    async getAllHighScore(): Promise<NoId<HighScoreWithPlayers>[]> {
        const highScores = await this.table
            .select('*')
            .leftJoin<HighScorePlayer>(HIGH_SCORE_PLAYER_TABLE, 'HighScore.idHighScore', 'HighScorePlayer.idHighScore');

        return aggregate(highScores, {
            idKey: 'idHighScore',
            fieldKey: 'names',
            mainItemKeys: ['score'],
            aggregatedItemKeys: 'name',
        });
    }

    async addHighScore(name: string, score: number): Promise<void> {
        const sortedHighScores = await this.getHighScores();

        const lowestHighScore = sortedHighScores[0];
        if (sortedHighScores.length >= HIGH_SCORE_COUNT && lowestHighScore.score > score) return;

        const presentHighScore = sortedHighScores.find((highScore) => highScore.score === score);

        if (presentHighScore) {
            await this.updateHighScore(name, presentHighScore);
            return;
        }

        await this.replaceHighScore(name, score, sortedHighScores.length >= HIGH_SCORE_COUNT ? sortedHighScores[0] : undefined);
    }

    async resetHighScores(): Promise<void> {
        await this.tableNames.delete();
        await this.table.delete();
        await this.populateDb();
    }

    private async updateHighScore(name: string, highScore: HighScore): Promise<void> {
        const existingNames = await this.tableNames.select('*').where('idHighScore', highScore.idHighScore);

        if (existingNames.some(({ name: existingName }) => existingName === name)) return;

        await this.tableNames.insert({ idHighScore: highScore.idHighScore, name });
    }

    private async replaceHighScore(name: string, score: number, oldHighScore?: HighScore): Promise<void> {
        if (oldHighScore) {
            await this.tableNames.delete().where('idHighScore', oldHighScore.idHighScore);
            await this.table.delete().where('idHighScore', oldHighScore.idHighScore);
        }

        const [{ idHighScore }] = await this.table.insert({ score }, ['idHighScore']);

        await this.tableNames.insert({ idHighScore, name });
    }

    private async getHighScores(): Promise<HighScore[]> {
        const q = this.table.select('*').orderBy('score');

        return q;
    }

    private async populateDb(): Promise<void> {
        await Promise.all(
            await (await HighScoresService.fetchDefaultHighScores()).map(async ({ names, score }) => this.replaceHighScore(names[0], score)),
        );
    }
}
