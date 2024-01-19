/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */

import Game from '@app/classes/game/game';
import Player from '@app/classes/player/player';
import { expect } from 'chai';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { ActionPass } from '..';
import * as sinon from 'sinon';
import { UNKOWN_USER } from '@common/models/user';

const DEFAULT_PLAYER_1_ID = '1';

describe('ActionPass', () => {
    let gameStub: SinonStubbedInstance<Game>;
    let action: ActionPass;

    beforeEach(() => {
        gameStub = createStubInstance(Game);

        gameStub.player1 = new Player(DEFAULT_PLAYER_1_ID, UNKOWN_USER);

        action = new ActionPass(gameStub.player1, gameStub as unknown as Game);
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('execute ', () => {
        it('should not return anything', () => {
            expect(action.execute()).to.not.exist;
        });
    });

    describe('getMessage', () => {
        it('should return message', () => {
            expect(action.getMessage()).to.exist;
        });
    });

    describe('getOpponentMessage', () => {
        it('should return message', () => {
            expect(action.getOpponentMessage()).to.exist;
        });

        it('should be different from getMessage', () => {
            expect(action.getOpponentMessage()).to.not.equal(action.getMessage());
        });
    });
});
