/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable dot-notation */
// Lint no unused expression must be disabled to use chai syntax
/* eslint-disable @typescript-eslint/no-unused-expressions, no-unused-expressions */
import Player from '@app/classes/player/player';
import * as chai from 'chai';
import { expect } from 'chai';
import * as spies from 'chai-spies';
import { DEFAULT_PLAYER_RATING } from '@common/models/constants';
import { RatingService } from './rating.service';
chai.use(spies);

describe('RatingService', () => {
    let player1: Player;
    let player2: Player;
    let player3: Player;
    let player4: Player;

    beforeEach(() => {
        player1 = new Player('id', { avatar: '', username: '', email: '' });
        player2 = new Player('id', { avatar: '', username: '', email: '' });
        player3 = new Player('id', { avatar: '', username: '', email: '' });
        player4 = new Player('id', { avatar: '', username: '', email: '' });
        player1.adjustedRating = DEFAULT_PLAYER_RATING;
        player2.adjustedRating = DEFAULT_PLAYER_RATING;
        player3.adjustedRating = DEFAULT_PLAYER_RATING;
        player4.adjustedRating = DEFAULT_PLAYER_RATING;
        player1.initialRating = DEFAULT_PLAYER_RATING;
        player2.initialRating = DEFAULT_PLAYER_RATING;
        player3.initialRating = DEFAULT_PLAYER_RATING;
        player4.initialRating = DEFAULT_PLAYER_RATING;
    });

    afterEach(() => {
        chai.spy.restore();
    });

    describe('adjustRatings', () => {
        it('should call evaluateWinner 6 times (3 + 2 + 1)', () => {
            const players = [{} as unknown as Player, {} as unknown as Player, {} as unknown as Player, {} as unknown as Player];
            const conversionSpy = chai.spy.on(RatingService, 'evaluateWinner', () => {});
            RatingService.adjustRatings(players);
            expect(conversionSpy).to.have.been.called.exactly(6);
        });
    });

    describe('adjustAbandoningUserRating', () => {
        it('should decrease the elo of player1', () => {
            const players = [player2, player3, player4];
            const difference = RatingService.adjustAbandoningUserRating(player1, players);
            expect(difference).to.equal(player1.adjustedRating - player1.initialRating);
            expect(player1.adjustedRating < player1.initialRating).to.be.true;
        });
    });

    describe('evaluateWinner', () => {
        it('should decrease the elo of player1 if he has a lower score than player 2', () => {
            player1.score = 0;
            player2.score = 10;
            RatingService['evaluateWinner'](player1, player2);
            expect(player1.adjustedRating < player1.initialRating).to.be.true;
        });

        it('should decrease the elo of player1 the same amount no matter the point difference', () => {
            player1.score = 0;
            player2.score = 10;
            RatingService['evaluateWinner'](player1, player2);
            const differenceLowScoreDiff = player1.adjustedRating - player1.initialRating;
            player1.adjustedRating = player1.initialRating;
            player1.score = 0;
            player2.score = 100000;
            RatingService['evaluateWinner'](player1, player2);
            const differenceHighScoreDiff = player1.adjustedRating - player1.initialRating;
            expect(differenceLowScoreDiff).to.equal(differenceHighScoreDiff);
        });

        it('should decrease the elo of player1 more if he loses to a lower player', () => {
            player1.score = 0;
            player2.score = 10;
            RatingService['evaluateWinner'](player1, player2);
            const differenceSameElo = player1.adjustedRating - player1.initialRating;
            player1.adjustedRating = player1.initialRating;
            player2.initialRating = 500;
            player2.adjustedRating = 500;
            player1.score = 0;
            player2.score = 10;
            RatingService['evaluateWinner'](player1, player2);
            const differenceLoseLowElo = player1.adjustedRating - player1.initialRating;
            expect(differenceLoseLowElo < differenceSameElo).to.be.true;
        });
    });
});
