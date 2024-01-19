import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { LOGIN_REQUIRED } from '@app/constants/services-errors';
import { UserController } from '@app/controllers/user-controller/user.controller';
import { GameHistoryForUser } from '@common/models/game-history';
import { PublicServerAction } from '@common/models/server-action';
import { PublicUser } from '@common/models/user';
import { PublicUserStatistics } from '@common/models/user-statistics';
import { of } from 'rxjs';
import { UserService } from './user.service';

const USER: PublicUser = {
    avatar: 'avatar',
    email: 'email',
    username: 'username',
};

describe('UserService', () => {
    let service: UserService;
    let userController: jasmine.SpyObj<UserController>;

    beforeEach(() => {
        userController = jasmine.createSpyObj(UserController, ['editUser', 'getUserStatistics', 'getGameHistory', 'getServerActions']);
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, MatSnackBarModule, MatDialogModule],
            providers: [{ provide: UserController, useValue: userController }],
        });
        service = TestBed.inject(UserService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('isConnected', () => {
        it('should pass true if has user', (done) => {
            service.user.next(USER);

            service.isConnected().subscribe((isConnected) => {
                expect(isConnected).toBeTrue();
                done();
            });
        });

        it('should pass false if has no user', (done) => {
            service.isConnected().subscribe((isConnected) => {
                expect(isConnected).toBeFalse();
                done();
            });
        });
    });

    describe('getUser', () => {
        it('should return user', () => {
            service.user.next(USER);

            expect(service.getUser()).toEqual(USER);
        });

        it('should throw if not logged in', () => {
            expect(() => service.getUser()).toThrowError(LOGIN_REQUIRED);
        });
    });

    describe('isUser', () => {
        it('should return true if is user', () => {
            service.user.next(USER);

            expect(service.isUser(USER)).toBeTrue();
        });

        it('should return true if is username', () => {
            service.user.next(USER);

            expect(service.isUser(USER.username)).toBeTrue();
        });

        it('should be false if is not user', () => {
            service.user.next(USER);

            expect(service.isUser({ ...USER, username: 'not username' })).toBeFalse();
        });

        it('should return false if is not username', () => {
            service.user.next(USER);

            expect(service.isUser('not username')).toBeFalse();
        });

        it('should return false if no user', () => {
            expect(service.isUser(USER.username)).toBeFalse();
        });
    });

    describe('updateStatistics', () => {
        it('should pass value to statistics', () => {
            const statistics: PublicUserStatistics = {} as PublicUserStatistics;
            userController.getUserStatistics.and.returnValue(of(statistics));

            service.updateStatistics();

            expect(service.statistics.value).toBe(statistics);
        });
    });

    describe('updateGameHistory', () => {
        it('should pass value to gameHistory', () => {
            const gameHistory: GameHistoryForUser[] = [];
            userController.getGameHistory.and.returnValue(of(gameHistory));

            service.updateGameHistory();

            expect(service.gameHistory.value).toBe(gameHistory);
        });
    });

    describe('updateServerActions', () => {
        it('should pass value to serverActions', () => {
            const serverActions: PublicServerAction[] = [];
            userController.getServerActions.and.returnValue(of(serverActions));

            service.updateServerActions();

            expect(service.serverActions.value).toBe(serverActions);
        });
    });
});
