import { PublicUser } from "./user";

export interface RequestingUsers {
    requestingPlayers : PublicUser[];
    requestingObservers : PublicUser[];
}