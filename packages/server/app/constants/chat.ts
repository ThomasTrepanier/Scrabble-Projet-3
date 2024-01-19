import { ChannelCreation } from '@common/models/chat/channel';

export const GENERAL_CHANNEL: ChannelCreation = {
    name: 'general',
    canQuit: false,
    private: false,
    default: true,
};

export const GROUP_CHANNEL: ChannelCreation = {
    name: 'Groupe de partie',
    canQuit: false,
    private: true,
    default: false,
};

export const DEFAULT_CHANNELS: ChannelCreation[] = [GENERAL_CHANNEL];

export const NO_GROUP_CHANNEL_ID_NEEDED = -1;
