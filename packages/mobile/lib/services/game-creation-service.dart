import 'package:mobile/classes/group.dart';
import 'package:mobile/classes/user.dart';
import 'package:mobile/controllers/game-creation-controller.dart';
import 'package:mobile/services/socket.service.dart';

import '../components/error-pop-up.dart';
import '../constants/locale/groups-constants.dart';
import '../locator.dart';
import '../routes/navigator-key.dart';

class GameCreationService {
  String? groupId;

  GameCreationService._privateConstructor();

  static final GameCreationService _instance =
      GameCreationService._privateConstructor();

  factory GameCreationService() {
    return _instance;
  }

  final gameCreationController = getIt.get<GameCreationController>();
  final socketService = getIt.get<SocketService>();

  Future<void> handleStartGame() async {
    if (groupId == null) return;

    await gameCreationController.handleStartGame(groupId!).catchError((error) {
      errorSnackBar(navigatorKey.currentContext!, GAME_START_FAILED);
      return error;
    });
  }

  Future<void> handleCancelGame() async {
    if (groupId == null) return;

    await gameCreationController.handleCancelGame(groupId!).catchError((error) {
      errorSnackBar(navigatorKey.currentContext!, GAME_CANCEL_FAILED);
      return error;
    });
  }

  Future<void> handleAcceptOpponent(PublicUser opponent) async {
    if (groupId == null) return;

    await gameCreationController
        .handleAcceptOpponent(opponent, groupId!)
        .catchError((error) {
      errorSnackBar(navigatorKey.currentContext!, GAME_ACCEPT_FAILED);
      return error;
    });
  }

  Future<void> handleRejectOpponent(PublicUser opponent) async {
    if (groupId == null) return;

    await gameCreationController
        .handleRejectOpponent(opponent, groupId!)
        .catchError((error) {
      errorSnackBar(navigatorKey.currentContext!, GAME_REJECT_FAILED);
      return error;
    });
  }

  Future<GroupCreationResponse> handleCreateGame(Group groupData) async {
    GroupCreationResponse response = await gameCreationController
        .handleCreateGame(groupData)
        .catchError((error) {
      errorSnackBar(navigatorKey.currentContext!, GAME_CREATE_FAILED);
    });
    groupId = response.group.groupId;
    return response;
  }
}
