import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { IconComponent } from '@app/components/icon/icon.component';
import { HeaderBtnComponent } from '@app/components/header-btn/header-btn.component';
import { PageHeaderComponent } from './page-header.component';
import { AuthenticationService } from '@app/services/authentication-service/authentication.service';
import { Location } from '@angular/common';
import { ROUTE_LOGIN } from '@app/constants/routes-constants';
import { UserService } from '@app/services/user-service/user.service';
import { PublicUser } from '@common/models/user';
import { MatDialogModule } from '@angular/material/dialog';
import { SrcDirective } from '@app/directives/src-directive/src.directive';

@Component({
    template: '',
})
class TestComponent {}

const DEFAULT_USER: PublicUser = {
    username: 'username',
    email: 'email',
    avatar: 'avatar',
};

describe('PageHeaderComponent', () => {
    let component: PageHeaderComponent;
    let fixture: ComponentFixture<PageHeaderComponent>;
    let userService: UserService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PageHeaderComponent, IconComponent, HeaderBtnComponent, SrcDirective],
            imports: [
                BrowserAnimationsModule,
                MatCardModule,
                RouterTestingModule.withRoutes([{ path: 'login', component: TestComponent }]),
                HttpClientTestingModule,
                MatSnackBarModule,
                MatMenuModule,
                MatDialogModule,
            ],
            providers: [AuthenticationService, UserService],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PageHeaderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        userService = TestBed.inject(UserService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('signOut', () => {
        let signOutSpy: jasmine.Spy;

        beforeEach(() => {
            const authenticationService = TestBed.inject(AuthenticationService);
            signOutSpy = spyOn(authenticationService, 'signOut');
        });

        it('should call signOut', () => {
            component.signOut();

            expect(signOutSpy).toHaveBeenCalled();
        });

        it('should navigate to login', fakeAsync(() => {
            const location = TestBed.inject(Location);
            component.signOut();

            tick();

            expect(location.path()).toEqual(ROUTE_LOGIN);
        }));
    });

    describe('getUsername', () => {
        it('should pass username if has user', (done) => {
            userService.user.next(DEFAULT_USER);

            component.getUsername().subscribe((username) => {
                expect(username).toEqual(DEFAULT_USER.username);
                done();
            });
        });

        it('should pass undefined if has no user', (done) => {
            component.getUsername().subscribe((username) => {
                expect(username).toBeUndefined();
                done();
            });
        });
    });

    describe('getAvatar', () => {
        it('should pass avatar if has user', (done) => {
            userService.user.next(DEFAULT_USER);

            component.getAvatar().subscribe((avatar) => {
                expect(avatar).toEqual(DEFAULT_USER.avatar);
                done();
            });
        });

        it('should pass undefined if has no user', (done) => {
            component.getAvatar().subscribe((avatar) => {
                expect(avatar).toBeUndefined();
                done();
            });
        });
    });
});
