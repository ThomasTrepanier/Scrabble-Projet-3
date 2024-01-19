import 'package:shared_preferences/shared_preferences.dart';

class StorageHandlerService {
  StorageHandlerService._privateConstructor();
  final Future<SharedPreferences> _prefs = SharedPreferences.getInstance();
  static final StorageHandlerService _instance =
      StorageHandlerService._privateConstructor();
  factory StorageHandlerService() {
    return _instance;
  }
  static const String _tokenKey = 'token';
  Future<String?> getToken() async {
    final SharedPreferences prefs = await _prefs;
    return prefs.getString(_tokenKey);
  }

  Future<void> setToken(String token) async {
    final SharedPreferences prefs = await _prefs;
    await prefs.setString(_tokenKey, token);
  }

  Future<void> clearStorage() async {
    final SharedPreferences prefs = await _prefs;
    await prefs.clear();
  }
}
