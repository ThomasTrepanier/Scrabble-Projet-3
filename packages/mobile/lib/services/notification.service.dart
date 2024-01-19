import 'dart:developer';

import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:mobile/controllers/notification-controller.dart';
import 'package:mobile/services/storage.handler.dart';
import 'package:rxdart/rxdart.dart';

import '../locator.dart';

class NotificationService {
  NotificationService._privateConstructor();

  static final NotificationService _instance =
      NotificationService._privateConstructor();
  StorageHandlerService storageHandlerService =
      getIt.get<StorageHandlerService>();
  NotificationController notificationController =
      getIt.get<NotificationController>();

  factory NotificationService() {
    return _instance;
  }
  BehaviorSubject<bool> isNotificationEnabled = BehaviorSubject.seeded(true);
  late FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
  late NotificationSettings _settings;
  Stream<Object?> get notificationErrorStream =>
      notificationController.notificationError.stream;

  Future init() async {
    final FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin =
        await setupNotificationPlugin();

    final NotificationDetails platformChannelSpecifics =
        setupNotificationDetails();

    FirebaseMessaging.onMessage.listen((RemoteMessage message) async {
      if (message.notification == null) {
        log("notification is empty ${message.notification}");
      }

      RemoteNotification notification = message.notification!;

      await flutterLocalNotificationsPlugin.show(notification.hashCode,
          notification.title, notification.body, platformChannelSpecifics);
    });
  }

  void toggleNotifications() async {
    isNotificationEnabled
        .add(await notificationController.toggleNotifications());
  }

  Future<void> sendFirebaseToken() async {
    _settings = await _firebaseMessaging.requestPermission(
      alert: true,
      announcement: false,
      badge: true,
      carPlay: false,
      criticalAlert: false,
      provisional: false,
      sound: true,
    );
    log('User granted permission: ${_settings.authorizationStatus}');

    final token = await _firebaseMessaging.getToken();
    if (token == null) log("no token has been found");
    isNotificationEnabled
        .add(await notificationController.sendFirebaseToken(token!));
  }
}

Future<FlutterLocalNotificationsPlugin> setupNotificationPlugin() async {
  final AndroidInitializationSettings initializationSettingsAndroid =
      AndroidInitializationSettings('@drawable/naked_s_logo');
  final InitializationSettings initializationSettings =
      InitializationSettings(android: initializationSettingsAndroid);

  final FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin =
      FlutterLocalNotificationsPlugin();

  await flutterLocalNotificationsPlugin.initialize(initializationSettings);

  return flutterLocalNotificationsPlugin;
}

NotificationDetails setupNotificationDetails() {
  const AndroidNotificationDetails androidPlatformChannelSpecifics =
      AndroidNotificationDetails(
          'reminders_channel', 'rappels', 'Rappels de jeu.',
          importance: Importance.max, priority: Priority.max);

  const NotificationDetails platformChannelSpecifics =
      NotificationDetails(android: androidPlatformChannelSpecifics);

  return platformChannelSpecifics;
}
