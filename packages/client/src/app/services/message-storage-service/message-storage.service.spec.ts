/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { INITIAL_MESSAGE } from '@app/constants/controller-constants';
import { MESSAGE_STORAGE_KEY } from '@app/constants/session-storage-constants';
import { MessageStorageService } from './message-storage.service';

const DEFAULT_GAME_ID = 'game id';
const DEFAULT_MESSAGE = { ...INITIAL_MESSAGE, gameId: DEFAULT_GAME_ID };
const TEST_MESSAGES = [DEFAULT_MESSAGE, DEFAULT_MESSAGE, DEFAULT_MESSAGE];

describe('SessionStorageService', () => {
    let service: MessageStorageService;
    let getSpy: jasmine.Spy;
    let setSpy: jasmine.Spy;
    let clearSpy: jasmine.Spy;
    let storage: any = {};

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MessageStorageService);
    });

    beforeEach(() => {
        // Mock sessionStorage
        storage = {};
        getSpy = spyOn(window.sessionStorage, 'getItem').and.callFake((key: string): string => {
            return storage[key] || null;
        });
        setSpy = spyOn(window.sessionStorage, 'setItem').and.callFake((key: string, value: string): string => {
            return (storage[key] = value);
        });
        clearSpy = spyOn(window.sessionStorage, 'clear').and.callFake(() => {
            storage = {};
        });
    });

    afterEach(() => {
        storage = {};
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('initialize', () => {
        it('should not call setItem if key exists', () => {
            storage[MESSAGE_STORAGE_KEY] = [];
            service.initializeMessages();
            expect(setSpy).not.toHaveBeenCalled();
        });

        it('should call setItem if key does not exist', () => {
            service.initializeMessages();
            expect(setSpy).toHaveBeenCalled();
        });
    });

    describe('getMessages', () => {
        it('should call getItem', () => {
            service.getMessages();
            expect(getSpy).toHaveBeenCalled();
        });

        it('should return empty array if getItem returns null', () => {
            getSpy.and.returnValue(null);
            expect(service.getMessages()).toEqual([]);
        });

        it('should return local messages if getItem returns value', () => {
            storage[MESSAGE_STORAGE_KEY] = JSON.stringify(TEST_MESSAGES);
            expect(service.getMessages()).toEqual(TEST_MESSAGES);
        });
    });

    describe('saveMessage', () => {
        it('should call getMessages and setItem', () => {
            const spy = spyOn(service, 'getMessages').and.returnValue(TEST_MESSAGES);
            service.saveMessage(DEFAULT_MESSAGE);
            expect(spy).toHaveBeenCalled();
            expect(setSpy).toHaveBeenCalled();
        });

        it('should add new message to storage', () => {
            storage[MESSAGE_STORAGE_KEY] = JSON.stringify(TEST_MESSAGES);
            spyOn(service, 'getMessages').and.returnValue(TEST_MESSAGES);
            const lengthBefore = TEST_MESSAGES.length;

            service.saveMessage(DEFAULT_MESSAGE);
            const lengthAfter = JSON.parse(storage[MESSAGE_STORAGE_KEY]).length;
            expect(lengthAfter).toEqual(lengthBefore + 1);
        });
    });

    describe('resetMessages', () => {
        it('should call clear', () => {
            service.resetMessages();
            expect(clearSpy).toHaveBeenCalled();
        });
    });
});
