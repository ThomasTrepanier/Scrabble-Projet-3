import { TestBed } from '@angular/core/testing';
import { SECONDS_TO_MILLISECONDS } from '@app/constants/game-constants';
import { EXPIRED_COOKIE_AGE } from '@app/constants/services-errors';
import { CookieService } from './cookie.service';

const USERNAME = 'perry';
const VALUE = 'theplatopus';
const EXPIRY = 42;

describe('CookieService', () => {
    let service: CookieService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CookieService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('setCookie', () => {
        let documentCookieSpy: jasmine.Spy;

        beforeEach(() => {
            documentCookieSpy = spyOnProperty(document, 'cookie', 'set');
        });

        it('should set document.cookie', () => {
            const date = new Date();
            date.setTime(date.getTime() + EXPIRY * SECONDS_TO_MILLISECONDS);
            // const expected = `${USERNAME}=${VALUE}; expires=${date.toUTCString()};path=/ ;SameSite=strict`;
            service.setCookie(USERNAME, VALUE, EXPIRY);

            expect(documentCookieSpy).toHaveBeenCalled();
        });
    });

    describe('getCookie', () => {
        let documentCookieSpy: jasmine.Spy;

        beforeEach(() => {
            documentCookieSpy = spyOnProperty(document, 'cookie', 'get');
        });

        it('it should get cookie', () => {
            documentCookieSpy.and.returnValue(`${USERNAME}=${VALUE}`);
            expect(service.getCookie(USERNAME)).toEqual(VALUE);
        });

        it('it should get cookie when multiple cookies are set', () => {
            documentCookieSpy.and.returnValue(` other  =value; ${USERNAME}=${VALUE}`);
            expect(service.getCookie(USERNAME)).toEqual(VALUE);
        });

        it('it should return empty string of invalid key', () => {
            documentCookieSpy.and.returnValue('');
            expect(service.getCookie(USERNAME)).toEqual('');
        });
    });

    describe('deleteCookie', () => {
        let documentCookieSpy: jasmine.Spy;

        beforeEach(() => {
            documentCookieSpy = spyOnProperty(document, 'cookie', 'set');
        });

        it('should set document cookie to expired', () => {
            const expected = `${USERNAME}=; Max-Age=${EXPIRED_COOKIE_AGE}; SameSite=strict`;
            service.eraseCookie(USERNAME);
            expect(documentCookieSpy).toHaveBeenCalledWith(expected);
        });
    });
});
