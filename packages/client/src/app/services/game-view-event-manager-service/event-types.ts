import { PlaceActionPayload } from '@app/classes/actions/action-data';
import { InitializeGameData } from '@app/classes/communication/game-config';
import { Message } from '@app/classes/communication/message';
import { TilePlacement } from '@common/models/tile-placement';
import { BehaviorSubject, Subject } from 'rxjs';

export interface EventTypes {
    tileRackUpdate: string;
    noActiveGame: void;
    reRender: void;
    newMessage: Message | null;
    gameInitialized: InitializeGameData | undefined;
    resetServices: void;
    endOfGame: string[];
    tilePlacement: TilePlacement[];
}

type GenericEventClass<T> = {
    [S in keyof T]: Subject<T[S]>;
};

export interface EventClass extends GenericEventClass<EventTypes> {
    newMessage: BehaviorSubject<Message | null>;
    usedTiles: BehaviorSubject<PlaceActionPayload | undefined>;
    gameInitialized: BehaviorSubject<InitializeGameData | undefined>;
}
