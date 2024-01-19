import 'package:mobile/locator.dart';
import 'package:mobile/services/notification.service.dart';
import 'package:mobile/services/storage.handler.dart';
import 'package:mobile/services/user.service.dart';
import 'package:rxdart/rxdart.dart';

import '../classes/user.dart';

const SESSION_NOT_INITIALIZED_ASSERT = 'User session not initialized';

class UserSessionService {
  BehaviorSubject<UserSession?>? _userSession = BehaviorSubject<UserSession?>();
  final storageService = getIt.get<StorageHandlerService>();
  final userService = getIt.get<UserService>();
  final notificationService = getIt.get<NotificationService>();
  UserSessionService._privateConstructor();
  static final UserSessionService _instance = UserSessionService._privateConstructor();
  factory UserSessionService() {
    return _instance;
  }
  Future<void> initializeUserSession(UserSession session) async {
    assert(_userSession != null, SESSION_NOT_INITIALIZED_ASSERT);
    await storageService.setToken(session.token);

    _userSession?.add(session);
    userService.setUser(session.user);
    await notificationService.sendFirebaseToken();
  }

  UserSession? getSession() {
    return _userSession?.valueOrNull;
  }

  Future<void> clearUserSession() async {
    assert(_userSession != null, SESSION_NOT_INITIALIZED_ASSERT);
    _userSession?.add(null);
    await storageService.clearStorage();
  }

  String? getSessionToken() {
    assert(_userSession != null, SESSION_NOT_INITIALIZED_ASSERT);
    return _userSession?.value!.token;
  }
}
