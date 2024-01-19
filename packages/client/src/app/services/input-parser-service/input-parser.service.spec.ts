/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines */
/* eslint-disable dot-notation */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActionType, ACTION_COMMAND_INDICATOR } from '@app/classes/actions/action-data';
import { Location } from '@app/classes/actions/location';
import { Orientation } from '@app/classes/actions/orientation';
import { Position } from '@app/classes/board-navigator/position';
import { Player } from '@app/classes/player';
import { LetterValue, Tile } from '@app/classes/tile';
import { BAD_SYNTAX_MESSAGES, CommandExceptionMessages } from '@app/constants/command-exception-messages';
import { BLANK_TILE_LETTER_VALUE, DEFAULT_ORIENTATION, SYSTEM_ERROR_ID } from '@app/constants/game-constants';
import { ACTIVE_PLAYER_NOT_FOUND } from '@app/constants/services-errors';
import { GamePlayController } from '@app/controllers/game-play-controller/game-play.controller';
import { InputParserService } from '@app/services';
import { ActionService } from '@app/services/action-service/action.service';
import GameService from '@app/services/game-service/game.service';
import CommandException from '@app/services/input-parser-service/command-exception';

describe('InputParserService', () => {
    const VALID_MESSAGE_INPUT = 'How you doin';
    const VALID_LOCATION_INPUT = 'b12h';
    const VALID_LOCATION_INPUT_SINGLE = 'b12';
    const VALID_LETTERS_INPUT_MULTI = 'abc';
    const VALID_LETTERS_INPUT_SINGLE = 'a';

    const VALID_PLACE_INPUT = `${ACTION_COMMAND_INDICATOR}${ActionType.PLACE} ${VALID_LOCATION_INPUT} ${VALID_LETTERS_INPUT_MULTI}`;
    const VALID_EXCHANGE_INPUT = `${ACTION_COMMAND_INDICATOR}${ActionType.EXCHANGE} ${VALID_LETTERS_INPUT_MULTI}`;
    const VALID_PASS_INPUT = `${ACTION_COMMAND_INDICATOR}${ActionType.PASS}`;
    const VALID_PASS_ACTION_DATA = { type: ActionType.PASS, payload: {} };
    const VALID_RESERVE_INPUT = `${ACTION_COMMAND_INDICATOR}${ActionType.RESERVE}`;
    const VALID_HINT_INPUT = `${ACTION_COMMAND_INDICATOR}${ActionType.HINT}`;
    const VALID_HELP_INPUT = `${ACTION_COMMAND_INDICATOR}${ActionType.HELP}`;
    const VALID_POSITION: Position = { row: 0, column: 0 };
    const VALID_LOCATION: Location = { row: 0, col: 0, orientation: DEFAULT_ORIENTATION };

    const DEFAULT_GAME_ID = 'default game id';
    const DEFAULT_PLAYER_ID = 'default player id';
    const DEFAULT_TILES: Tile[] = [
        new Tile('A' as LetterValue, 1),
        new Tile('B' as LetterValue, 1),
        new Tile('C' as LetterValue, 1),
        new Tile('C' as LetterValue, 1),
        new Tile('E' as LetterValue, 1),
        new Tile('E' as LetterValue, 1),
        new Tile('*' as LetterValue, 0, true),
    ];
    const USER1 = { username: 'user1', email: 'email1', avatar: 'avatar1' };
    const DEFAULT_PLAYER = new Player(DEFAULT_PLAYER_ID, USER1, DEFAULT_TILES);
    const DEFAULT_COMMAND_ERROR_MESSAGE = CommandExceptionMessages.InvalidEntry;

    let service: InputParserService;
    let gameServiceSpy: jasmine.SpyObj<GameService>;
    let gamePlayControllerSpy: jasmine.SpyObj<GamePlayController>;
    let actionServiceSpy: jasmine.SpyObj<ActionService>;

    beforeEach(() => {
        gamePlayControllerSpy = jasmine.createSpyObj('GamePlayController', ['sendMessage', 'sendError']);
        gamePlayControllerSpy.sendMessage.and.callFake(() => {
            return;
        });
        gamePlayControllerSpy.sendError.and.callFake(() => {
            return;
        });

        actionServiceSpy = jasmine.createSpyObj('ActionService', [
            'sendAction',
            'createPlaceActionPayload',
            'createExchangeActionPayload',
            'createActionData',
        ]);
        actionServiceSpy.sendAction.and.callFake(() => {
            return;
        });
        actionServiceSpy.createActionData.and.callThrough();
        actionServiceSpy.createPlaceActionPayload.and.callThrough();
        actionServiceSpy.createExchangeActionPayload.and.callThrough();

        gameServiceSpy = jasmine.createSpyObj('GameService', ['getLocalPlayer', 'getGameId', 'isLocalPlayerPlaying']);
        gameServiceSpy.getLocalPlayer.and.returnValue(DEFAULT_PLAYER);
        gameServiceSpy.getGameId.and.returnValue(DEFAULT_GAME_ID);
        gameServiceSpy.isLocalPlayerPlaying.and.returnValue(true);

        TestBed.configureTestingModule({
            providers: [
                { provide: GamePlayController, useValue: gamePlayControllerSpy },
                { provide: GameService, useValue: gameServiceSpy },
                { provide: ActionService, useValue: actionServiceSpy },
                InputParserService,
            ],
            imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
        });
        service = TestBed.inject(InputParserService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('handleInput', () => {
        it('should always call getLocalPLayer, gameservice.getGameId', () => {
            const getLocalPlayerSpy = spyOn<any>(service, 'getLocalPlayer').and.returnValue(DEFAULT_PLAYER_ID);
            service.handleInput(VALID_MESSAGE_INPUT);
            expect(getLocalPlayerSpy).toHaveBeenCalled();
            expect(gameServiceSpy.getGameId).toHaveBeenCalled();
        });

        it('should call sendMessage if input doesnt start with !', () => {
            service.handleInput(VALID_MESSAGE_INPUT);
            expect(gamePlayControllerSpy.sendMessage).toHaveBeenCalled();
        });

        it('should call handleCommand if input starts with !', () => {
            const spy = spyOn<any>(service, 'handleCommand').and.returnValue(VALID_PASS_ACTION_DATA);
            service.handleInput(VALID_PASS_INPUT);
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('handleCommand', () => {
        it('should call sendAction if actionData doesnt throw error', () => {
            spyOn<any>(service, 'createActionData').and.returnValue(VALID_PASS_ACTION_DATA);
            service['handleCommand'](VALID_PASS_INPUT, DEFAULT_GAME_ID);
            expect(actionServiceSpy.sendAction).toHaveBeenCalled();
        });

        it('should have right error message content if createActionData throws error NotYourTurn', () => {
            spyOn<any>(service, 'getLocalPlayer').and.returnValue(DEFAULT_PLAYER);
            spyOn<any>(service, 'createActionData').and.callFake(() => {
                throw new CommandException(DEFAULT_COMMAND_ERROR_MESSAGE);
            });
            service['handleCommand'](VALID_PASS_INPUT, DEFAULT_GAME_ID);
            expect(gamePlayControllerSpy.sendError).toHaveBeenCalledWith(DEFAULT_GAME_ID, {
                content: `La commande **${VALID_PASS_INPUT}** est invalide :<br />${DEFAULT_COMMAND_ERROR_MESSAGE}`,
                senderId: SYSTEM_ERROR_ID,
                gameId: DEFAULT_GAME_ID,
            });
        });

        it('should have right error message content if createActionData throws other commandError', () => {
            spyOn<any>(service, 'getLocalPlayer').and.returnValue(DEFAULT_PLAYER);
            spyOn<any>(service, 'createActionData').and.callFake(() => {
                throw new CommandException(CommandExceptionMessages.NotYourTurn);
            });
            service['handleCommand'](VALID_PASS_INPUT, DEFAULT_GAME_ID);
            expect(gamePlayControllerSpy.sendError).toHaveBeenCalledWith(DEFAULT_GAME_ID, {
                content: CommandExceptionMessages.NotYourTurn,
                senderId: SYSTEM_ERROR_ID,
                gameId: DEFAULT_GAME_ID,
            });
        });

        it('should not throw if error thrown by createActionData is not a CommandError', () => {
            spyOn<any>(service, 'getLocalPlayer').and.returnValue(DEFAULT_PLAYER);
            spyOn<any>(service, 'createActionData').and.callFake(() => {
                throw new Error('other error message');
            });
            expect(() => service['handleCommand'](VALID_PASS_INPUT, DEFAULT_GAME_ID)).not.toThrow();
            expect(gamePlayControllerSpy.sendError).not.toHaveBeenCalled();
        });
    });

    describe('createActionData', () => {
        it('should call separateCommandWords and verifyActionValidity', () => {
            const separateSpy = spyOn<any>(service, 'separateCommandWords').and.returnValue([ActionType.PASS]);
            const verifyValiditySpy = spyOn<any>(service, 'verifyActionValidity');
            service['createActionData'](VALID_PASS_INPUT);
            expect(separateSpy).toHaveBeenCalled();
            expect(verifyValiditySpy).toHaveBeenCalled();
        });

        it('should throw error if commands have incorrect lengths', () => {
            const invalidCommands: [command: string, error: string][] = [
                [`${ACTION_COMMAND_INDICATOR}placer abc`, BAD_SYNTAX_MESSAGES.get(ActionType.PLACE) ?? CommandExceptionMessages.BadSyntax],
                [
                    `${ACTION_COMMAND_INDICATOR}échanger one two three`,
                    BAD_SYNTAX_MESSAGES.get(ActionType.EXCHANGE) ?? CommandExceptionMessages.BadSyntax,
                ],
                [`${ACTION_COMMAND_INDICATOR}passer thing`, BAD_SYNTAX_MESSAGES.get(ActionType.PASS) ?? CommandExceptionMessages.BadSyntax],
                [
                    `${ACTION_COMMAND_INDICATOR}indice not length of two`,
                    BAD_SYNTAX_MESSAGES.get(ActionType.HINT) ?? CommandExceptionMessages.BadSyntax,
                ],
                [`${ACTION_COMMAND_INDICATOR}aide help`, BAD_SYNTAX_MESSAGES.get(ActionType.HELP) ?? CommandExceptionMessages.BadSyntax],
            ];

            for (const [command, error] of invalidCommands) {
                expect(() => service['createActionData'](command)).toThrow(new CommandException(error));
            }
        });

        it('should throw error if command does not exist', () => {
            spyOn<any>(service, 'verifyActionValidity').and.returnValue(true);
            spyOn<any>(Map.prototype, 'get').and.returnValue(1);

            expect(() => {
                service['createActionData']('!trouverunami');
            }).toThrow(new CommandException(CommandExceptionMessages.InvalidEntry));
        });

        it('should call actionService.createActionData for all valid command types', () => {
            const validInputs = [VALID_PLACE_INPUT, VALID_EXCHANGE_INPUT, VALID_PASS_INPUT, VALID_HINT_INPUT, VALID_HELP_INPUT, VALID_RESERVE_INPUT];

            for (const input of validInputs) {
                service['createActionData'](input);
                expect(actionServiceSpy.createActionData).toHaveBeenCalled();
            }
        });
    });

    describe('getRowNumberFromChar', () => {
        it('should return right value', () => {
            /* eslint-disable @typescript-eslint/no-magic-numbers */
            const rowChars: string[] = ['a', 'b', 'g', 'o', 'z'];
            const expectedRows: number[] = [0, 1, 6, 14, 25];
            /* eslint-enable @typescript-eslint/no-magic-numbers */

            for (let i = 0; i < rowChars.length; i++) {
                expect(service['getRowNumberFromChar'](rowChars[i])).toEqual(expectedRows[i]);
            }
        });
    });

    describe('createLocation', () => {
        it('should call getRowNumberFromChar', () => {
            const spy = spyOn<any>(service, 'getRowNumberFromChar');
            service['createLocation'](VALID_LOCATION_INPUT, VALID_LETTERS_INPUT_MULTI.length);
            expect(spy).toHaveBeenCalled();
        });

        it('should return right rowNumber and columnNumber', () => {
            /* eslint-disable @typescript-eslint/no-magic-numbers */
            const locationStrings: string[] = ['a1h', 'a15v', 'b18', 'g12h', 'f1v', 'z12v', 'o15h', 'o1'];
            const expectedPositions: number[][] = [
                [0, 0],
                [0, 14],
                [1, 17],
                [6, 11],
                [5, 0],
                [25, 11],
                [14, 14],
                [14, 0],
            ];
            /* eslint-enable @typescript-eslint/no-magic-numbers */

            for (let i = 0; i < locationStrings.length; i++) {
                const result = service['createLocation'](locationStrings[i], 1);
                expect(result.row).toEqual(expectedPositions[i][0]);
                expect(result.col).toEqual(expectedPositions[i][1]);
            }
        });

        it('should throw if lastChar is a number and trying to place multiple letters', () => {
            expect(() => {
                service['createLocation'](VALID_LOCATION_INPUT_SINGLE, VALID_LETTERS_INPUT_MULTI.length);
            }).toThrow(new CommandException(BAD_SYNTAX_MESSAGES.get(ActionType.PLACE) ?? CommandExceptionMessages.BadSyntax));
        });

        it('should have horizontal orientation if last char is number and trying to place one letter', () => {
            expect(service['createLocation'](VALID_LOCATION_INPUT, 1).orientation).toEqual(DEFAULT_ORIENTATION);
            expect(service['createLocation'](VALID_LOCATION_INPUT_SINGLE, 1).orientation).toEqual(DEFAULT_ORIENTATION);
        });

        it('should throw if last char is not a number and is not h or v', () => {
            expect(() => {
                service['createLocation']('a1x', VALID_LETTERS_INPUT_MULTI.length);
            }).toThrow(new CommandException(CommandExceptionMessages.BadSyntax));
        });

        it('should have horizontal orientation if last char is h', () => {
            expect(service['createLocation']('a1h', 1).orientation).toEqual(Orientation.Horizontal);
        });

        it('should have vertical orientation if last char is v', () => {
            expect(service['createLocation']('a1v', 1).orientation).toEqual(Orientation.Vertical);
        });
    });

    describe('createPlaceActionPayload', () => {
        it('should call createLocation, parsePlaceLettersToTiles et getStartPosition', () => {
            const createLocationSpy = spyOn<any>(service, 'createLocation').and.returnValue(VALID_LOCATION);
            const lettersToTilesSpy = spyOn<any>(service, 'parseLettersToTiles');
            const positionSpy = spyOn<any>(service, 'getStartPosition').and.returnValue(VALID_POSITION);
            service['createPlaceActionPayload'](VALID_LOCATION_INPUT, VALID_LETTERS_INPUT_SINGLE);
            expect(createLocationSpy).toHaveBeenCalledWith(VALID_LOCATION_INPUT, VALID_LETTERS_INPUT_SINGLE.length);
            expect(lettersToTilesSpy).toHaveBeenCalledWith(VALID_LETTERS_INPUT_SINGLE, ActionType.PLACE);
            expect(positionSpy).toHaveBeenCalled();
        });

        it('should call createPlaceActionPayload if input is a valid place command', () => {
            service['createPlaceActionPayload'](VALID_LOCATION_INPUT, VALID_LETTERS_INPUT_SINGLE);
            expect(actionServiceSpy.createPlaceActionPayload).toHaveBeenCalled();
        });

        it('should call createPlaceActionPayload if input is a valid place command', () => {
            service['createPlaceActionPayload'](VALID_LOCATION_INPUT, 'à');
            expect(actionServiceSpy.createPlaceActionPayload).toHaveBeenCalledWith(
                [DEFAULT_TILES[0]],
                { row: 1, column: 11 },
                Orientation.Horizontal,
            );
        });
    });

    describe('createExchangeActionPayload', () => {
        it('should call parseLettersToTiles with right attributes', () => {
            const letterToTilesSpy = spyOn<any>(service, 'parseLettersToTiles');
            service['createExchangeActionPayload'](VALID_LETTERS_INPUT_MULTI);
            expect(letterToTilesSpy).toHaveBeenCalledWith(VALID_LETTERS_INPUT_MULTI, ActionType.EXCHANGE);
        });

        it('should call createExchangeActionPayload if input is a valid exchange command', () => {
            service['createExchangeActionPayload'](VALID_LETTERS_INPUT_MULTI);
            expect(actionServiceSpy.createExchangeActionPayload).toHaveBeenCalled();
        });
    });

    describe('parseLettersToTiles', () => {
        it('should return valid tiles with valid input for place actions', () => {
            const blankTileX = new Tile(BLANK_TILE_LETTER_VALUE, 0, true);
            blankTileX.playedLetter = 'X';
            const blankTileK = new Tile(BLANK_TILE_LETTER_VALUE, 0, true);
            blankTileK.playedLetter = 'K';
            const validLetters = ['abce', 'ceX', 'bKcc', 'ccee'];
            const expectedTiles: Tile[][] = [
                [new Tile('A' as LetterValue, 1), new Tile('B' as LetterValue, 1), new Tile('C' as LetterValue, 1), new Tile('E' as LetterValue, 1)],
                [new Tile('C' as LetterValue, 1), new Tile('E' as LetterValue, 1), blankTileX],
                [new Tile('B' as LetterValue, 1), blankTileK, new Tile('C' as LetterValue, 1), new Tile('C' as LetterValue, 1)],
                [new Tile('C' as LetterValue, 1), new Tile('C' as LetterValue, 1), new Tile('E' as LetterValue, 1), new Tile('E' as LetterValue, 1)],
            ];

            for (let i = 0; i < validLetters.length; i++) {
                expect(service['parseLettersToTiles'](validLetters[i], ActionType.PLACE)).toEqual(expectedTiles[i]);
            }
        });

        it('should throw error with invalid input for place actions', () => {
            const invalidLetters = ['a&c"exception', 'abcdefghiklm', 'lmno', 'ABCD', 'aAB', 'aKL'];
            const errorMessages: CommandExceptionMessages[] = [
                CommandExceptionMessages.DontHaveTiles,
                CommandExceptionMessages.DontHaveTiles,
                CommandExceptionMessages.DontHaveTiles,
                CommandExceptionMessages.DontHaveTiles,
                CommandExceptionMessages.DontHaveTiles,
                CommandExceptionMessages.DontHaveTiles,
            ];

            for (let i = 0; i < invalidLetters.length; i++) {
                expect(() => {
                    service['parseLettersToTiles'](invalidLetters[i], ActionType.PLACE);
                }).toThrow(new CommandException(errorMessages[i]));
            }
        });

        it('should return valid tiles with valid input for exchange actions', () => {
            const validLetters = ['abce', 'ab*', 'ccee'];
            const expectedTiles: Tile[][] = [
                [new Tile('A' as LetterValue, 1), new Tile('B' as LetterValue, 1), new Tile('C' as LetterValue, 1), new Tile('E' as LetterValue, 1)],
                [new Tile('A' as LetterValue, 1), new Tile('B' as LetterValue, 1), new Tile('*' as LetterValue, 0)],
                [new Tile('C' as LetterValue, 1), new Tile('C' as LetterValue, 1), new Tile('E' as LetterValue, 1), new Tile('E' as LetterValue, 1)],
            ];

            for (let i = 0; i < validLetters.length; i++) {
                expect(service['parseLettersToTiles'](validLetters[i], ActionType.EXCHANGE)).toEqual(expectedTiles[i]);
            }
        });

        it('should throw error with invalid input for exchange actions', () => {
            const invalidLetters = ['a&c"exception', 'abcdefghiklm', 'lmno', 'ABCD', 'aaaa'];
            const errorMessages: CommandExceptionMessages[] = [
                CommandExceptionMessages.DontHaveTiles,
                CommandExceptionMessages.DontHaveTiles,
                CommandExceptionMessages.DontHaveTiles,
                CommandExceptionMessages.ExchangeRequireLowercaseLetters,
                CommandExceptionMessages.DontHaveTiles,
            ];

            for (let i = 0; i < invalidLetters.length; i++) {
                expect(() => {
                    service['parseLettersToTiles'](invalidLetters[i], ActionType.EXCHANGE);
                }).toThrow(new CommandException(errorMessages[i]));
            }
        });
    });

    describe('isValidBlankTileCombination', () => {
        const VALID_PLAYER_LETTER = '*';
        const VALID_PLACE_LETTER = 'A';

        it('should return true if combination for blank tile is valid', () => {
            expect(service['isValidBlankTileCombination'](VALID_PLAYER_LETTER, VALID_PLACE_LETTER)).toBeTrue();
        });

        it('should return false if player tile is not *', () => {
            expect(service['isValidBlankTileCombination']('A', VALID_PLACE_LETTER)).toBeFalse();
        });

        it('should return false if placeLetter is not a valid LetterValue', () => {
            expect(service['isValidBlankTileCombination'](VALID_PLAYER_LETTER, '^')).toBeFalse();
        });

        it('should return false if placeLetter is in lower case', () => {
            expect(service['isValidBlankTileCombination'](VALID_PLAYER_LETTER, 'a')).toBeFalse();
        });
    });

    describe('isPositionWithinBounds', () => {
        it('should retrun false if position is invalid', () => {
            const invalidPositions: Position[] = [
                { row: -2, column: 0 },
                { row: -2, column: -5 },
                { row: 5, column: 18 },
                { row: 88, column: 693 },
            ];

            for (const invalidPosition of invalidPositions) {
                expect(service['isPositionWithinBounds'](invalidPosition)).toBeFalse();
            }
        });

        it('should return true if position if is in bounds', () => {
            expect(service['isPositionWithinBounds'](VALID_POSITION)).toBeTrue();
        });
    });

    describe('isAction', () => {
        it('should return true if input starts with right indicator', () => {
            expect(service['isAction'](VALID_EXCHANGE_INPUT)).toBeTrue();
        });

        it('should return false if input does not start with right indicator', () => {
            expect(service['isAction'](VALID_MESSAGE_INPUT)).toBeFalse();
        });
    });

    describe('separateCommandWords', () => {
        it('should return right input words from command', () => {
            const expected = [ActionType.PLACE, VALID_LOCATION_INPUT, VALID_LETTERS_INPUT_MULTI];
            expect(service['separateCommandWords'](VALID_PLACE_INPUT)).toEqual(expected);
        });
    });

    describe('verifyActionValidity', () => {
        it('should throw error if actionType is undefined', () => {
            expect(() => {
                service['verifyActionValidity'](undefined as unknown as ActionType);
            }).toThrow(new CommandException(CommandExceptionMessages.InvalidEntry));
        });

        it('should throw error if game is over', () => {
            gameServiceSpy.isGameOver = true;
            expect(() => {
                service['verifyActionValidity'](ActionType.RESERVE);
            }).toThrow(new CommandException(CommandExceptionMessages.GameOver));
        });

        it("should throw error if trying to pass and it is not the player's turn", () => {
            gameServiceSpy.isGameOver = false;
            gameServiceSpy.isLocalPlayerPlaying.and.returnValue(false);
            expect(() => {
                service['verifyActionValidity'](ActionType.PASS);
            }).toThrow(new CommandException(CommandExceptionMessages.NotYourTurn));
        });

        it("should throw error if trying to get hint and it is not the player's turn", () => {
            gameServiceSpy.isGameOver = false;
            gameServiceSpy.isLocalPlayerPlaying.and.returnValue(false);
            expect(() => {
                service['verifyActionValidity'](ActionType.HINT);
            }).toThrow(new CommandException(CommandExceptionMessages.NotYourTurn));
        });
    });

    describe('isKnownCommand', () => {
        it('should return false if command type is not in enum', () => {
            expect(service['isKnownCommand']('bonjour')).toBeFalse();
        });

        it('should return true if command type is in enum', () => {
            expect(service['isKnownCommand']('aide')).toBeTrue();
        });
    });

    describe('getStartPosition', () => {
        it('should call isPositionWithinBounds', () => {
            const isWithinBoundsSpy = spyOn<any>(service, 'isPositionWithinBounds').and.returnValue(true);
            service['getStartPosition'](VALID_LOCATION);
            expect(isWithinBoundsSpy).toHaveBeenCalledWith(VALID_POSITION);
        });

        it('should return right position with valid location', () => {
            expect(service['getStartPosition'](VALID_LOCATION)).toEqual(VALID_POSITION);
        });

        it('should throw if position is not within bounds', () => {
            spyOn<any>(service, 'isPositionWithinBounds').and.returnValue(false);
            expect(() => {
                service['getStartPosition'](VALID_LOCATION);
            }).toThrow(new CommandException(CommandExceptionMessages.PositionFormat));
        });
    });

    describe('getLocalPlayer', () => {
        it('should call gameService.getLocalPlayer()', () => {
            gameServiceSpy.getLocalPlayer.and.returnValue(DEFAULT_PLAYER);
            service['getLocalPlayer']();
            expect(gameServiceSpy.getLocalPlayer).toHaveBeenCalled();
        });

        it('should return player if gameservice.localPlayer exits', () => {
            gameServiceSpy.getLocalPlayer.and.returnValue(DEFAULT_PLAYER);
            expect(service['getLocalPlayer']()).toEqual(DEFAULT_PLAYER);
        });

        it('should throw PLAYER_NOT_FOUND if gameservice.localPlayer does not exist', () => {
            gameServiceSpy.getLocalPlayer.and.returnValue(undefined);
            expect(() => service['getLocalPlayer']()).toThrowError(ACTIVE_PLAYER_NOT_FOUND);
        });
    });
});
