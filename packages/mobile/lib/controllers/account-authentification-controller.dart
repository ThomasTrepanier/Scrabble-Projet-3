import 'dart:convert';
import 'dart:io';

import 'package:http_interceptor/http/intercepted_http.dart';
import 'package:mobile/classes/account.dart';
import 'package:mobile/classes/login.dart';
import 'package:mobile/classes/user.dart';
import 'package:mobile/constants/login-constants.dart';
import 'package:mobile/environments/environment.dart';
import 'package:mobile/services/client.dart';
import 'package:mobile/services/storage.handler.dart';
import 'package:mobile/services/user-session.service.dart';

import '../locator.dart';
import '../services/socket.service.dart';

class AccountAuthenticationController {
  AccountAuthenticationController._privateConstructor();

  static final AccountAuthenticationController _instance =
      AccountAuthenticationController._privateConstructor();

  factory AccountAuthenticationController() {
    return _instance;
  }
  final storageHandler = getIt.get<StorageHandlerService>();
  final httpClient = getIt.get<PersonnalHttpClient>();
  final userSessionHandler = getIt.get<UserSessionService>();
  final socketService = getIt.get<SocketService>();
  InterceptedHttp get http => httpClient.http;

  final String endpoint = "${Environment().config.apiUrl}/authentification";
  final Map<String, String> headers = {
    "content-type": "application/json",
  };

  Future<bool> createAccount(Account account) async {
    final res = await http.post(Uri.parse("$endpoint/signUp"),
        body: jsonEncode(account.toJson()));
    bool isCreated = res.statusCode == HttpStatus.ok;
    if (isCreated) {
      await userSessionHandler
          .initializeUserSession(UserSession.fromJson(jsonDecode(res.body)));
      await socketService.initSocket(await storageHandler.getToken());
    }
    return isCreated;
  }

  Future<bool> isEmailUnique(String email) async {
    Map<String, String> emailJson = {"email": email};
    final res = await http.post(Uri.parse("$endpoint/validateEmail"),
        headers: headers, body: jsonEncode(emailJson));
    return (json.decode(res.body)['isAvailable']);
  }

  Future<bool> isUsernameUnique(String username) async {
    Map<String, String> usernameMap = {"username": username};
    final res = await http.post(Uri.parse("$endpoint/validateUsername"),
        headers: headers, body: jsonEncode(usernameMap));
    return (json.decode(res.body)['isAvailable']);
  }

  Future<LoginResponse> login(UserLoginCredentials credentials) async {
    final res = await http.post(Uri.parse("$endpoint/login"),
        body: jsonEncode(credentials.toJson()));
    String message;
    if (res.statusCode == HttpStatus.ok) {
      message = AUTHORIZED;
      await userSessionHandler
          .initializeUserSession(UserSession.fromJson(jsonDecode(res.body)));
      await socketService.initSocket(await storageHandler.getToken());
    } else if (res.statusCode == HttpStatus.unauthorized) {
      message = ALREADY_LOGGED_IN_FR;
    } else {
      message = LOGIN_FAILED;
    }

    LoginResponse loginResponse = LoginResponse(
        userSession: userSessionHandler.getSession(),
        isAuthorized: res.statusCode == HttpStatus.ok,
        errorMessage: message);
    return loginResponse;
  }

  Future<TokenValidation> validateToken() async {
    socketService.disconnect();
    String token = await storageHandler.getToken() ?? "";

    if (token.isNotEmpty) {
      final res = await http.post(Uri.parse("$endpoint/validate"));
      if (res.statusCode == HttpStatus.ok) {
        userSessionHandler
            .initializeUserSession(UserSession.fromJson(jsonDecode(res.body)));
        await socketService.initSocket(await storageHandler.getToken());

        return TokenValidation.Ok;
      } else {
        await storageHandler.clearStorage();
        socketService.disconnect();
        if (res.statusCode == HttpStatus.unauthorized) {
          return TokenValidation.AlreadyConnected;
        } else {
          return TokenValidation.UnknownError;
        }
      }
    } else {
      await userSessionHandler.clearUserSession();
      socketService.disconnect();
      return TokenValidation.NoToken;
    }
  }

  Future<void> signOut() async {
    userSessionHandler.clearUserSession();
    socketService.disconnect();
  }
}
