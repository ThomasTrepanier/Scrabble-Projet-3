/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { ActionData, ActionType, ExchangeActionPayload, PlaceActionPayload } from '@app/classes/actions/action-data';
import { Orientation } from '@app/classes/actions/orientation';
import { Tile } from '@app/classes/tile';
import { WAIT_FOR_COMMAND_CONFIRMATION_MESSAGE } from '@app/constants/services-errors';
import { ActionPayloadToString } from '@app/utils/action-payload-to-string/action-payload-to-string';
import { ActionService } from './action.service';

const DEFAULT_GAME_ID = 'some id';

const DEFAULT_TILES: Tile[] = [new Tile('A', 1), new Tile('A', 2, true)];
const PLACE_PAYLOAD: PlaceActionPayload = {
    tiles: DEFAULT_TILES,
    startPosition: { row: 0, column: 0 },
    orientation: Orientation.Horizontal,
};

const EXCHANGE_PAYLOAD: ExchangeActionPayload = {
    tiles: DEFAULT_TILES,
};

describe('ActionService', () => {
    let service: ActionService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule, MatSnackBarModule],
        });
        service = TestBed.inject(ActionService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('ngOnDestroy should call serviceDestroyed$.complete', () => {
        const completeSpy = spyOn(service['serviceDestroyed$'], 'complete').and.callFake(() => {
            return;
        });
        service.ngOnDestroy();
        expect(completeSpy).toHaveBeenCalled();
    });

    describe('subscription handling', () => {
        let resetActionSpy: jasmine.Spy;

        beforeEach(() => {
            resetActionSpy = spyOn<any>(service, 'resetHasActionBeenSent').and.callFake(() => {
                return;
            });
        });

        it('should reset hasActionBeenPlayed if service received actionDone event', () => {
            service['gamePlayController']['actionDone$'].next();
            expect(resetActionSpy).toHaveBeenCalled();
        });
    });

    describe('createPlaceActionPayload', () => {
        it('should return ActionPlacePayload with the correct attributes', () => {
            const expectedPayload: PlaceActionPayload = PLACE_PAYLOAD;
            const actualPayload = service.createPlaceActionPayload(PLACE_PAYLOAD.tiles, PLACE_PAYLOAD.startPosition, PLACE_PAYLOAD.orientation);
            expect(actualPayload).toEqual(expectedPayload);
            expect(typeof actualPayload).toBe(typeof expectedPayload);
        });
    });

    describe('createPlaceActionPayload', () => {
        it('should return ActionExchangePayload with the correct attributes', () => {
            const expectedPayload: ExchangeActionPayload = EXCHANGE_PAYLOAD;
            const actualPayload = service.createExchangeActionPayload(DEFAULT_TILES);
            expect(actualPayload).toEqual(expectedPayload);
            expect(typeof actualPayload).toBe(typeof expectedPayload);
        });
    });

    describe('createActionData', () => {
        let inputSpy: jasmine.Spy;
        let actualData: ActionData;

        beforeEach(() => {
            inputSpy = spyOn<any>(service, 'createInputFromPayload').and.returnValue('spyInput');
        });

        it('if input is defined, should not call createInputFromPayload', () => {
            actualData = service.createActionData(ActionType.PASS, {}, 'input');
            expect(inputSpy).not.toHaveBeenCalled();
            expect(actualData.input).toEqual('input');
        });

        it('if input is NOT defined and place action, should call createInputFromPayload', () => {
            actualData = service.createActionData(ActionType.PLACE, {});
            expect(inputSpy).toHaveBeenCalledWith(ActionType.PLACE, {});
            expect(actualData.input).toEqual('spyInput');
        });

        it('if input is NOT defined and exchange action, should call createInputFromPayload', () => {
            actualData = service.createActionData(ActionType.EXCHANGE, {});
            expect(inputSpy).toHaveBeenCalledWith(ActionType.EXCHANGE, {});
            expect(actualData.input).toEqual('spyInput');
        });

        it('if input is NOT defined and pass action, should NOT call createInputFromPayload', () => {
            service.createActionData(ActionType.PASS, {});
            expect(inputSpy).not.toHaveBeenCalled();
        });

        it('should return ActionData with correct values', () => {
            actualData = service.createActionData(ActionType.EXCHANGE, EXCHANGE_PAYLOAD, 'input');
            const expectedData: ActionData<ExchangeActionPayload> = {
                type: ActionType.EXCHANGE,
                payload: EXCHANGE_PAYLOAD,
                input: 'input',
            };
            expect(actualData).toEqual(expectedData);
        });
    });

    describe('actionNeedsInput', () => {
        it('should return true if PLACE', () => {
            expect(service['actionNeedsInput'](ActionType.PLACE, false)).toBeTrue();
        });

        it('should return true if EXCHANGE', () => {
            expect(service['actionNeedsInput'](ActionType.EXCHANGE, false)).toBeTrue();
        });

        it('should return true if PASS wit needsinput true', () => {
            expect(service['actionNeedsInput'](ActionType.PASS, true)).toBeTrue();
        });

        it('should return false if PASS wit needsinput false', () => {
            expect(service['actionNeedsInput'](ActionType.PASS, false)).toBeFalse();
        });
    });

    describe('sendAction', () => {
        let errorMessageSpy: jasmine.Spy;
        let sendActionSpy: jasmine.Spy;
        let actionData: ActionData<ExchangeActionPayload>;

        beforeEach(() => {
            errorMessageSpy = spyOn<any>(service, 'sendWaitForConfirmationMessage').and.callFake(() => {
                return;
            });
            sendActionSpy = spyOn(service['gamePlayController'], 'sendAction').and.callFake(() => {
                return;
            });
            actionData = {
                type: ActionType.EXCHANGE,
                payload: EXCHANGE_PAYLOAD,
                input: 'input',
            };
            service.hasActionBeenPlayed = false;
        });

        it('if action has been played, should not sendAction and send error', () => {
            service.hasActionBeenPlayed = true;
            service.sendAction(DEFAULT_GAME_ID, actionData);
            expect(sendActionSpy).not.toHaveBeenCalled();
            expect(errorMessageSpy).toHaveBeenCalledWith(DEFAULT_GAME_ID);
        });

        it('should call gamePlayController.sendAction with provided data', () => {
            service.sendAction(DEFAULT_GAME_ID, actionData);
            expect(sendActionSpy).toHaveBeenCalledWith(DEFAULT_GAME_ID, actionData);
        });

        it('should set hasActionBeenPlayed to true', () => {
            service.sendAction(DEFAULT_GAME_ID, actionData);
            expect(service.hasActionBeenPlayed).toBeTrue();
        });
    });

    it('resetServiceData should set hasActionBeenPlayed to false', () => {
        service.hasActionBeenPlayed = true;
        service.resetServiceData();
        expect(service.hasActionBeenPlayed).toBeFalse();
    });

    describe('createInputFromPayload', () => {
        it('should call placeActionPayloadToString on PLACE action', () => {
            const spy = spyOn(ActionPayloadToString, 'placeActionPayloadToString').and.returnValue('');
            service['createInputFromPayload'](ActionType.PLACE, {});
            expect(spy).toHaveBeenCalled();
        });

        it('should call exchangeActionPayloadToString on EXCHANGE action', () => {
            const spy = spyOn(ActionPayloadToString, 'exchangeActionPayloadToString').and.returnValue('');
            service['createInputFromPayload'](ActionType.EXCHANGE, {});
            expect(spy).toHaveBeenCalled();
        });

        it('should call simpleActionToString on other actions', () => {
            const spy = spyOn(ActionPayloadToString, 'simpleActionToString').and.returnValue('');
            service['createInputFromPayload'](ActionType.PASS, {});
            expect(spy).toHaveBeenCalled();
        });
    });

    it('sendWaitForConfirmationMessage should sendError to gamePlayController', () => {
        const sendSpy = spyOn(service['gamePlayController'], 'sendError').and.callFake(() => {
            return;
        });
        service['sendWaitForConfirmationMessage'](DEFAULT_GAME_ID);
        expect(sendSpy).toHaveBeenCalledWith(DEFAULT_GAME_ID, WAIT_FOR_COMMAND_CONFIRMATION_MESSAGE(DEFAULT_GAME_ID));
    });

    it('resetHasActionBeenSent should set hasActionBeenPlayed to false', () => {
        service.hasActionBeenPlayed = true;
        service['resetHasActionBeenSent']();
        expect(service.hasActionBeenPlayed).toBeFalse();
    });
});
