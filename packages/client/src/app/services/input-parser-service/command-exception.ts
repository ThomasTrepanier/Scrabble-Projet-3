import { CommandExceptionMessages } from '@app/constants/command-exception-messages';

export default class CommandException extends Error {
    constructor(message: CommandExceptionMessages | string) {
        super(message);
        Object.setPrototypeOf(this, CommandException.prototype);
        this.name = 'CommandException';
    }
}
