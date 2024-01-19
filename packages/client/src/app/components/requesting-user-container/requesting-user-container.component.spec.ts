/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IconComponent } from '@app/components/icon/icon.component';

import { RequestingUserContainerComponent } from './requesting-user-container.component';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { GameDispatcherService } from '@app/services';
import { of, Subject } from 'rxjs';
import SpyObj = jasmine.SpyObj;
import { RequestingUsers } from '@common/models/requesting-users';
import { SrcDirective } from '@app/directives/src-directive/src.directive';

@Component({
    template: '',
})
class TestComponent {}

export class MatDialogMock {
    open() {
        return {
            afterClosed: () => of({}),
        };
    }
}

describe('RequestingUserContainerComponent', () => {
    let component: RequestingUserContainerComponent;
    let fixture: ComponentFixture<RequestingUserContainerComponent>;
    let gameDispatcherServiceSpy: SpyObj<GameDispatcherService>;
    let gameDispatcherCreationSubject: Subject<HttpErrorResponse>;

    beforeEach(() => {
        gameDispatcherServiceSpy = jasmine.createSpyObj('GameDispatcherService', [
            'observeGameCreationFailed',
            'subscribeToJoinRequestEvent',
            'subscribeToPlayerCancelledRequestEvent',
            'subscribeToPlayerLeftGroupEvent',
            'subscribeToPlayerJoinedGroupEvent',
            'handleStart',
            'handleCancelGame',
            'handleConfirmation',
            'handleRejection',
        ]);
        gameDispatcherCreationSubject = new Subject();
        gameDispatcherServiceSpy.observeGameCreationFailed.and.returnValue(gameDispatcherCreationSubject.asObservable());
        gameDispatcherServiceSpy['joinRequestEvent'] = new Subject();
        gameDispatcherServiceSpy.subscribeToJoinRequestEvent.and.callFake(
            (componentDestroyed$: Subject<boolean>, callBack: (requestingUsers: RequestingUsers) => void) => {
                gameDispatcherServiceSpy['joinRequestEvent'].subscribe(callBack);
            },
        );
        gameDispatcherServiceSpy.handleConfirmation.and.callFake(() => {});
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [RequestingUserContainerComponent, IconComponent, SrcDirective],
            imports: [
                HttpClientTestingModule,
                MatProgressBarModule,
                MatCardModule,
                MatDialogModule,
                CommonModule,
                BrowserAnimationsModule,
                MatSnackBarModule,
                RouterTestingModule.withRoutes([
                    { path: 'game-creation', component: TestComponent },
                    { path: 'create-waiting-room', component: RequestingUserContainerComponent },
                    { path: 'game', component: TestComponent },
                ]),
            ],
            providers: [
                { provide: GameDispatcherService, useValue: gameDispatcherServiceSpy },
                {
                    provide: MatDialog,
                    useClass: MatDialogMock,
                },
                MatSnackBar,
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(RequestingUserContainerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
