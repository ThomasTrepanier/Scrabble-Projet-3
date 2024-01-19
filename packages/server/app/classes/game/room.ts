import { v4 as uuidv4 } from 'uuid';

export default class Room {
    private id: string;

    constructor(prefix: string = '') {
        this.id = prefix + uuidv4();
    }

    getId(): string {
        return this.id;
    }
}
