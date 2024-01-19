/* eslint-disable @typescript-eslint/naming-convention */
import { UserId } from '@app/classes/user/connected-user-types';
import { ANALYSIS_TABLE, CRITICAL_MOMENTS_TABLE, PLACEMENT_TABLE } from '@app/constants/services-constants/database-const';
import { Service } from 'typedi';
import DatabaseService from '@app/services/database-service/database.service';
import { Orientation, Position } from '@app/classes/board';
import { HttpException } from '@app/classes/http-exception/http-exception';
import { NO_ANALYSIS_FOUND, NO_ANALYSIS_FOUND_ID } from '@app/constants/services-errors';
import { StatusCodes } from 'http-status-codes';
import { ActionType } from '@common/models/action';
import { StringConversion } from '@app/utils/string-conversion/string-conversion';
import { Analysis, AnalysisData, CriticalMoment, CriticalMomentData, PlacementData } from '@common/models/analysis';
import { ScoredWordPlacement } from '@common/models/word-finding';
import { TypeOfId } from '@common/types/id';
import { GameHistory } from '@common/models/game-history';
import { BOARD_SIZE } from '@app/constants/game-constants';
import { Board, Tile } from '@common/models/game';
import BoardService from '@app/services/board-service/board.service';

@Service()
export class AnalysisPersistenceService {
    constructor(private readonly databaseService: DatabaseService, private boardService: BoardService) {}

    async requestAnalysis(idGameHistory: TypeOfId<GameHistory>, idUser: UserId): Promise<Analysis> {
        if (!(await this.doesMatchingAnalysisExist(idGameHistory, idUser))) throw new HttpException(NO_ANALYSIS_FOUND, StatusCodes.NOT_FOUND);

        const analysisData = await this.analysisTable
            .select(
                `${CRITICAL_MOMENTS_TABLE}.*`,
                'bp.score as bp_score',
                'bp.tilesToPlace as bp_tilesToPlace',
                'bp.isHorizontal as bp_isHorizontal',
                'bp.row as bp_row',
                'bp.column as bp_column',
                'pp.score as pp_score',
                'pp.tilesToPlace as pp_tilesToPlace',
                'pp.isHorizontal as pp_isHorizontal',
                'pp.row as pp_row',
                'pp.column as pp_column',
            )
            .join(CRITICAL_MOMENTS_TABLE, `${ANALYSIS_TABLE}.idAnalysis`, '=', `${CRITICAL_MOMENTS_TABLE}.idAnalysis`)
            .join(PLACEMENT_TABLE + ' as bp', `${CRITICAL_MOMENTS_TABLE}.idBestPlacement`, '=', 'bp.idPlacement')
            .leftJoin(PLACEMENT_TABLE + ' as pp', `${CRITICAL_MOMENTS_TABLE}.idPlayedPlacement`, '=', 'pp.idPlacement')
            .where({
                'Analysis.idGameHistory': idGameHistory,
                'Analysis.idUser': idUser,
            });
        const analysis: Analysis = { idGameHistory, idUser, criticalMoments: [] };
        for (const criticalMomentData of analysisData) {
            analysis.criticalMoments.push(await this.convertDataToCriticalMoment(criticalMomentData));
        }
        return analysis;
    }

    async getIdGame(idAnalysis: TypeOfId<Analysis>, idUser: UserId): Promise<TypeOfId<GameHistory>> {
        const analysisData = await this.analysisTable.select('*').where({ idAnalysis, idUser }).limit(1);
        if (analysisData.length <= 0) {
            throw new HttpException(NO_ANALYSIS_FOUND_ID, StatusCodes.BAD_REQUEST);
        }

        return analysisData[0].idGameHistory;
    }

    async addAnalysis(idGameHistory: TypeOfId<GameHistory>, idUser: UserId, analysis: Analysis) {
        const insertedValue = await this.analysisTable.insert({ idGameHistory, idUser }).returning('idAnalysis');

        for (const criticalMoment of analysis.criticalMoments) {
            const idBestPlacement = await this.addPlacement(criticalMoment.bestPlacement);
            let idPlayedPlacement;
            if (criticalMoment.playedPlacement) idPlayedPlacement = await this.addPlacement(criticalMoment.playedPlacement);

            await this.criticalMomentTable.insert({
                actionType: criticalMoment.actionType,
                tiles: criticalMoment.tiles.map((tile) => StringConversion.convertTileToStringDatabase(tile)).join(''),
                board: this.convertBoardToString(criticalMoment.board),
                idPlayedPlacement,
                idBestPlacement,
                idAnalysis: insertedValue[0].idAnalysis,
            });
        }
    }

    private async doesMatchingAnalysisExist(idGameHistory: TypeOfId<GameHistory>, idUser: UserId): Promise<boolean> {
        const analysisData = await this.analysisTable.select('*').where({ idGameHistory, idUser }).limit(1);
        return analysisData.length > 0;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private async convertDataToCriticalMoment(criticalMomentData: any): Promise<CriticalMoment> {
        return {
            tiles: criticalMomentData.tiles.split('').map((tileString: string) => StringConversion.convertStringToTile(tileString)),
            actionType: criticalMomentData.actionType as ActionType,
            board: this.convertStringToBoard(criticalMomentData.board),
            bestPlacement: await this.convertDataToPlacement({
                tilesToPlace: criticalMomentData.bp_tilesToPlace,
                isHorizontal: criticalMomentData.bp_isHorizontal,
                score: criticalMomentData.bp_score,
                row: criticalMomentData.bp_row,
                column: criticalMomentData.bp_column,
            }),
            playedPlacement:
                (criticalMomentData.actionType as ActionType) === ActionType.PLACE
                    ? await this.convertDataToPlacement({
                          tilesToPlace: criticalMomentData.pp_tilesToPlace,
                          isHorizontal: criticalMomentData.pp_isHorizontal,
                          score: criticalMomentData.pp_score,
                          row: criticalMomentData.pp_row,
                          column: criticalMomentData.pp_column,
                      })
                    : undefined,
        };
    }
    private async convertDataToPlacement(placementData: Omit<PlacementData, 'idPlacement'>): Promise<ScoredWordPlacement> {
        return {
            tilesToPlace: placementData.tilesToPlace.split('').map((tileString) => StringConversion.convertStringToTile(tileString)),
            orientation: placementData.isHorizontal ? Orientation.Horizontal : Orientation.Vertical,
            startPosition: new Position(placementData.row, placementData.column),
            score: placementData.score,
        };
    }

    private async addPlacement(placement: ScoredWordPlacement): Promise<number> {
        const insertedValue = await this.placementTable
            .insert({
                tilesToPlace: placement.tilesToPlace.map((tile) => StringConversion.convertTileToStringDatabase(tile)).join(''),
                isHorizontal: placement.orientation === Orientation.Horizontal,
                score: placement.score,
                row: placement.startPosition.row,
                column: placement.startPosition.column,
            })
            .returning('idPlacement');
        return insertedValue[0].idPlacement;
    }

    private convertBoardToString(board: Board): string {
        let outputString = '';
        for (const row of board.grid) {
            for (const square of row) {
                if (!square.tile) {
                    outputString += ' ';
                } else {
                    outputString += StringConversion.convertTileToStringDatabase(square.tile);
                }
            }
        }
        return outputString;
    }

    private convertStringToBoard(boardString: string): Board {
        const board = this.boardService.initializeBoard();
        for (let i = 0; i < boardString.length; i++) {
            // check if this is the correct position
            const position = new Position(Math.floor(i / BOARD_SIZE.y), i % BOARD_SIZE.x);
            let tile: Tile;
            if (boardString[i] === ' ') continue;
            else {
                tile = StringConversion.convertStringToTile(boardString[i]);
            }
            board.getSquare(position).tile = tile;
        }
        return board;
    }

    private get analysisTable() {
        return this.databaseService.knex<AnalysisData>(ANALYSIS_TABLE);
    }

    private get criticalMomentTable() {
        return this.databaseService.knex<CriticalMomentData>(CRITICAL_MOMENTS_TABLE);
    }

    private get placementTable() {
        return this.databaseService.knex<PlacementData>(PLACEMENT_TABLE);
    }
}
