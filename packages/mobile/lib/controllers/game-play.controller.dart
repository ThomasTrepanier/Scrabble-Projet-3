import 'dart:convert';

import 'package:http_interceptor/http/http.dart';
import 'package:mobile/classes/actions/action-data.dart';
import 'package:mobile/classes/game/game-message.dart';
import 'package:mobile/classes/game/game-update.dart';
import 'package:mobile/classes/http/ResponseResult.dart';
import 'package:mobile/constants/endpoint.constants.dart';
import 'package:mobile/constants/game.constants.dart';
import 'package:mobile/constants/socket-events/game-events.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/socket.service.dart';
import 'package:rxdart/rxdart.dart';

import '../services/client.dart';

class GamePlayController {
  GamePlayController._privateConstructor() {
    configureSocket();
  }

  static final GamePlayController _instance =
      GamePlayController._privateConstructor();

  factory GamePlayController() {
    return _instance;
  }

  SocketService socketService = getIt.get<SocketService>();

  final String baseEndpoint = GAME_ENDPOINT;
  PersonnalHttpClient httpClient = getIt.get<PersonnalHttpClient>();
  InterceptedHttp get http => httpClient.http;

  String? currentGameId;

  Stream<ResponseResult> get actionDoneEvent => _actionDone$.stream;

  Stream<GameUpdateData> get gameUpdateEvent => gameUpdate$.stream;

  Stream<GameMessage?> get messageEvent => gameMessage$.stream;

  final BehaviorSubject<GameUpdateData> gameUpdate$ =
      BehaviorSubject<GameUpdateData>();
  final BehaviorSubject<GameMessage?> gameMessage$ =
      BehaviorSubject<GameMessage?>.seeded(null);
  final PublishSubject<ResponseResult> _actionDone$ =
      PublishSubject<ResponseResult>();

  Future<void> sendAction(ActionData actionData) async {
    Uri endpoint = Uri.parse("$baseEndpoint/$currentGameId/players/action");
    http.post(endpoint, body: jsonEncode(actionData));
  }

  Future<void> leaveGame() async {
    Uri endpoint = Uri.parse("$baseEndpoint/$currentGameId/players/leave");
    await http.delete(endpoint).then((_) {
      currentGameId = null;
    });
  }

  Future<void> replaceVirtualPlayer(int playerNumber) async {
    Uri endpoint = Uri.parse("$baseEndpoint/$currentGameId/players/replace");
    var data = {'virtualPlayerNumber': playerNumber};
    await http.post(endpoint, body: jsonEncode(data));
  }

  void configureSocket() {
    socketService.on(GAME_UPDATE_EVENT_NAME, (dynamic newData) {
      gameUpdate$.add(GameUpdateData.fromJson(newData));
    });
    socketService.on(GAME_MESSAGE_EVENT_NAME, (dynamic gameMessage) {
      GameMessage message = GameMessage.fromJson(gameMessage);
      gameMessage$.add(message);

      _processActionDone(message);
    });
  }

  void _processActionDone(GameMessage message) {
    if (message.senderId == SYSTEM_ID) {
      _actionDone$.add(ResponseResult.success());
    } else if (message.senderId == SYSTEM_ERROR_ID) {
      _actionDone$.add(ResponseResult.error());
    }
  }
}
