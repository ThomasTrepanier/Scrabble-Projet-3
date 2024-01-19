import { Injectable } from '@angular/core';
import { ActionData, ActionType, ACTION_COMMAND_INDICATOR, ExchangeActionPayload, PlaceActionPayload } from '@app/classes/actions/action-data';
import { Location } from '@app/classes/actions/location';
import { Orientation } from '@app/classes/actions/orientation';
import { Position } from '@app/classes/board-navigator/position';
import { Player } from '@app/classes/player';
import { LetterValue, Tile } from '@app/classes/tile';
import { BAD_SYNTAX_MESSAGES, CommandExceptionMessages } from '@app/constants/command-exception-messages';
import {
    BLANK_TILE_LETTER_VALUE,
    BOARD_SIZE,
    DEFAULT_ORIENTATION,
    EXPECTED_COMMAND_WORD_COUNT,
    LETTER_VALUES,
    ON_YOUR_TURN_ACTIONS,
    SYSTEM_ERROR_ID,
} from '@app/constants/game-constants';
import { ACTIVE_PLAYER_NOT_FOUND } from '@app/constants/services-errors';
import { GamePlayController } from '@app/controllers/game-play-controller/game-play.controller';
import { GameService } from '@app/services';
import { ActionService } from '@app/services/action-service/action.service';
// import { GameViewEventManagerService } from '@app/services/game-view-event-manager-service/game-view-event-manager.service';
import CommandException from '@app/services/input-parser-service/command-exception';
import { isNumber } from '@app/utils/isNumber/is-number';
import { removeAccents } from '@app/utils/remove-accents/remove-accents';

const ASCII_VALUE_OF_LOWERCASE_A = 97;

@Injectable({
    providedIn: 'root',
})
export default class InputParserService {
    constructor(
        private controller: GamePlayController,
        private gameService: GameService,
        // private gameViewEventManagerService: GameViewEventManagerService,
        private actionService: ActionService,
    ) {}

    handleInput(input: string): void {
        const playerId = this.getLocalPlayer().id;
        const gameId = this.gameService.getGameId();

        if (this.isAction(input)) {
            this.handleCommand(input, gameId);
        } else {
            this.controller.sendMessage(gameId, {
                content: input,
                senderId: playerId,
                gameId,
            });
        }
    }

    isAction(input: string): boolean {
        return input[0] === ACTION_COMMAND_INDICATOR;
    }

    getPlaceActionPayload(input: string): PlaceActionPayload | undefined {
        const inputWords: string[] = this.separateCommandWords(input);
        const actionType: string = inputWords[0];

        switch (actionType) {
            case ActionType.PLACE:
                return this.createPlaceActionPayload(inputWords[1], inputWords[2]);
            default:
                return undefined;
        }
    }

    private handleCommand(input: string, gameId: string): void {
        try {
            this.actionService.sendAction(gameId, this.createActionData(input));
        } catch (exception) {
            if (!(exception instanceof CommandException)) return;
            const errorMessageContent =
                exception.message === CommandExceptionMessages.NotYourTurn
                    ? exception.message
                    : `La commande **${input}** est invalide :<br />${exception.message}`;

            this.controller.sendError(gameId, {
                content: errorMessageContent,
                senderId: SYSTEM_ERROR_ID,
                gameId,
            });
        }
    }

    private createActionData(input: string): ActionData {
        const inputWords: string[] = this.separateCommandWords(input);
        const actionType: string = inputWords[0];

        this.verifyActionValidity(actionType);
        if (inputWords.length !== EXPECTED_COMMAND_WORD_COUNT.get(actionType as ActionType)) {
            throw new CommandException(BAD_SYNTAX_MESSAGES.get(actionType as ActionType) ?? CommandExceptionMessages.BadSyntax);
        }

        switch (actionType) {
            case ActionType.PLACE:
                return this.actionService.createActionData(actionType, this.createPlaceActionPayload(inputWords[1], inputWords[2]), input);
            case ActionType.EXCHANGE:
                return this.actionService.createActionData(actionType, this.createExchangeActionPayload(inputWords[1]), input);
            case ActionType.PASS:
            case ActionType.RESERVE:
            case ActionType.HINT:
            case ActionType.HELP:
                return this.actionService.createActionData(actionType, {}, input);
            default:
                throw new CommandException(CommandExceptionMessages.InvalidEntry);
        }
    }

    private createLocation(locationString: string, nLettersToPlace: number): Location {
        const locationLastChar = locationString.charAt(locationString.length - 1);
        const rowNumber: number = this.getRowNumberFromChar(locationString[0]);
        const colNumber = parseInt(locationString.substring(1), 10) - 1;
        let orientation: Orientation;

        if (isNumber(locationLastChar)) {
            if (nLettersToPlace !== 1) throw new CommandException(BAD_SYNTAX_MESSAGES.get(ActionType.PLACE) ?? CommandExceptionMessages.BadSyntax);
            orientation = DEFAULT_ORIENTATION;
        } else {
            if (locationLastChar === 'h') orientation = Orientation.Horizontal;
            else if (locationLastChar === 'v') orientation = Orientation.Vertical;
            else throw new CommandException(CommandExceptionMessages.BadSyntax);
        }

        return {
            row: rowNumber,
            col: colNumber,
            orientation,
        };
    }

    private createPlaceActionPayload(locationString: string, lettersToPlace: string): PlaceActionPayload {
        const location: Location = this.createLocation(locationString, lettersToPlace.length);

        const placeActionPayload: PlaceActionPayload = this.actionService.createPlaceActionPayload(
            this.parseLettersToTiles(removeAccents(lettersToPlace), ActionType.PLACE),
            this.getStartPosition(location),
            location.orientation,
        );

        // this.gameViewEventManagerService.emitGameViewEvent('usedTiles', placeActionPayload);
        return placeActionPayload;
    }

    private createExchangeActionPayload(lettersToExchange: string): ExchangeActionPayload {
        return this.actionService.createExchangeActionPayload(this.parseLettersToTiles(removeAccents(lettersToExchange), ActionType.EXCHANGE));
    }

    private parseLettersToTiles(lettersToParse: string, actionType: ActionType.PLACE | ActionType.EXCHANGE): Tile[] {
        if (actionType === ActionType.EXCHANGE && lettersToParse !== lettersToParse.toLowerCase()) {
            throw new CommandException(CommandExceptionMessages.ExchangeRequireLowercaseLetters);
        }

        const player: Player = this.getLocalPlayer();
        const playerTiles: Tile[] = [];
        player.getTiles().forEach((tile: Tile) => {
            playerTiles.push(new Tile(tile.letter, tile.value));
        });

        const parsedTiles: Tile[] = this.fillParsedTiles(lettersToParse, playerTiles, actionType);

        if (parsedTiles.length !== lettersToParse.length) throw new CommandException(CommandExceptionMessages.DontHaveTiles);

        return parsedTiles;
    }

    private fillParsedTiles(lettersToParse: string, playerTiles: Tile[], actionType: ActionType.PLACE | ActionType.EXCHANGE): Tile[] {
        const parsedTiles: Tile[] = [];

        for (const letter of lettersToParse) {
            for (let i = Object.values(playerTiles).length - 1; i >= 0; i--) {
                if (playerTiles[i].letter.toLowerCase() === letter) {
                    parsedTiles.push(playerTiles.splice(i, 1)[0]);
                    break;
                } else if (actionType === ActionType.PLACE && this.isValidBlankTileCombination(playerTiles[i].letter, letter)) {
                    const tile: Tile = playerTiles.splice(i, 1)[0];
                    const newTile = new Tile(tile.letter, tile.value, true);
                    newTile.playedLetter = letter as LetterValue;
                    parsedTiles.push(newTile);
                    break;
                }
            }
        }

        return parsedTiles;
    }

    private isValidBlankTileCombination(playerLetter: string, placeLetter: string): boolean {
        return (
            playerLetter === BLANK_TILE_LETTER_VALUE &&
            LETTER_VALUES.includes(placeLetter as LetterValue) &&
            placeLetter === placeLetter.toUpperCase()
        );
    }

    private isPositionWithinBounds(position: Position): boolean {
        return position.row >= 0 && position.column >= 0 && position.row < BOARD_SIZE && position.column < BOARD_SIZE;
    }

    private separateCommandWords(input: string): string[] {
        return input.substring(1).split(' ');
    }

    private verifyActionValidity(actionName: string): void {
        if (!this.isKnownCommand(actionName)) throw new CommandException(CommandExceptionMessages.InvalidEntry);
        if (this.gameService.isGameOver) throw new CommandException(CommandExceptionMessages.GameOver);
        if (!this.gameService.isLocalPlayerPlaying() && ON_YOUR_TURN_ACTIONS.includes(actionName as ActionType))
            throw new CommandException(CommandExceptionMessages.NotYourTurn);
    }

    private isKnownCommand(actionName: string): boolean {
        return Object.values(ActionType).includes(actionName as ActionType);
    }

    private getStartPosition(location: Location): Position {
        const inputStartPosition: Position = {
            row: location.row,
            column: location.col,
        };

        if (!this.isPositionWithinBounds(inputStartPosition)) throw new CommandException(CommandExceptionMessages.PositionFormat);
        return inputStartPosition;
    }

    private getLocalPlayer(): Player {
        const localPlayer: Player | undefined = this.gameService.getLocalPlayer();
        if (localPlayer) {
            return localPlayer;
        }
        throw new Error(ACTIVE_PLAYER_NOT_FOUND);
    }

    private getRowNumberFromChar(char: string): number {
        return char.charCodeAt(0) - ASCII_VALUE_OF_LOWERCASE_A;
    }
}
