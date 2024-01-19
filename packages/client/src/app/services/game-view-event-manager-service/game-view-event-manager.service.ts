import { Injectable } from '@angular/core';
import { InitializeGameData } from '@app/classes/communication/game-config';
import { Message } from '@app/classes/communication/message';
import { TilePlacement } from '@app/classes/tile';
import * as SERVICE_ERRORS from '@app/constants/services-errors';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EventClass, EventTypes } from './event-types';
@Injectable({
    providedIn: 'root',
})
export class GameViewEventManagerService {
    /*
     * We need an any here because the payload type of the different subjects
     * could be anything. However, since we add the subjects to the map at its
     * creation, and we assign the subject a payload type, we know that on
     * use, the payload of the subject cannot actually be any, as it has to be the
     * right type to fit the event name.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private eventMap: Map<keyof EventTypes, Subject<any>> = new Map();

    constructor() {
        this.eventMap.set('tileRackUpdate', new Subject<string>());
        this.eventMap.set('noActiveGame', new Subject<void>());
        this.eventMap.set('reRender', new Subject<void>());
        this.eventMap.set('newMessage', new BehaviorSubject<Message | null>(null));
        this.eventMap.set('gameInitialized', new BehaviorSubject<InitializeGameData | undefined>(undefined));
        this.eventMap.set('resetServices', new Subject<void>());
        this.eventMap.set('endOfGame', new Subject<string[]>());
        this.eventMap.set('tilePlacement', new Subject<TilePlacement[]>());
    }

    emitGameViewEvent<T extends keyof EventTypes, S extends EventTypes[T]>(eventType: T, payload?: S): void {
        this.getSubjectFromMap(eventType).next(payload);
    }

    subscribeToGameViewEvent<T extends keyof EventTypes, S extends EventTypes[T]>(
        eventType: T,
        destroy$: Observable<boolean>,
        next: (payload: S) => void,
    ): Subscription {
        return this.getSubjectFromMap<T, S>(eventType).pipe(takeUntil(destroy$)).subscribe(next);
    }

    getGameViewEventValue<T extends keyof EventTypes, S extends EventClass[T], U extends EventTypes[T]>(
        eventType: S extends BehaviorSubject<U> ? T : never,
    ): U {
        const subject = this.eventMap.get(eventType);

        if (subject instanceof BehaviorSubject) return subject.value;
        if (!subject) throw new Error(SERVICE_ERRORS.NO_SUBJECT_FOR_EVENT);
        throw new Error(SERVICE_ERRORS.IS_NOT_BEHAVIOR_OBJECT);
    }

    private getSubjectFromMap<T extends keyof EventTypes, S extends EventTypes[T]>(eventType: T): Subject<S> {
        if (!this.eventMap.get(eventType)) {
            throw new Error(SERVICE_ERRORS.NO_SUBJECT_FOR_EVENT);
        }
        return this.eventMap.get(eventType) as Subject<S>;
    }
}
