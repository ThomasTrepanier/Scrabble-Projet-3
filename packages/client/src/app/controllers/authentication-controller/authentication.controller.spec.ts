import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PublicUser, UserSession } from '@common/models/user';

import { AuthenticationController } from './authentication.controller';

describe('AuthenticationController', () => {
    let controller: AuthenticationController;
    let http: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        controller = TestBed.inject(AuthenticationController);
        http = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        http.verify();
    });

    it('should be created', () => {
        expect(controller).toBeTruthy();
    });

    describe('login', () => {
        it('should POST to /authentification/login', (done) => {
            const session: UserSession = {
                token: 'token',
                user: {} as PublicUser,
            };

            controller.login({ email: 'email', password: 'pass' }).subscribe((result) => {
                expect(result).toEqual(session);
                done();
            });

            const req = http.expectOne(controller.url('/login'));
            expect(req.request.method).toBe('POST');
            req.flush(session);
        });
    });

    describe('signup', () => {
        it('should POST to /authentification/signup', (done) => {
            const session: UserSession = {
                token: 'token',
                user: {} as PublicUser,
            };

            controller.signup({ email: 'email', password: 'pass', username: 'username', avatar: 'avatar' }).subscribe((result) => {
                expect(result).toEqual(session);
                done();
            });

            const req = http.expectOne(controller.url('/signup'));
            expect(req.request.method).toBe('POST');
            req.flush(session);
        });
    });

    describe('validateToken', () => {
        it('should POST to /authentification/signup', (done) => {
            const session: UserSession = {
                token: 'token',
                user: {} as PublicUser,
            };

            controller.validateToken('').subscribe((result) => {
                expect(result).toEqual(session);
                done();
            });

            const req = http.expectOne(controller.url('/validate'));
            expect(req.request.method).toBe('POST');
            req.flush(session);
        });
    });

    describe('validateUsername', () => {
        it('should POST to /authentification/validateUsername', (done) => {
            const res = {
                isAvailable: true,
            };

            controller.validateUsername('').subscribe((result) => {
                expect(result).toEqual(res);
                done();
            });

            const req = http.expectOne(controller.url('/validateUsername'));
            expect(req.request.method).toBe('POST');
            req.flush(res);
        });
    });

    describe('validateEmail', () => {
        it('should POST to /authentification/validateEmail', (done) => {
            const res = {
                isAvailable: true,
            };

            controller.validateEmail('').subscribe((result) => {
                expect(result).toEqual(res);
                done();
            });

            const req = http.expectOne(controller.url('/validateEmail'));
            expect(req.request.method).toBe('POST');
            req.flush(res);
        });
    });
});
