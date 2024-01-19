/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import Game from '@app/classes/game/game';
import Player from '@app/classes/player/player';
import { LetterValue, TileReserve } from '@app/classes/tile';
import { UNKOWN_USER } from '@common/models/user';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { ActionReserve } from '..';

const DEFAULT_PLAYER_1_ID = '1';
const DEFAULT_MAP = new Map<LetterValue, number>([
    ['A', 0],
    ['B', 0],
]);

describe('ActionReserve', () => {
    let gameStub: SinonStubbedInstance<Game>;
    let tileReserveStub: SinonStubbedInstance<TileReserve>;
    let action: ActionReserve;

    beforeEach(() => {
        gameStub = createStubInstance(Game);
        tileReserveStub = createStubInstance(TileReserve);

        gameStub.getTilesLeftPerLetter.returns(DEFAULT_MAP);

        gameStub.player1 = new Player(DEFAULT_PLAYER_1_ID, UNKOWN_USER);

        // eslint-disable-next-line dot-notation
        gameStub['tileReserve'] = tileReserveStub as unknown as TileReserve;

        action = new ActionReserve(gameStub.player1, gameStub as unknown as Game);
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('getMessage', () => {
        it('should exist', () => {
            expect(action.getMessage()).to.exist;
        });

        it('should be correct format', () => {
            const expected = '**<span>A</span>**: 0<br>**<span>B</span>**: 0';

            expect(action.getMessage().message).to.equal(expected);
        });
    });

    describe('getOpponentMessage', () => {
        it('should return undefined', () => {
            expect(action.getOpponentMessage()).to.deep.equal({});
        });
    });
});
