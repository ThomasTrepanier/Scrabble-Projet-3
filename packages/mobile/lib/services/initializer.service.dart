import 'package:flutter/cupertino.dart';
import 'package:mobile/classes/login.dart';
import 'package:mobile/controllers/account-authentification-controller.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/routes/navigator-key.dart';
import 'package:mobile/routes/routes.dart';
import 'package:rxdart/rxdart.dart';

class InitializerService {
  InitializerService._();

  static final InitializerService _instance = InitializerService._();

  factory InitializerService() {
    return _instance;
  }

  final AccountAuthenticationController authController =
      getIt.get<AccountAuthenticationController>();

  final BehaviorSubject<String?> _entryPage$ = BehaviorSubject();

  ValueStream<String?> get entryPageStream => _entryPage$.stream;

  Future<void> initialize() async {
    String entryPage = await _getEntryPage();
    _entryPage$.add(entryPage);
  }

  Future<String> _getEntryPage() async {
    TokenValidation tokenValidation = await authController.validateToken();
    switch (tokenValidation) {
      case TokenValidation.Ok:
        return HOME_ROUTE;
      case TokenValidation.AlreadyConnected:
      case TokenValidation.NoToken:
      case TokenValidation.UnknownError:
      default:
        return LOGIN_ROUTE;
    }
  }
}
