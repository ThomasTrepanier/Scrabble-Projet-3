import 'package:mobile/classes/achievements.dart';
import 'package:mobile/classes/game-history.dart';
import 'package:mobile/classes/server-action.dart';
import 'package:mobile/controllers/user-controller.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/storage.handler.dart';
import 'package:rxdart/rxdart.dart';

import '../classes/user.dart';

const USER_NOT_INITIALIZED = "User not initialized";

class UserService {
  UserService._privateConstructor();
  BehaviorSubject<PublicUser?> _user = BehaviorSubject<PublicUser?>();
  late bool isObserver = false;
  static final UserService _instance = UserService._privateConstructor();
  factory UserService() {
    return _instance;
  }

  UserController _userController = getIt.get<UserController>();
  final StorageHandlerService storageHandlerService =
      getIt.get<StorageHandlerService>();

  ValueStream<PublicUser?> get user => _user.stream;

  PublicUser getUser() {
    assert(_user.valueOrNull != null, USER_NOT_INITIALIZED);
    return _user.value!;
  }

  void setUser(PublicUser user) {
    _user.add(user);
  }

  Future<PublicUser> editUser(EditableUserFields edits) async {
    PublicUser user = await _userController.editUser(edits);
    _user.add(user);
    return user;
  }

  Future<UserStatistics> getUserStatistics() async {
    if (!(await _isConnected())) return UserStatistics.empty();
    return await _userController.getUserStatistics();
  }

  Future<List<UserSearchItem>> searchUsers(String? query) async {
    if (!(await _isConnected())) return [];
    return await _userController.searchUsers(query);
  }

  Future<List<RatedUser>> requestRatingLeaderboard() async {
    if (!(await _isConnected())) return [];
    return await _userController.getRatingLeaderboard();
  }

  Future<UserSearchResult> getProfileByUsername(String username) async {
    return await _userController.getProfileByUsername(username);
  }

  Future<List<GameHistory>> getGameHistory() async {
    if (!(await _isConnected())) return [];
    return await _userController.getGameHistory();
  }

  Future<List<ServerAction>> getServerActions() async {
    if (!(await _isConnected())) return [];
    return await _userController.getServerActions();
  }

  Future<List<UserAchievement>> getAchievements() async {
    if (!(await _isConnected())) return [];
    return await _userController.getAchievements();
  }

  Future<bool> _isConnected() async {
    return await storageHandlerService.getToken() == null ? false : true;
  }
}
