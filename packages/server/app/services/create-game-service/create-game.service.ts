import { GameConfig } from '@app/classes/game/game-config';
import WaitingRoom from '@app/classes/game/waiting-room';
import Player from '@app/classes/player/player';
import { Service } from 'typedi';
import { ChatService } from '@app/services/chat-service/chat.service';
import { GROUP_CHANNEL } from '@app/constants/chat';
import { Channel } from '@common/models/chat/channel';
import { UserId } from '@app/classes/user/connected-user-types';
import { GroupData } from '@common/models/group';

@Service()
export class CreateGameService {
    constructor(private readonly chatService: ChatService) {}

    async createMultiplayerGame(groupData: GroupData, userId: UserId, playerId: string): Promise<WaitingRoom> {
        const config = this.generateGameConfig(groupData, playerId);

        const channel: Channel = await this.chatService.createChannel(GROUP_CHANNEL, userId);

        return new WaitingRoom(config, channel.idChannel);
    }

    private generateGameConfig(groupData: GroupData, playerId: string): GameConfig {
        return {
            player1: new Player(playerId, groupData.user1),
            maxRoundTime: groupData.maxRoundTime,
            virtualPlayerLevel: groupData.virtualPlayerLevel,
            gameVisibility: groupData.gameVisibility,
            password: groupData.password,
        };
    }
}
