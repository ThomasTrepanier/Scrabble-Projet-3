import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ROUTE_GAME_CREATION, ROUTE_GROUPS } from '@app/constants/routes-constants';
import { GameVisibility } from '@common/models/game-visibility';
import { Group } from '@common/models/group';
import { UNKOWN_USER } from '@common/models/user';
import { VirtualPlayerLevel } from '@common/models/virtual-player-level';
@Component({
    selector: 'app-group-info-detailed',
    templateUrl: './group-info-detailed.component.html',
    styleUrls: ['./group-info-detailed.component.scss'],
})
export class GroupInfoDetailedComponent {
    @Input() group: Group;
    @Input() isHost: boolean;
    @Input() isGroupEmpty: boolean;
    @Input() roundTime: string;
    @Output() startGame: EventEmitter<void>;
    gameVisibilities = GameVisibility;
    routeGameCreation = ROUTE_GAME_CREATION;
    routeGroups = ROUTE_GROUPS;

    constructor() {
        this.startGame = new EventEmitter<void>();
        this.group = {
            groupId: '0',
            password: '',
            user1: UNKOWN_USER,
            maxRoundTime: 0,
            gameVisibility: GameVisibility.Public,
            virtualPlayerLevel: VirtualPlayerLevel.Beginner,
            numberOfObservers: 0,
        };
    }

    start(): void {
        this.startGame.emit();
    }
}
