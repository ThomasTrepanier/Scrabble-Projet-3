import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ConnectionState } from './connection-state';

export default abstract class ConnectionStateService {
    private state$: BehaviorSubject<ConnectionState> = new BehaviorSubject<ConnectionState>(ConnectionState.Loading);

    subscribe(destroy$: Observable<boolean>, next: (state: ConnectionState) => void): Subscription {
        return this.state$.pipe(takeUntil(destroy$)).subscribe(next);
    }

    protected nextState(state: ConnectionState): void {
        this.state$.next(state);
    }
}
