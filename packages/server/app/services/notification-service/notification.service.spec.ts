/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { ServicesTestingUnit } from '@app/services/service-testing-unit/services-testing-unit.spec';
import { User, UserNotificationsSettings } from '@common/models/user';
import * as chai from 'chai';
import { SinonStubbedInstance } from 'sinon';
import { NotificationService } from './notification.service';
const expect = chai.expect;

const DEFAULT_USER: User = {
    idUser: 1,
    avatar: 'the-way-of-the-water',
    email: 'me@me.com',
    password: '123',
    username: 'username',
};

const USER_NOTIFICATIONS_SETTINGS: UserNotificationsSettings = { ...DEFAULT_USER, isNotificationsEnabled: false };

const TOKEN = 'mytoken';

describe('NotificationService', () => {
    let service: SinonStubbedInstance<NotificationService>;
    let testingUnit: ServicesTestingUnit;

    beforeEach(async () => {
        testingUnit = new ServicesTestingUnit().withStubbed(NotificationService, {
            initalizeAdminApp: undefined,
            sendNotification: Promise.resolve(''),
        });
        service = testingUnit.setStubbed(NotificationService);
        service['mobileUserTokens'] = new Map();
        service['mobileUserAccounts'] = new Map();
        service['scheduledNotifications'] = new Map();
        service.addMobileUserToken.restore();
        service.scheduleReminderNotification.restore();
        service.toggleNotifications.restore();
        service.sendReminderNotification.restore();
        service.removeScheduledNotification.restore();

        await testingUnit.withMockDatabaseService();
    });

    afterEach(() => {
        testingUnit.restore();
    });

    it('should create', () => {
        expect(service).to.exist;
    });

    describe('addMobileUserToken', () => {
        it(' should return the default notifications settings if no user found', async () => {
            expect(service.addMobileUserToken({ idUser: 123 } as User, TOKEN)).to.equal(true);
        });

        it(' should return the user notifications settings if user found', async () => {
            service['mobileUserAccounts'].set(DEFAULT_USER.idUser, USER_NOTIFICATIONS_SETTINGS);
            expect(service.addMobileUserToken(DEFAULT_USER, TOKEN)).to.equal(USER_NOTIFICATIONS_SETTINGS.isNotificationsEnabled);
        });
    });

    describe('scheduleReminderNotification', () => {
        it(' should return the value of the timeout if valid user and notifications are activated', async () => {
            const user: UserNotificationsSettings = { ...USER_NOTIFICATIONS_SETTINGS };
            user.isNotificationsEnabled = true;
            service['mobileUserAccounts'].set(DEFAULT_USER.idUser, user);
            service['mobileUserTokens'].set(DEFAULT_USER.idUser, TOKEN);
            expect(typeof service.scheduleReminderNotification(DEFAULT_USER.idUser)).to.equal('object');
        });

        it(' should return undefined if notifications are disabled', async () => {
            service['mobileUserAccounts'].set(DEFAULT_USER.idUser, USER_NOTIFICATIONS_SETTINGS);
            service['mobileUserTokens'].set(DEFAULT_USER.idUser, TOKEN);
            expect(service.scheduleReminderNotification(DEFAULT_USER.idUser)).to.equal(undefined);
        });
    });

    describe('toggleNotifications', () => {
        it(' should return the toggled value of the user s notifications settings', async () => {
            service['mobileUserAccounts'].set(DEFAULT_USER.idUser, { ...USER_NOTIFICATIONS_SETTINGS });
            expect(service.toggleNotifications(DEFAULT_USER.idUser)).to.equal(!USER_NOTIFICATIONS_SETTINGS.isNotificationsEnabled);
        });

        it(' should return the false if no user found', async () => {
            expect(service.toggleNotifications(DEFAULT_USER.idUser)).to.equal(false);
        });
    });

    describe('sendReminderNotification', () => {
        it(' should call sendNotification', async () => {
            const spy = chai.spy.on(service, 'sendNotification', async () => Promise.resolve(''));
            service['mobileUserAccounts'].set(DEFAULT_USER.idUser, { ...USER_NOTIFICATIONS_SETTINGS });
            service.sendReminderNotification(DEFAULT_USER.idUser, TOKEN, 'titre', 'body');
            expect(spy).to.be.called;
        });
    });

    describe('removeScheduledNotification', () => {
        it(' should delete the scheduled timeout if it exists', async () => {
            service['scheduledNotifications'].set(
                DEFAULT_USER.idUser,
                setTimeout(() => 'bruh'),
            );
            service.removeScheduledNotification(DEFAULT_USER.idUser);
            expect(service['scheduledNotifications'].values.length).to.equal(0);
        });
    });
});
