import { PlayerData } from '@app/classes/communication/player-data';
import { AbstractObjective } from '@app/classes/objectives/abstract-objective/abstract-objective';
import { ObjectiveUpdate } from '@app/classes/objectives/objective-utils';
import { ObjectiveValidationParameters } from '@app/classes/objectives/validation-parameters';
import { Tile } from '@app/classes/tile';
import { AuthentificationService } from '@app/services/authentification-service/authentification.service';
import ObjectivesService from '@app/services/objective-service/objective.service';
import { Observer } from '@common/models/observer';
import { PublicUser, User } from '@common/models/user';
import { TypeOfId } from '@common/types/id';
import { Container } from 'typedi';
import { UserId } from '@app/classes/user/connected-user-types';

export default class Player implements Observer {
    publicUser: PublicUser;
    score: number;
    tiles: Tile[];
    id: string;
    isConnected: boolean;
    initialRating: number;
    adjustedRating: number;
    private idUserPrivate: UserId;
    private objectives: AbstractObjective[];
    private readonly objectiveService: ObjectivesService;

    constructor(id: string, publicUser: PublicUser) {
        this.id = id;
        this.publicUser = publicUser;
        this.score = 0;
        this.tiles = [];
        this.isConnected = true;
        this.objectiveService = Container.get(ObjectivesService);
    }

    getTileRackPoints(): number {
        return this.tiles.reduce((prev, next) => prev + next.value, 0);
    }

    hasTilesLeft(): boolean {
        return this.tiles.length > 0;
    }

    endGameMessage(): string {
        return `${this.publicUser.username} : ${this.tilesToString()}`;
    }

    getObjectives(): AbstractObjective[] {
        return [...this.objectives];
    }

    resetObjectivesProgression(): void {
        [...this.objectives]
            .filter((objective: AbstractObjective) => !objective.isCompleted() && objective.shouldResetOnInvalidWord)
            .forEach((objective: AbstractObjective) => {
                objective.progress = 0;
            });
    }

    initializeObjectives(publicObjectives: Set<AbstractObjective>, privateObjective: AbstractObjective): void {
        const publicObjectiveClones: AbstractObjective[] = [...publicObjectives.values()].map((objective: AbstractObjective) => objective.clone());
        this.objectives = [...publicObjectiveClones, privateObjective];
    }

    validateObjectives(validationParameters: ObjectiveValidationParameters): ObjectiveUpdate | undefined {
        return this.objectiveService.validatePlayerObjectives(this, validationParameters.game, validationParameters);
    }

    copyPlayerInfo(oldPlayer: Player): PlayerData {
        this.score = oldPlayer.score;
        this.tiles = oldPlayer.tiles;
        this.objectives = oldPlayer.objectives;
        return { id: oldPlayer.id, newId: this.id, publicUser: this.publicUser };
    }

    convertToPlayerData(): PlayerData {
        return {
            id: this.id,
            publicUser: this.publicUser,
            score: this.score,
            tiles: this.tiles,
            isConnected: this.isConnected,
        };
    }

    get idUser(): TypeOfId<User> {
        if (this.idUserPrivate) return this.idUserPrivate;
        this.idUserPrivate = Container.get(AuthentificationService).connectedUsers.getUserId(this.id);
        return this.idUserPrivate;
    }

    set idUser(idUser: TypeOfId<User>) {
        this.idUserPrivate = idUser;
    }

    private tilesToString(): string {
        return this.tiles.reduce((prev, next) => prev + next.letter.toLocaleLowerCase(), '');
    }
}
