import 'package:mobile/classes/user.dart';

class LoginData {
  final String username;
  final String password;

  LoginData({
    required this.username,
    required this.password,
  });

  factory LoginData.fromJson(Map<String, dynamic> json) {
    return LoginData(
      username: json['username'] as String,
      password: json['password'] as String,
    );
  }
}

class LoginResponse {
  UserSession? userSession;
  bool isAuthorized;
  String errorMessage;

  LoginResponse(
      {this.userSession,
      required this.isAuthorized,
      required this.errorMessage});
}

enum TokenValidation {
  Ok,
  NoToken,
  AlreadyConnected,
  UnknownError,
}
