import { HttpClient, HttpStatusCode } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { GameConfig, InitializeGameData, StartGameData } from '@app/classes/communication/game-config';
import SocketService from '@app/services/socket-service/socket.service';
import { Group, GroupData } from '@common/models/group';
import { RequestingUsers } from '@common/models/requesting-users';
import { PublicUser } from '@common/models/user';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class GameDispatcherController implements OnDestroy {
    private joinRequestEvent: Subject<RequestingUsers> = new Subject();
    private canceledGameEvent: Subject<PublicUser> = new Subject();
    private playerJoinedGroupEvent: Subject<Group> = new Subject();
    private playerLeftGroupEvent: Subject<Group> = new Subject();
    private playerCancelledRequestingEvent: Subject<RequestingUsers> = new Subject();
    private groupFullEvent: Subject<void> = new Subject();
    private invalidPasswordEvent: Subject<void> = new Subject();
    private groupRequestValidEvent: Subject<void> = new Subject();
    private replaceVirtualPlayerEvent: BehaviorSubject<InitializeGameData | undefined> = new BehaviorSubject<InitializeGameData | undefined>(
        undefined,
    );
    private groupsUpdateEvent: Subject<Group[]> = new Subject();
    private joinerRejectedEvent: Subject<PublicUser> = new Subject();
    private initializeGame$: BehaviorSubject<InitializeGameData | undefined> = new BehaviorSubject<InitializeGameData | undefined>(undefined);

    private serviceDestroyed$: Subject<boolean> = new Subject();

    constructor(private http: HttpClient, public socketService: SocketService) {
        this.configureSocket();
    }

    ngOnDestroy(): void {
        this.serviceDestroyed$.next(true);
        this.serviceDestroyed$.complete();
    }

    handleGameCreation(groupData: GroupData): Observable<{ group: Group }> {
        const endpoint = `${environment.serverUrl}/games`;
        return this.http.post<{ group: Group }>(endpoint, groupData);
    }

    handleConfirmationGameCreation(opponentName: string, gameId: string): Observable<void> {
        const endpoint = `${environment.serverUrl}/games/${gameId}/players/accept`;
        return this.http.post<void>(endpoint, { opponentName });
    }

    handleStartGame(gameId: string): Observable<void> {
        const endpoint = `${environment.serverUrl}/games/${gameId}/players/start`;
        return this.http.post<void>(endpoint, {});
    }

    handleRejectionGameCreation(opponentName: string, gameId: string): void {
        const endpoint = `${environment.serverUrl}/games/${gameId}/players/reject`;
        this.http.post(endpoint, { opponentName }).subscribe();
    }

    handleCancelGame(gameId: string): void {
        const endpoint = `${environment.serverUrl}/games/${gameId}/players/cancel`;
        this.http.delete(endpoint).subscribe();
    }

    handleGroupsListRequest(): void {
        const endpoint = `${environment.serverUrl}/games`;
        this.http.get(endpoint).subscribe();
    }

    handleGroupUpdatesRequest(gameId: string, isObserver: boolean): void {
        const endpoint = `${environment.serverUrl}/games/${gameId}`;
        this.http.patch(endpoint, { isObserver }).subscribe();
    }

    handleGroupJoinRequest(gameId: string, isObserver: boolean, password: string): void {
        const endpoint = `${environment.serverUrl}/games/${gameId}/players/join`;

        this.http.post<GameConfig>(endpoint, { password, isObserver }, { observe: 'response' }).subscribe(
            () => {
                this.groupRequestValidEvent.next();
            },
            (error) => {
                this.handleJoinError(error.status as HttpStatusCode);
            },
        );
    }

    subscribeToJoinRequestEvent(serviceDestroyed$: Subject<boolean>, callback: (requestingUsers: RequestingUsers) => void): void {
        this.joinRequestEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }

    subscribeToCanceledGameEvent(serviceDestroyed$: Subject<boolean>, callback: (hostUser: PublicUser) => void): void {
        this.canceledGameEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }

    subscribeToPlayerJoinedGroupEvent(serviceDestroyed$: Subject<boolean>, callback: (group: Group) => void): void {
        this.playerJoinedGroupEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }

    subscribeToPlayerLeftGroupEvent(serviceDestroyed$: Subject<boolean>, callback: (group: Group) => void): void {
        this.playerLeftGroupEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }

    subscribeToPlayerCancelledRequestingEvent(serviceDestroyed$: Subject<boolean>, callback: (requestingUsers: RequestingUsers) => void): void {
        this.playerCancelledRequestingEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }

    subscribeToGroupFullEvent(serviceDestroyed$: Subject<boolean>, callback: () => void): void {
        this.groupFullEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }

    subscribeToInvalidPasswordEvent(serviceDestroyed$: Subject<boolean>, callback: () => void): void {
        this.invalidPasswordEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }

    subscribeToGroupRequestValidEvent(serviceDestroyed$: Subject<boolean>, callback: () => void): void {
        this.groupRequestValidEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }

    subscribeToGroupsUpdateEvent(serviceDestroyed$: Subject<boolean>, callback: (groups: Group[]) => void): void {
        this.groupsUpdateEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }

    subscribeToJoinerRejectedEvent(serviceDestroyed$: Subject<boolean>, callback: (hostUser: PublicUser) => void): void {
        this.joinerRejectedEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }

    subscribeToInitializeGame(serviceDestroyed$: Subject<boolean>, callback: (value: InitializeGameData | undefined) => void): void {
        this.initializeGame$.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }
    subscribeToReplaceVirtualPlayer(serviceDestroyed$: Subject<boolean>, callback: (value: InitializeGameData | undefined) => void): void {
        this.replaceVirtualPlayerEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }
    private handleJoinError(errorStatus: HttpStatusCode): void {
        switch (errorStatus) {
            case HttpStatusCode.Unauthorized: {
                this.groupFullEvent.next();
                break;
            }
            case HttpStatusCode.Gone: {
                this.canceledGameEvent.next({ username: 'Le créateur', email: '', avatar: '' });
                break;
            }
            case HttpStatusCode.Forbidden: {
                this.invalidPasswordEvent.next();
                break;
            }
            // No default
        }
    }

    private configureSocket(): void {
        this.socketService.on('groupsUpdate', (groups: Group[]) => {
            this.groupsUpdateEvent.next(groups);
        });
        this.socketService.on('joinRequest', (requestingUsers: RequestingUsers) => {
            this.joinRequestEvent.next(requestingUsers);
        });
        this.socketService.on('rejectJoinRequest', (host: PublicUser) => {
            this.joinerRejectedEvent.next(host);
        });
        this.socketService.on('cancelledGroup', (host: PublicUser) => {
            this.canceledGameEvent.next(host);
        });
        this.socketService.on('acceptJoinRequest', (group: Group) => this.playerJoinedGroupEvent.next(group));
        this.socketService.on('userLeftGroup', (group: Group) => this.playerLeftGroupEvent.next(group));
        this.socketService.on('joinRequestCancelled', (requestingUsers: RequestingUsers) => {
            this.playerCancelledRequestingEvent.next(requestingUsers);
        });
        this.socketService.on('startGame', (startGameData: StartGameData) => {
            this.initializeGame$.next({ localPlayerId: this.socketService.getId(), startGameData });
        });
        this.socketService.on('replaceVirtualPlayer', (startGameData: StartGameData) => {
            this.replaceVirtualPlayerEvent.next({ localPlayerId: this.socketService.getId(), startGameData });
        });
    }
}
