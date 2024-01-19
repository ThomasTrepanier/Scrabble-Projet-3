import { NoId } from "../schema";

export interface Channel {
  idChannel: number;
  name: string;
  canQuit: boolean;
  private: boolean;
  default: boolean;
}

export type ChannelCreation = Partial<NoId<Channel>> & Pick<Channel, 'name'>;

export interface UserChannel {
  idChannel: number;
  idUser: number;
}
