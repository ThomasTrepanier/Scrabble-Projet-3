/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NavigationEnd, NavigationStart, Router, RouterEvent } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { IconComponent } from '@app/components/icon/icon.component';
import { DEFAULT_GROUP } from '@app/constants/pages-constants';
import { GameDispatcherService } from '@app/services/';
import { Group } from '@common/models/group';
import { UNKOWN_USER } from '@common/models/user';
import { of, Subject } from 'rxjs';
import { JoinWaitingPageComponent } from './join-waiting-page.component';

@Component({
    template: '',
})
class TestComponent {}

export class MatDialogMock {
    confirmationObservable: Subject<void> = new Subject<void>();
    close() {
        return {
            close: () => ({}),
        };
    }
    open() {
        return {
            afterClosed: () => of({}),
        };
    }
    // confirmationSpy = spyOn(service['gameDispatcherController'], 'handleStartGame').and.returnValue(confirmationObservable);
    backdropClick() {
        return this.confirmationObservable.asObservable();
    }
}

const EMPTY_GROUP = {} as unknown as Group;

describe('JoinWaitingPageComponent', () => {
    let component: JoinWaitingPageComponent;
    let fixture: ComponentFixture<JoinWaitingPageComponent>;
    const opponentName = 'testName';
    let gameDispatcherServiceMock: GameDispatcherService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [JoinWaitingPageComponent, IconComponent],
            imports: [
                MatDialogModule,
                MatCardModule,
                MatProgressBarModule,
                BrowserAnimationsModule,
                HttpClientTestingModule,
                RouterTestingModule.withRoutes([
                    { path: 'groups', component: TestComponent },
                    { path: 'join-waiting-room', component: JoinWaitingPageComponent },
                ]),
                MatSnackBarModule,
            ],
            providers: [
                GameDispatcherService,
                {
                    provide: MatDialogRef,
                    useClass: MatDialogMock,
                },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        gameDispatcherServiceMock = TestBed.inject(GameDispatcherService);
        gameDispatcherServiceMock.currentGroup = DEFAULT_GROUP;
        fixture = TestBed.createComponent(JoinWaitingPageComponent);
        component = fixture.componentInstance;
        component.currentGroup = EMPTY_GROUP;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('hostHasCanceled should open the cancel dialog when host cancels the game', () => {
        const spy = spyOn(component.dialog, 'open').and.callThrough();
        component['hostHasCanceled'](opponentName);
        expect(spy).toHaveBeenCalled();
    });

    describe('ngOnInit', () => {
        it('ngOnInit should set the values to the gameDispatcherService group and name (currentGroup defined)', () => {
            component.currentGroup = EMPTY_GROUP;
            component.ngOnInit();
            expect(component.currentGroup).toEqual(DEFAULT_GROUP);
        });

        it('should set roundTime, currentName and fun fact', () => {
            component['gameDispatcherService'].currentGroup = { ...DEFAULT_GROUP, maxRoundTime: 210 };
            component.funFact = '';
            component.ngOnInit();
            expect(component.roundTime).toEqual('3:30');
            expect(component.funFact).not.toEqual('');
        });

        it('should set currentGroup to gameDispatcher currentGroup if it exists', () => {
            component.currentGroup = DEFAULT_GROUP;
            const serviceGroup = { ...DEFAULT_GROUP, maxRoundTime: 210 };
            component['gameDispatcherService'].currentGroup = serviceGroup;

            component.ngOnInit();

            expect(component.currentGroup).toEqual(serviceGroup);
            expect(component.currentGroup).not.toEqual(DEFAULT_GROUP);
        });

        it('should set currentGroup to DEFAULT_GROUP currentGroup if gameDispatcher does not have a currentGroup', () => {
            component.currentGroup = { ...DEFAULT_GROUP, maxRoundTime: 210 };
            component['gameDispatcherService'].currentGroup = undefined;

            component.ngOnInit();

            expect(component.currentGroup).toEqual(DEFAULT_GROUP);
        });

        it('ngOnInit should call the get the gameDispatcherService group and playerName ', () => {
            const spySubscribeCanceledGameEvent = spyOn(gameDispatcherServiceMock['canceledGameEvent'], 'subscribe').and.returnValue(of(true) as any);
            // Create a new component once spies have been applied
            fixture = TestBed.createComponent(JoinWaitingPageComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();

            expect(spySubscribeCanceledGameEvent).toHaveBeenCalled();
        });

        it('ngOnInit should subscribe to router events', () => {
            const routingSubscriptionSpy = spyOn(component['router'].events, 'subscribe');
            component.ngOnInit();
            expect(routingSubscriptionSpy).toHaveBeenCalled();
        });
    });

    describe('routerChangeMethod', () => {
        it('routerChangeMethod should call handleLeaveGroup if the url is different from /game ', () => {
            const spyHandleLeaveGroup = spyOn(component['playerLeavesService'], 'handleLeaveGroup').and.returnValue(of(true) as any);
            // Create a new component once spies have been applied
            component['routerChangeMethod']('notgame');
            expect(spyHandleLeaveGroup).toHaveBeenCalled();
        });

        it('routerChangeMethod should not call handleLeaveGroup if the url is /game ', () => {
            const spyHandleLeaveGroup = spyOn(component['playerLeavesService'], 'handleLeaveGroup').and.returnValue(of(true) as any);
            component['routerChangeMethod']('/game');
            expect(spyHandleLeaveGroup).not.toHaveBeenCalled();
        });

        it('routerChangeMethod should be called if router event NavigationStart occurs', () => {
            const routerChangeMethodSpy = spyOn<any>(component, 'routerChangeMethod').and.callFake(() => {
                return;
            });
            const event = new NavigationStart(1, '/join-waiting-page');
            (TestBed.inject(Router).events as Subject<RouterEvent>).next(event);
            expect(routerChangeMethodSpy).toHaveBeenCalled();
        });

        it('routerChangeMethod should be called if router event NavigationStart occurs', () => {
            const routerChangeMethodSpy = spyOn<any>(component, 'routerChangeMethod').and.callFake(() => {
                return;
            });
            const event = new NavigationEnd(1, '/join-waiting-page', '/group');
            (TestBed.inject(Router).events as Subject<RouterEvent>).next(event);
            expect(routerChangeMethodSpy).not.toHaveBeenCalled();
        });
    });

    it('hostHasCanceled should be called when canceledGameEvent is emittted', () => {
        const spyHostHasCanceled = spyOn<any>(component, 'hostHasCanceled').and.callFake(() => {
            return;
        });
        gameDispatcherServiceMock['canceledGameEvent'].next(UNKOWN_USER);
        expect(spyHostHasCanceled).toHaveBeenCalledWith(UNKOWN_USER.username);
    });

    it('onBeforeUnload should call handleLeaveGroup', () => {
        const spyhandleLeaveGroup = spyOn(component['playerLeavesService'], 'handleLeaveGroup').and.callFake(() => {
            return;
        });

        component.onBeforeUnload();
        expect(spyhandleLeaveGroup).toHaveBeenCalled();
    });

    it('onBeforeUnload should call be handleLeaveGroup', () => {
        const spyhandleLeaveGroup = spyOn(component['playerLeavesService'], 'handleLeaveGroup').and.callFake(() => {
            return;
        });
        component.onBeforeUnload();
        expect(spyhandleLeaveGroup).toHaveBeenCalled();
    });
});
