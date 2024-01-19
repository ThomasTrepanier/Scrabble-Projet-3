import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { UserService } from '@app/services/user-service/user.service';
import { Subject } from 'rxjs';
import { PublicRouteGuard } from './public-route.guard';

@Component({
    template: '<p>Bonjour</p>',
})
export class DefaultComponent {}

describe('PublicRouteGuard', () => {
    let guard: PublicRouteGuard;
    let userService: jasmine.SpyObj<UserService>;

    beforeEach(() => {
        userService = jasmine.createSpyObj('UserService', ['isConnected']);

        TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes([{ path: 'home', component: DefaultComponent }])],
            providers: [{ provide: UserService, useValue: userService }],
        });
        guard = TestBed.inject(PublicRouteGuard);
    });

    it('should be created', () => {
        expect(guard).toBeTruthy();
    });

    describe('canActivate', () => {
        it('should return false if is connected', (done) => {
            const isConnectedSubject = new Subject<boolean>();
            userService.isConnected.and.returnValue(isConnectedSubject);

            guard.canActivate().subscribe((value) => {
                expect(value).toBeFalse();
                done();
            });

            isConnectedSubject.next(true);
        });

        it('should return true if is not connected', (done) => {
            const isConnectedSubject = new Subject<boolean>();
            userService.isConnected.and.returnValue(isConnectedSubject);

            guard.canActivate().subscribe((value) => {
                expect(value).toBeTrue();
                done();
            });

            isConnectedSubject.next(false);
        });
    });
});
