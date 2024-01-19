import 'dart:convert';

import 'package:mobile/classes/achievements.dart';
import 'package:mobile/classes/game-history.dart';
import 'package:mobile/classes/server-action.dart';
import 'package:mobile/classes/user.dart';
import 'package:mobile/environments/environment.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/client.dart';

class UserController {
  UserController._privateConstructor();

  static final UserController _instance = UserController._privateConstructor();

  factory UserController() {
    return _instance;
  }

  final String endpoint = "${Environment().config.apiUrl}";
  final _http = getIt.get<PersonnalHttpClient>().http;

  Future<PublicUser> editUser(EditableUserFields edits) async {
    return PublicUser.fromJson(jsonDecode((await _http
            .patch(Uri.parse("$endpoint/users"), body: jsonEncode(edits)))
        .body));
  }

  Future<UserStatistics> getUserStatistics() async {
    return UserStatistics.fromJson(jsonDecode(
        (await _http.get(Uri.parse("$endpoint/users/statistics"))).body));
  }

  Future<UserSearchResult> getProfileByUsername(String username) async {
    return UserSearchResult.fromJson(jsonDecode(
        (await _http.get(Uri.parse("$endpoint/users/profile/$username")))
            .body));
  }

  Future<List<UserSearchItem>> searchUsers(String? query) async {
    return UserSearchItem.fromJsonList(jsonDecode(
        (await _http.get(Uri.parse("$endpoint/users/search?q=$query"))).body));
  }

  Future<List<RatedUser>> getRatingLeaderboard() async {
    return RatedUser.fromJsonList(jsonDecode(
        (await _http.get(Uri.parse("$endpoint/users/ratings"))).body));
  }

  Future<List<GameHistory>> getGameHistory() async {
    return GameHistory.fromJsonList(jsonDecode(
        (await _http.get(Uri.parse("$endpoint/gameHistories"))).body));
  }

  Future<List<ServerAction>> getServerActions() async {
    return ServerAction.fromJsonList(jsonDecode(
        (await _http.get(Uri.parse("$endpoint/server-actions"))).body));
  }

  Future<List<UserAchievement>> getAchievements() async {
    return UserAchievement.fromJsonList(jsonDecode(
        (await _http.get(Uri.parse("$endpoint/users/achievements"))).body));
  }
}
