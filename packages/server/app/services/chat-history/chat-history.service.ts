import { CHAT_HISTORY_TABLE } from '@app/constants/services-constants/database-const';
import DatabaseService from '@app/services/database-service/database.service';
import { Channel } from '@common/models/chat/channel';
import { ChannelMessage, ChatHistoryMessage } from '@common/models/chat/chat-message';
import { UNKOWN_USER } from '@common/models/user';
import { TypeOfId } from '@common/types/id';
import { Service } from 'typedi';
import { UserService } from '@app/services/user-service/user-service';

@Service()
export class ChatHistoryService {
    constructor(private databaseService: DatabaseService, private userService: UserService) {}

    async saveMessage(message: ChannelMessage): Promise<void> {
        try {
            const user = await this.userService.getUserByEmail(message.message.sender.email);

            await this.table.insert({
                idChannel: message.idChannel,
                idUser: user.idUser,
                content: message.message.content,
                date: message.message.date,
            });
        } catch {
            return;
        }
    }

    async getChannelHistory(idChannel: TypeOfId<Channel>): Promise<ChannelMessage[]> {
        const channelHistory = await this.table.select('*').where('idChannel', idChannel);

        return await Promise.all(
            channelHistory.map(async (message: ChatHistoryMessage) => {
                let user;
                try {
                    user = await this.userService.getUserById(message.idUser);
                } catch {
                    user = UNKOWN_USER;
                }

                return {
                    idChannel: message.idChannel,
                    message: {
                        sender: { email: user.email, username: user.username, avatar: user.avatar },
                        content: message.content,
                        date: message.date,
                    },
                };
            }),
        );
    }

    async deleteChannelHistory(idChannel: TypeOfId<Channel>): Promise<void> {
        await this.table.delete().where('idChannel', idChannel);
    }

    private get table() {
        return this.databaseService.knex<ChatHistoryMessage>(CHAT_HISTORY_TABLE);
    }
}
