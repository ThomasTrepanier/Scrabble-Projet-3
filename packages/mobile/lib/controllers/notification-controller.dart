import 'dart:convert';

import 'package:http/http.dart';
import 'package:mobile/constants/endpoint.constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/client.dart';
import 'package:rxdart/rxdart.dart';

class NotificationController {
  NotificationController._privateConstructor();

  static final NotificationController _instance =
      NotificationController._privateConstructor();

  factory NotificationController() {
    return _instance;
  }

  final String endpoint = NOTIFICATION_ENDPOINT;
  final http = getIt.get<PersonnalHttpClient>().http;
  final BehaviorSubject<Object?> notificationError =
      BehaviorSubject.seeded(null);

  Future<bool> sendFirebaseToken(String token) async {
    Response notificationsRequest = await http
        .post(Uri.parse(endpoint), body: jsonEncode({'firebaseToken': token}))
        .onError((error, stackTrace) => handleError(error));
    return jsonDecode(notificationsRequest.body);
  }

  Future<bool> toggleNotifications() async {
    Response toggleRequest = await http
        .post(Uri.parse("$endpoint/toggle"))
        .onError((error, stackTrace) => handleError(error));
    return jsonDecode(toggleRequest.body);
  }

  handleError(Object? error) {
    notificationError.add(error);
  }
}
