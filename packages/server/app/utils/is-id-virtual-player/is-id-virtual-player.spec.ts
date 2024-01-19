/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-unused-expressions */
import { VIRTUAL_PLAYER_ID_PREFIX } from '@app/constants/virtual-player-constants';
import { expect } from 'chai';
import { isIdVirtualPlayer } from './is-id-virtual-player';

describe('isIdVirtualPlayer', () => {
    it('should return true if the name contains virtual-player', () => {
        expect(isIdVirtualPlayer(VIRTUAL_PLAYER_ID_PREFIX + '12345')).to.be.true;
    });
    it('should return false if the name contains virtual-player', () => {
        expect(isIdVirtualPlayer('12345')).to.be.false;
    });
});
