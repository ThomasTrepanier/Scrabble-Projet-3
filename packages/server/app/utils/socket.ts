import { Channel } from '@common/models/chat/channel';
import { WithIdOf } from '@common/types/id';

export const getSocketNameFromChannel = <T extends WithIdOf<Channel>>({ idChannel }: T) => {
    return `channel-${idChannel}`;
};
