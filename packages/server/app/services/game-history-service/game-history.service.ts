/* eslint-disable @typescript-eslint/naming-convention */
import { ANALYSIS_TABLE, GAME_HISTORY_PLAYER_TABLE, GAME_HISTORY_TABLE } from '@app/constants/services-constants/database-const';
import DatabaseService from '@app/services/database-service/database.service';
import 'mock-fs'; // required when running test. Otherwise compiler cannot resolve fs, path and __dirname
import { Service } from 'typedi';
import { GameHistory, GameHistoryCreation, GameHistoryForUser, GameHistoryPlayer } from '@common/models/game-history';
import { TypeOfId } from '@common/types/id';
import { User } from '@common/models/user';
import { AnalysisData } from '@common/models/analysis';

@Service()
export default class GameHistoriesService {
    constructor(private databaseService: DatabaseService) {}

    private get table() {
        return this.databaseService.knex<GameHistory>(GAME_HISTORY_TABLE);
    }

    private get tableHistoryPlayer() {
        return this.databaseService.knex<GameHistoryPlayer>(GAME_HISTORY_PLAYER_TABLE);
    }

    async addGameHistory({ gameHistory, players }: GameHistoryCreation, existingIdGameHistory?: number): Promise<TypeOfId<GameHistory>> {
        let idGameHistory = existingIdGameHistory;
        if (!idGameHistory) {
            [{ idGameHistory }] = await this.table.insert(gameHistory, ['idGameHistory']);
        } else {
            await this.table.where({ idGameHistory }).update(gameHistory);
        }

        await Promise.all(players.map((player) => this.tableHistoryPlayer.insert({ ...player, idGameHistory })));
        return idGameHistory ?? -1;
    }

    async getGameHistory(idUser: TypeOfId<User>): Promise<GameHistoryForUser[]> {
        return await this.table
            .select('startTime', 'endTime', 'hasAbandoned', 'score', 'isWinner', 'ratingVariation', 'idAnalysis')
            .leftJoin<GameHistoryPlayer>(
                GAME_HISTORY_PLAYER_TABLE,
                `${GAME_HISTORY_TABLE}.idGameHistory`,
                `${GAME_HISTORY_PLAYER_TABLE}.idGameHistory`,
            )
            .leftJoin<AnalysisData>(ANALYSIS_TABLE, (builder) => {
                builder
                    .on(`${GAME_HISTORY_TABLE}.idGameHistory`, '=', `${ANALYSIS_TABLE}.idGameHistory`)
                    .andOn(`${ANALYSIS_TABLE}.idUser`, '=', `${GAME_HISTORY_PLAYER_TABLE}.idUser`);
            })
            .where(`${GAME_HISTORY_PLAYER_TABLE}.idUser`, idUser)
            .orderBy('startTime', 'desc');
    }

    async resetGameHistories(): Promise<void> {
        await this.table.delete();
        await this.tableHistoryPlayer.delete();
    }
}
