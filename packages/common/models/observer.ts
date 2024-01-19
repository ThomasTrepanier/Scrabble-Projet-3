import { PublicUser } from "./user";

export interface Observer {
    publicUser: PublicUser;
    id: string;
}