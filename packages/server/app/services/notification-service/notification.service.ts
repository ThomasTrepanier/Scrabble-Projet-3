/* eslint-disable no-console */
import { UserId } from '@app/classes/user/connected-user-types';
import { MINUTES_TO_SECONDS, SECONDS_TO_MILLISECONDS } from '@app/constants/controllers-constants';
import { User, UserNotificationsSettings } from '@common/models/user';

import * as admin from 'firebase-admin';
import { AndroidConfig, Message } from 'firebase-admin/lib/messaging/messaging-api';
import { join } from 'path';
import { Service } from 'typedi';
export const FIREBASE_KEY_PATH = '../../../assets/log3900-polyscrabble-firebase-adminsdk-key.json';
export const NOTIFICATION_TITLE = 'Revenez';
export const NOTIFICATION_DESCRIPTION = 'Venez vous amuser sur PolyScrabble. On vous attend avec impatience!';
export const REMINDER_DELAY_IN_MINUTES = 5;

@Service()
export class NotificationService {
    private mobileUserTokens: Map<UserId, string>;
    private mobileUserAccounts: Map<UserId, UserNotificationsSettings>;
    private scheduledNotifications: Map<UserId, NodeJS.Timeout>;

    constructor() {
        this.mobileUserTokens = new Map();
        this.mobileUserAccounts = new Map();
        this.scheduledNotifications = new Map();
        this.initalizeAdminApp();
    }

    initalizeAdminApp() {
        const filePath = join(__dirname, FIREBASE_KEY_PATH);

        admin.initializeApp({
            credential: admin.credential.cert(filePath),
        });
    }

    addMobileUserToken(user: User, firebaseToken: string): boolean {
        this.mobileUserTokens.set(user.idUser, firebaseToken);
        const existingUser = this.mobileUserAccounts.get(user.idUser);
        let isNotificationsEnabled = true;
        if (existingUser != null) isNotificationsEnabled = existingUser.isNotificationsEnabled;
        this.mobileUserAccounts.set(user.idUser, { ...user, isNotificationsEnabled } as UserNotificationsSettings);
        return isNotificationsEnabled;
    }

    scheduleReminderNotification(userId: UserId) {
        const firebaseToken = this.mobileUserTokens.get(userId);
        const user = this.mobileUserAccounts.get(userId);
        if (!firebaseToken || !user?.isNotificationsEnabled) return;
        const scheduledNotification = setTimeout(() => {
            this.sendReminderNotification(userId, firebaseToken, `${NOTIFICATION_TITLE} ${user.username}!`, NOTIFICATION_DESCRIPTION);
        }, REMINDER_DELAY_IN_MINUTES * MINUTES_TO_SECONDS * SECONDS_TO_MILLISECONDS);

        this.scheduledNotifications.set(userId, scheduledNotification);
        return scheduledNotification;
    }

    toggleNotifications(userId: UserId): boolean {
        const user = this.mobileUserAccounts.get(userId);
        if (!user) return false;
        user.isNotificationsEnabled = !user.isNotificationsEnabled;

        return user.isNotificationsEnabled;
    }

    async sendReminderNotification(userId: UserId, registrationToken: string, title: string, body: string) {
        if (!this.scheduledNotifications.delete(userId)) return;
        const message = {
            notification: {
                title,
                body,
            },
            android: {
                priority: 'high',
                notification: {
                    sound: 'default',
                },
            } as AndroidConfig,
            token: registrationToken,
        };

        try {
            const response = await this.sendNotification(message);
            console.log(`Successfully sent notification: ${response}`);
        } catch (error) {
            console.error(`Error sending notification: ${error}`);
        }
    }

    async sendNotification(message: Message): Promise<string> {
        return await admin.messaging().send(message);
    }

    removeScheduledNotification(userId: UserId) {
        const scheduledNotification = this.scheduledNotifications.get(userId);
        if (scheduledNotification) clearTimeout(scheduledNotification);
        this.scheduledNotifications.delete(userId);
    }
}
