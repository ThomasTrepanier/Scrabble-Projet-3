import { GameObjectivesData, ObjectiveData } from '@app/classes/communication/objective-data';
import Game from '@app/classes/game/game';
import { HttpException } from '@app/classes/http-exception/http-exception';
import { AbstractObjective } from '@app/classes/objectives/abstract-objective/abstract-objective';
import { GameObjectives, ObjectiveState, ObjectiveUpdate } from '@app/classes/objectives/objective-utils';
import { ObjectiveValidationParameters } from '@app/classes/objectives/validation-parameters';
import Player from '@app/classes/player/player';
import {
    GENERATE_LIST_OF_ALL_OBJECTIVES,
    NUMBER_OF_OBJECTIVES_IN_GAME,
    OBJECTIVE_COMPLETE_MESSAGE,
} from '@app/constants/services-constants/objective-const';
import { INVALID_PLAYER_ID_FOR_GAME, NO_OBJECTIVE_LEFT_IN_POOL } from '@app/constants/services-errors';
import { Random } from '@app/utils/random/random';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

@Service()
export default class ObjectivesService {
    createObjectivesForGame(): GameObjectives {
        const objectivesPool: AbstractObjective[] = this.createObjectivesPool();
        const publicObjectives: Set<AbstractObjective> = new Set([
            this.popObjectiveFromPool(objectivesPool),
            this.popObjectiveFromPool(objectivesPool),
        ]);
        publicObjectives.forEach((objective: AbstractObjective) => {
            objective.isPublic = true;
        });

        const player1Objective: AbstractObjective = this.popObjectiveFromPool(objectivesPool);
        const player2Objective: AbstractObjective = this.popObjectiveFromPool(objectivesPool);

        return { publicObjectives, player1Objective, player2Objective };
    }

    validatePlayerObjectives(player: Player, game: Game, validationParameters: ObjectiveValidationParameters): ObjectiveUpdate | undefined {
        let noObjectivesWereUpdated = true;
        const objectiveUpdate: ObjectiveUpdate = {
            updateData: {},
            completionMessages: [],
        };
        player.getObjectives().forEach((objective: AbstractObjective) => {
            const hasBeenUpdated: boolean = objective.updateObjective(validationParameters);
            if (!hasBeenUpdated) return;

            noObjectivesWereUpdated = false;
            if (objective.isCompleted()) {
                objectiveUpdate.completionMessages.push(this.handleObjectiveCompletion(objective, player, game));
            }
        });
        if (noObjectivesWereUpdated) return undefined;

        objectiveUpdate.updateData = this.addPlayerObjectivesToUpdateData(game, player, objectiveUpdate.updateData);
        objectiveUpdate.updateData = this.addPlayerObjectivesToUpdateData(game, this.findOpponent(game, player), objectiveUpdate.updateData);

        return objectiveUpdate;
    }

    resetPlayerObjectiveProgression(game: Game, player: Player): GameObjectivesData {
        player.resetObjectivesProgression();
        return this.addPlayerObjectivesToUpdateData(game, player, {});
    }

    private handleObjectiveCompletion(objective: AbstractObjective, player: Player, game: Game): string {
        player.score += objective.bonusPoints;
        if (objective.isPublic) {
            const opponentPlayer = this.findOpponent(game, player);
            this.completeOpponentObjective(opponentPlayer, objective);
        }
        return OBJECTIVE_COMPLETE_MESSAGE(objective.name, objective.bonusPoints);
    }

    private completeOpponentObjective(opponentPlayer: Player, playerObjective: AbstractObjective): void {
        opponentPlayer
            .getObjectives()
            .filter((objective: AbstractObjective) => objective.isPublic && objective.name === playerObjective.name)
            .forEach((objective: AbstractObjective) => (objective.state = ObjectiveState.CompletedByOpponent));
    }

    private findOpponent(game: Game, originalPlayer: Player): Player {
        const opponentPlayer: Player | undefined = [game.player1, game.player2].find((player: Player) => player.id !== originalPlayer.id);
        if (!opponentPlayer) throw new HttpException(INVALID_PLAYER_ID_FOR_GAME, StatusCodes.NOT_FOUND);
        return opponentPlayer;
    }

    private addPlayerObjectivesToUpdateData(game: Game, player: Player, updateData: GameObjectivesData): GameObjectivesData {
        const playerObjectivesData: ObjectiveData[] = player.getObjectives().map((objective: AbstractObjective) => objective.convertToData());
        // Hack since we unused
        return { ...updateData, player1Objectives: playerObjectivesData };
    }

    private createObjectivesPool(): AbstractObjective[] {
        return Random.getRandomElementsFromArray(GENERATE_LIST_OF_ALL_OBJECTIVES(), NUMBER_OF_OBJECTIVES_IN_GAME);
    }

    private popObjectiveFromPool(objectivePool: AbstractObjective[]): AbstractObjective {
        const objective: AbstractObjective | undefined = objectivePool.pop();
        if (!objective) throw new HttpException(NO_OBJECTIVE_LEFT_IN_POOL, StatusCodes.INTERNAL_SERVER_ERROR);
        return objective;
    }
}
