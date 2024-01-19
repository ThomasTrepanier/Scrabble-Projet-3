/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines */
/* eslint-disable dot-notation */
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';
import { GameDispatcherController } from '@app/controllers/game-dispatcher-controller/game-dispatcher.controller';
import { GameDispatcherService, SocketService } from '@app/services/';
import { GameViewEventManagerService } from '@app/services/game-view-event-manager-service/game-view-event-manager.service';
import { GameVisibility } from '@common/models/game-visibility';
import { Group, GroupData } from '@common/models/group';
import { Observable, Subject, Subscription } from 'rxjs';
import { UserService } from '@app/services/user-service/user.service';
import SpyObj = jasmine.SpyObj;
import { ROUTE_CREATE_WAITING } from '@app/constants/routes-constants';
import { MatDialogModule } from '@angular/material/dialog';
import { RequestingUsers } from '@common/models/requesting-users';
import { HttpClientTestingModule } from '@angular/common/http/testing';

@Component({
    template: '',
})
export class TestComponent {}

const BASE_GAME_ID = 'baseGameId';
const TEST_PLAYER_NAME = 'playerName';
const USER1 = { username: 'user1', email: 'email1', avatar: 'avatar1' };
const USER2 = { username: 'user2', email: 'email2', avatar: 'avatar2' };
const USER3 = { username: 'user3', email: 'email3', avatar: 'avatar3' };
const USER4 = { username: 'user4', email: 'email4', avatar: 'avatar4' };
const USER5 = { username: 'user5', email: 'email5', avatar: 'avatar5' };
const USER6 = { username: 'user6', email: 'email6', avatar: 'avatar6' };
const USER7 = { username: 'user7', email: 'email7', avatar: 'avatar7' };
const PUBLIC_USERS_PLAYERS = [USER1, USER2, USER3, USER4];
const PUBLIC_USERS_OBSERVERS = [USER5, USER6, USER7];
const REQUESTING_USERS: RequestingUsers = { requestingPlayers: PUBLIC_USERS_PLAYERS, requestingObservers: PUBLIC_USERS_OBSERVERS };
const TEST_GROUP: Group = {
    groupId: BASE_GAME_ID,
    user1: USER1,
    maxRoundTime: 0,
    gameVisibility: GameVisibility.Public,
    virtualPlayerLevel: VirtualPlayerLevel.Beginner,
    password: '',
    numberOfObservers: 0,
};

const TEST_GROUPS = [TEST_GROUP];
const TEST_GAME_PARAMETERS = {
    level: VirtualPlayerLevel.Beginner,
    visibility: GameVisibility.Public,
    timer: '60',
    password: '1',
};
const TEST_FORM_CONTENT = {
    level: new FormControl(VirtualPlayerLevel.Beginner, Validators.required),
    timer: new FormControl(1, Validators.required),
    password: new FormControl('1', Validators.required),
    visibility: new FormControl(GameVisibility.Public, Validators.required),
};
const TEST_FORM: FormGroup = new FormGroup(TEST_FORM_CONTENT);
TEST_FORM.setValue(TEST_GAME_PARAMETERS);

describe('GameDispatcherService', () => {
    let getCurrentGroupIdSpy: jasmine.Spy;
    let service: GameDispatcherService;
    let gameDispatcherControllerMock: GameDispatcherController;
    let gameViewEventSpy: SpyObj<GameViewEventManagerService>;
    let userServiceSpy: SpyObj<UserService>;

    beforeEach(() => {
        const resetSubject = new Subject();
        gameViewEventSpy = jasmine.createSpyObj('GameViewEventManagerService', ['subscribeToGameViewEvent', 'emitGameViewEvent']);
        userServiceSpy = jasmine.createSpyObj('UserService', ['getUser']);
        userServiceSpy.getUser.and.callFake(() => {
            return USER1;
        });
        gameViewEventSpy.subscribeToGameViewEvent.and.callFake((eventType: string, destroy$: Observable<boolean>, next: any) => {
            if (eventType !== 'resetServices') return new Subscription();
            return resetSubject.subscribe(next);
        });
        gameViewEventSpy.emitGameViewEvent.and.callFake((eventType: string, payload?: any) => {
            if (eventType !== 'resetServices') return;
            resetSubject.next(payload);
        });
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                RouterTestingModule.withRoutes([
                    { path: 'create-waiting-room', component: TestComponent },
                    { path: 'join-waiting-room', component: TestComponent },
                ]),
                MatSnackBarModule,
                MatDialogModule,
            ],
            providers: [
                GameDispatcherController,
                SocketService,
                { provide: UserService, useValue: userServiceSpy },
                { provide: GameViewEventManagerService, useValue: gameViewEventSpy },
            ],
        });

        gameDispatcherControllerMock = TestBed.inject(GameDispatcherController);

        service = TestBed.inject(GameDispatcherService);

        getCurrentGroupIdSpy = spyOn(service, 'getCurrentGroupId').and.returnValue(BASE_GAME_ID);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('Subscriptions', () => {
        it('should call handleJoinRequest on joinRequestEvent', () => {
            const spy = spyOn<any>(service, 'handleJoinRequest');
            service['gameDispatcherController']['joinRequestEvent'].next(REQUESTING_USERS);
            expect(spy).toHaveBeenCalledWith(REQUESTING_USERS);
        });

        it('should call handleGroupFull on groupFullEvent', () => {
            const spy = spyOn<any>(service, 'handleGroupFull');
            service['gameDispatcherController']['groupFullEvent'].next();
            expect(spy).toHaveBeenCalled();
        });

        it('should call handleCanceledGame on canceledGameEvent', () => {
            const spy = spyOn<any>(service, 'handleCanceledGame');
            service['gameDispatcherController']['canceledGameEvent'].next(USER1);
            expect(spy).toHaveBeenCalledWith(USER1);
        });

        it('should call handleJoinerRejected on joinerRejectedEvent', () => {
            const spy = spyOn<any>(service, 'handleJoinerRejected');
            service['gameDispatcherController']['joinerRejectedEvent'].next(USER1);
            expect(spy).toHaveBeenCalledWith(USER1);
        });

        it('should call handleGroupsUpdate on groupsUpdateEvent', () => {
            const spy = spyOn<any>(service, 'handleGroupsUpdate');
            service['gameDispatcherController']['groupsUpdateEvent'].next(TEST_GROUPS);
            expect(spy).toHaveBeenCalledWith(TEST_GROUPS);
        });

        it('should call handlePlayerCancelledRequest on playerCancelledRequestingEvent', () => {
            const spy = spyOn<any>(service, 'handlePlayerCancelledRequest');
            service['gameDispatcherController']['playerCancelledRequestingEvent'].next(REQUESTING_USERS);
            expect(spy).toHaveBeenCalledWith(REQUESTING_USERS);
        });

        it('should call handlePlayerJoinedRequest on playerJoinedGroupEvent', () => {
            const spy = spyOn<any>(service, 'handlePlayerJoinedRequest');
            service['gameDispatcherController']['playerJoinedGroupEvent'].next(TEST_GROUP);
            expect(spy).toHaveBeenCalledWith(TEST_GROUP);
        });

        it('should initialize game on initializeGame event received', () => {
            const spy = spyOn(service['gameService'], 'handleInitializeGame').and.callFake(async () => {
                return;
            });
            service['gameDispatcherController']['initializeGame$'].next(undefined);
            expect(spy).toHaveBeenCalledWith(undefined, false);
        });

        it('on resetServices event, should call resetServiceData', () => {
            const resetDataSpy = spyOn(service, 'resetServiceData').and.callFake(() => {
                return;
            });
            gameViewEventSpy.emitGameViewEvent('resetServices');
            expect(resetDataSpy).toHaveBeenCalled();
        });
    });

    describe('getCurrentGroupId', () => {
        beforeEach(() => {
            getCurrentGroupIdSpy.and.callThrough();
        });

        it('should return current group id if current group is defined', () => {
            service.currentGroup = TEST_GROUP;
            expect(service.getCurrentGroupId()).toEqual(TEST_GROUP.groupId);
        });

        it('should return empty string if current group is undefined', () => {
            service.currentGroup = undefined;
            expect(service.getCurrentGroupId()).toEqual('');
        });
    });

    describe('ngOnDestroy', () => {
        it('should call next', () => {
            const spy = spyOn<any>(service['serviceDestroyed$'], 'next');
            spyOn<any>(service['serviceDestroyed$'], 'complete');
            service.ngOnDestroy();
            expect(spy).toHaveBeenCalled();
        });

        it('should call complete', () => {
            spyOn(service['serviceDestroyed$'], 'next');
            const spy = spyOn(service['serviceDestroyed$'], 'complete');
            service.ngOnDestroy();
            expect(spy).toHaveBeenCalled();
        });
    });

    it('resetData should set right attributes', () => {
        service.currentGroup = TEST_GROUP;
        getCurrentGroupIdSpy.and.callThrough();

        service.resetServiceData();
        expect(service.currentGroup).toBeUndefined();
        expect(service.getCurrentGroupId()).toEqual('');
    });

    describe('handleJoinGroup', () => {
        let spyHandleGroupJoinRequest: jasmine.Spy;

        beforeEach(() => {
            spyHandleGroupJoinRequest = spyOn(gameDispatcherControllerMock, 'handleGroupJoinRequest').and.callFake(() => {
                return;
            });
        });
        it('handleJoinGroup should call gameDispatcherController.handleGroupJoinRequest with the correct parameters', () => {
            service.handleJoinGroup(TEST_GROUPS[0], false, 'aa');
            expect(spyHandleGroupJoinRequest).toHaveBeenCalledWith(TEST_GROUPS[0].groupId, false, 'aa');
        });

        it('handleJoinGroup should set right attributes', () => {
            service.currentGroup = undefined;
            getCurrentGroupIdSpy.and.callThrough();

            service.handleJoinGroup(TEST_GROUP, false);
            expect(service.currentGroup).toBeTruthy();
            expect(service.getCurrentGroupId()).toEqual(TEST_GROUP.groupId);
        });
    });

    it('handleGroupListRequest should call gameDispatcherController.handleGroupsListRequest', () => {
        const spyHandleGroupJoinRequest = spyOn(gameDispatcherControllerMock, 'handleGroupsListRequest').and.callFake(() => {
            return;
        });
        service.handleGroupListRequest();
        expect(spyHandleGroupJoinRequest).toHaveBeenCalled();
    });

    it('handleCreateGame should call handleGameCreation with the correct parameters for multiplayer game', () => {
        const spyHandleGameCreation = spyOn<any>(service, 'handleGameCreation').and.callFake(() => {
            return;
        });

        const EXPECTED_GAME_CONFIG: GroupData = {
            user1: USER1,
            maxRoundTime: '60' as unknown as number,
            virtualPlayerLevel: VirtualPlayerLevel.Beginner,
            gameVisibility: GameVisibility.Public,
            password: '',
            numberOfObservers: 0,
        };

        service.handleCreateGame(TEST_FORM);
        expect(spyHandleGameCreation).toHaveBeenCalledWith(EXPECTED_GAME_CONFIG);
        TEST_FORM.setValue(TEST_GAME_PARAMETERS);
    });

    describe('handleCancelGame', () => {
        let cancelGameSpy: jasmine.Spy;
        let resetDataSpy: jasmine.Spy;

        beforeEach(() => {
            resetDataSpy = spyOn<any>(service, 'resetServiceData');
            cancelGameSpy = spyOn(service['gameDispatcherController'], 'handleCancelGame');
        });

        afterEach(() => {
            cancelGameSpy.calls.reset();
            resetDataSpy.calls.reset();
        });

        it('should call handleCancelGame if gameId is defined', () => {
            getCurrentGroupIdSpy.and.returnValue(BASE_GAME_ID);
            service.handleCancelGame();
            expect(cancelGameSpy).toHaveBeenCalledWith(BASE_GAME_ID);
        });

        it('should not call handleCancelGame if gameId is undefined', () => {
            getCurrentGroupIdSpy.and.returnValue('');
            service.handleCancelGame();
            expect(cancelGameSpy).not.toHaveBeenCalled();
        });

        it('should call resetData', () => {
            service.handleCancelGame();
            expect(resetDataSpy).toHaveBeenCalled();
        });

        it('should call not call resetData if mustResetData = false', () => {
            service.handleCancelGame(false);
            expect(resetDataSpy).not.toHaveBeenCalled();
        });
    });

    // describe('handleRecreateGame', () => {
    //     let createSpy: jasmine.Spy;

    //     beforeEach(() => {
    //         createSpy = spyOn<any>(service, 'handleGameCreation').and.callFake(() => {
    //             return;
    //         });
    //         spyOn(socketServiceMock, 'getId').and.returnValue('socketid');
    //     });

    //     afterEach(() => {
    //         createSpy.calls.reset();
    //     });

    //     const gameParametersForm: FormGroup = new FormGroup({
    //         level: new FormControl(VirtualPlayerLevel.Beginner, Validators.required),
    //     });
    //     const formValues = {
    //         level: VirtualPlayerLevel.Beginner,
    //     };
    //     gameParametersForm.setValue(formValues);

    //     it('should call handleGameCreation if the group is defined  and create a game', () => {
    //         service.currentGroup = TEST_GROUP;
    //         service.handleRecreateGame({} as unknown as FormGroup);
    //         expect(createSpy).toHaveBeenCalled();
    //     });

    //     it('should not call handleCancelGame if gameId is undefined', () => {
    //         service.currentGroup = undefined;
    //         service.handleRecreateGame();
    //         expect(createSpy).not.toHaveBeenCalled();
    //     });

    //     it('should not call handleCancelGame if group parameter are undefined', () => {
    //         service.handleRecreateGame();
    //         expect(createSpy).not.toHaveBeenCalled();
    //     });
    // });

    describe('handleGameCreation', () => {
        let handleCreationSpy: jasmine.Spy;
        let postObservable: Subject<{ group: Group }>;
        let routerSpy: jasmine.Spy;
        let gameConfigData: GroupData;
        let gameCreationFailedSpy: jasmine.Spy;

        beforeEach(() => {
            postObservable = new Subject();
            handleCreationSpy = spyOn(gameDispatcherControllerMock, 'handleGameCreation').and.returnValue(postObservable.asObservable());
            gameCreationFailedSpy = spyOn(service['gameCreationFailed$'], 'next').and.callFake(() => {
                return;
            });
            routerSpy = spyOn(service['router'], 'navigateByUrl');
            gameConfigData = TEST_GAME_PARAMETERS as unknown as GroupData;
            service['handleGameCreation'](gameConfigData);
        });

        it('should call gameDispatcherController.handleGameCreation', () => {
            expect(handleCreationSpy).toHaveBeenCalledWith(gameConfigData);
        });

        it('should set currentGroup to response Group', () => {
            postObservable.next({ group: TEST_GROUP });
            expect(service.currentGroup).toEqual(TEST_GROUP);
        });

        it('if is Multiplayer, should route to create-waiting-room', () => {
            postObservable.next({ group: TEST_GROUP });
            expect(routerSpy).toHaveBeenCalledWith(ROUTE_CREATE_WAITING);
        });

        it('on error, should send gameCreationFailed$ event', () => {
            postObservable.error({});
            expect(gameCreationFailedSpy).toHaveBeenCalled();
        });
    });

    describe('handleConfirmation', () => {
        let confirmationObservable: Subject<void>;
        let confirmationSpy: jasmine.Spy;
        let gameCreationFailedSpy: jasmine.Spy;

        beforeEach(() => {
            confirmationObservable = new Subject<void>();
            confirmationSpy = spyOn(service['gameDispatcherController'], 'handleConfirmationGameCreation').and.returnValue(
                confirmationObservable.asObservable(),
            );
            gameCreationFailedSpy = spyOn(service['gameCreationFailed$'], 'next').and.callFake(() => {
                return;
            });
        });

        afterEach(() => {
            confirmationSpy.calls.reset();
        });

        it('should call handleConfirmation if gameId is defined', () => {
            getCurrentGroupIdSpy.and.returnValue(BASE_GAME_ID);
            service.handleConfirmation(TEST_PLAYER_NAME);
            expect(confirmationSpy).toHaveBeenCalledWith(TEST_PLAYER_NAME, BASE_GAME_ID);
        });

        it('should not call handleCancelGame if gameId is undefined', () => {
            getCurrentGroupIdSpy.and.returnValue('');
            service.handleConfirmation(TEST_PLAYER_NAME);
            expect(confirmationSpy).not.toHaveBeenCalled();
        });

        it('on error, should emit gameCreationFailed', () => {
            getCurrentGroupIdSpy.and.returnValue(BASE_GAME_ID);
            service.handleConfirmation(TEST_PLAYER_NAME);
            confirmationObservable.error({});
            expect(gameCreationFailedSpy).toHaveBeenCalled();
        });
    });

    describe('handleStart', () => {
        let confirmationObservable: Subject<void>;
        let confirmationSpy: jasmine.Spy;
        let gameCreationFailedSpy: jasmine.Spy;

        beforeEach(() => {
            confirmationObservable = new Subject<void>();
            confirmationSpy = spyOn(service['gameDispatcherController'], 'handleStartGame').and.returnValue(confirmationObservable.asObservable());
            gameCreationFailedSpy = spyOn(service['gameCreationFailed$'], 'next').and.callFake(() => {
                return;
            });
        });

        afterEach(() => {
            confirmationSpy.calls.reset();
        });

        it('should call handleStart if gameId is defined', () => {
            getCurrentGroupIdSpy.and.returnValue(BASE_GAME_ID);
            service.handleStart();
            expect(confirmationSpy).toHaveBeenCalledWith(BASE_GAME_ID);
        });

        it('should not call handleCancelGame if gameId is undefined', () => {
            getCurrentGroupIdSpy.and.returnValue('');
            service.handleStart();
            expect(confirmationSpy).not.toHaveBeenCalled();
        });

        it('on error, should emit gameCreationFailed', () => {
            getCurrentGroupIdSpy.and.returnValue(BASE_GAME_ID);
            service.handleStart();
            confirmationObservable.error({});
            expect(gameCreationFailedSpy).toHaveBeenCalled();
        });
    });

    describe('handleRejection', () => {
        let rejectionSpy: jasmine.Spy;

        beforeEach(() => {
            rejectionSpy = spyOn(service['gameDispatcherController'], 'handleRejectionGameCreation');
        });

        afterEach(() => {
            rejectionSpy.calls.reset();
        });

        it('should call handleCancelGame if gameId is defined', () => {
            getCurrentGroupIdSpy.and.returnValue(BASE_GAME_ID);
            service.handleRejection(TEST_PLAYER_NAME);
            expect(rejectionSpy).toHaveBeenCalledWith(TEST_PLAYER_NAME, BASE_GAME_ID);
        });

        it('should not call handleCancelGame if currentGroupId is undefined', () => {
            getCurrentGroupIdSpy.and.returnValue('');
            service.handleRejection(TEST_PLAYER_NAME);
            expect(rejectionSpy).not.toHaveBeenCalled();
        });
    });

    describe('handleJoinRequest', () => {
        it('should emit to joinRequestEvent', () => {
            const spy = spyOn(service['joinRequestEvent'], 'next');
            service['handleJoinRequest'](REQUESTING_USERS);
            expect(spy).toHaveBeenCalledWith(REQUESTING_USERS);
        });

        it('should emit to playerJoinedGroupEvent', () => {
            const spy = spyOn(service['playerJoinedGroupEvent'], 'next');
            service['handlePlayerJoinedRequest'](TEST_GROUP);
            expect(spy).toHaveBeenCalledWith(TEST_GROUP);
        });

        it('should emit to playerLeftGroupEvent', () => {
            const spy = spyOn(service['playerLeftGroupEvent'], 'next');
            service['handlePlayerLeftRequest'](TEST_GROUP);
            expect(spy).toHaveBeenCalledWith(TEST_GROUP);
        });

        it('should emit to playerCancelledRequestEvent', () => {
            const spy = spyOn(service['playerCancelledRequestEvent'], 'next');
            service['handlePlayerCancelledRequest'](REQUESTING_USERS);
            expect(spy).toHaveBeenCalledWith(REQUESTING_USERS);
        });
    });

    describe('handleJoinerRejected', () => {
        let emitSpy: jasmine.Spy;
        let resetSpy: jasmine.Spy;

        beforeEach(() => {
            resetSpy = spyOn<any>(service, 'resetServiceData');
            emitSpy = spyOn(service['joinerRejectedEvent'], 'next');
        });

        afterEach(() => {
            emitSpy.calls.reset();
            resetSpy.calls.reset();
        });

        it('should emit to joinerRejectedEvent', () => {
            service['handleJoinerRejected'](USER1);
            expect(emitSpy).toHaveBeenCalledWith(USER1);
        });

        it('should call resetData', () => {
            service['handleJoinerRejected'](USER1);
            expect(resetSpy).toHaveBeenCalledWith();
        });
    });

    describe('handleGroupsUpdate', () => {
        it('should emit to joinRequestEvent', () => {
            const args: Group[] = [];
            const spy = spyOn(service['groupsUpdateEvent'], 'next');
            service['handleGroupsUpdate'](args);
            expect(spy).toHaveBeenCalledWith(args);
        });
    });

    describe('handleGroupFull', () => {
        let emitSpy: jasmine.Spy;
        let resetSpy: jasmine.Spy;

        beforeEach(() => {
            resetSpy = spyOn<any>(service, 'resetServiceData');
            emitSpy = spyOn(service['groupFullEvent'], 'next');
        });

        afterEach(() => {
            emitSpy.calls.reset();
            resetSpy.calls.reset();
        });

        it('should emit to groupFullEvent', () => {
            service['handleGroupFull']();
            expect(emitSpy).toHaveBeenCalledWith();
        });

        it('should call resetData', () => {
            service['handleGroupFull']();
            expect(resetSpy).toHaveBeenCalledWith();
        });
    });

    describe('handleCanceledGame', () => {
        let emitSpy: jasmine.Spy;
        let resetSpy: jasmine.Spy;

        beforeEach(() => {
            resetSpy = spyOn<any>(service, 'resetServiceData');
            emitSpy = spyOn(service['canceledGameEvent'], 'next');
        });

        afterEach(() => {
            emitSpy.calls.reset();
            resetSpy.calls.reset();
        });

        it('should emit to canceledGameEvent', () => {
            service['handleCanceledGame'](USER1);
            expect(emitSpy).toHaveBeenCalledWith(USER1);
        });

        it('should call resetData', () => {
            service['handleCanceledGame'](USER1);
            expect(resetSpy).toHaveBeenCalledWith();
        });
    });

    it('observeGameCreationFailed should return observable of gameCreationFailed$', () => {
        expect(service.observeGameCreationFailed()).toEqual(service['gameCreationFailed$'].asObservable());
    });

    describe('subcription methods', () => {
        let serviceDestroyed$: Subject<boolean>;
        let callback: () => void;

        beforeEach(() => {
            serviceDestroyed$ = new Subject();
            callback = () => {
                return;
            };
        });

        it('subscribeToJoinRequestEvent should call subscribe method on joinRequestEvent', () => {
            const subscriptionSpy = spyOn(service['joinRequestEvent'], 'subscribe');
            service.subscribeToJoinRequestEvent(serviceDestroyed$, callback);
            expect(subscriptionSpy).toHaveBeenCalled();
        });

        it('subscribeToCanceledGameEvent should call subscribe method on joinRequestEvent', () => {
            const subscriptionSpy = spyOn(service['canceledGameEvent'], 'subscribe');
            service.subscribeToCanceledGameEvent(serviceDestroyed$, callback);
            expect(subscriptionSpy).toHaveBeenCalled();
        });

        it('subscribeToGroupFullEvent should call subscribe method on joinRequestEvent', () => {
            const subscriptionSpy = spyOn(service['groupFullEvent'], 'subscribe');
            service.subscribeToGroupFullEvent(serviceDestroyed$, callback);
            expect(subscriptionSpy).toHaveBeenCalled();
        });

        it('subscribeToGroupsUpdateEvent should call subscribe method on groupsUpdateEvent', () => {
            const subscriptionSpy = spyOn(service['groupsUpdateEvent'], 'subscribe');
            service.subscribeToGroupsUpdateEvent(serviceDestroyed$, callback);
            expect(subscriptionSpy).toHaveBeenCalled();
        });

        it('subscribeToJoinerRejectedEvent should call subscribe method on joinRequestEvent', () => {
            const subscriptionSpy = spyOn(service['joinerRejectedEvent'], 'subscribe');
            service.subscribeToJoinerRejectedEvent(serviceDestroyed$, callback);
            expect(subscriptionSpy).toHaveBeenCalled();
        });

        it('subscribeToPlayerLeftGroupEvent should call subscribe method on joinRequestEvent', () => {
            const subscriptionSpy = spyOn(service['playerLeftGroupEvent'], 'subscribe');
            service.subscribeToPlayerLeftGroupEvent(serviceDestroyed$, callback);
            expect(subscriptionSpy).toHaveBeenCalled();
        });

        it('subscribeToPlayerJoinedGroupEvent should call subscribe method on joinRequestEvent', () => {
            const subscriptionSpy = spyOn(service['playerJoinedGroupEvent'], 'subscribe');
            service.subscribeToPlayerJoinedGroupEvent(serviceDestroyed$, callback);
            expect(subscriptionSpy).toHaveBeenCalled();
        });
    });
});
