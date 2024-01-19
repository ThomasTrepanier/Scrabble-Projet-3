import 'package:mobile/classes/game/game-message.dart';
import 'package:mobile/classes/http/ResponseResult.dart';
import 'package:mobile/constants/game-messages-constants.dart';
import 'package:mobile/constants/locale/game-message-constants.dart';
import 'package:mobile/controllers/game-play.controller.dart';
import 'package:mobile/services/game-messages.service.dart';
import 'package:mobile/services/game.service.dart';
import 'package:rxdart/rxdart.dart';

import '../classes/actions/action-data.dart';
import '../constants/game-events.dart';
import '../locator.dart';
import 'game-event.service.dart';

class ActionService {
  BehaviorSubject<bool> _isActionBeingProcessed = BehaviorSubject.seeded(false);

  ValueStream<bool> get isActionBeingProcessedStream =>
      _isActionBeingProcessed.stream;

  bool get isActionBeingProcessed => _isActionBeingProcessed.value;

  final GamePlayController gameplayController = getIt.get<GamePlayController>();
  final GameEventService _gameEventService = getIt.get<GameEventService>();

  ActionService._privateConstructor() {
    gameplayController.actionDoneEvent
        .listen((ResponseResult result) => _actionProcessed(result));
  }

  static final ActionService _instance = ActionService._privateConstructor();

  factory ActionService() {
    return _instance;
  }

  Future<void> sendAction(ActionType actionType,
      [ActionPayload? payload]) async {
    if (!getIt.get<GameService>().isLocalPlayerPlaying()) {
      getIt.get<GameMessagesService>().addMessage(GameMessage(
          content: CANNOT_PLAY_WHEN_NOT_LOCAL_TURN,
          senderId: SYSTEM_ERROR_ID,
          gameId: gameplayController.currentGameId ?? ''));
      return;
    }
    if (isActionBeingProcessed) {
      getIt.get<GameMessagesService>().addMessage(GameMessage(
          content: SERVER_PROCESSING_ACTION,
          senderId: SYSTEM_ERROR_ID,
          gameId: gameplayController.currentGameId ?? ''));
      return;
    }

    ActionData actionData = ActionData(type: actionType, payload: payload);

    gameplayController.sendAction(actionData);
    _isActionBeingProcessed.add(true);
  }

  void _actionProcessed(ResponseResult result) {
    _isActionBeingProcessed.add(false);

    if (!result.isSuccess) {
      // remove tiles on board after an invalid word
      _gameEventService.add<void>(PUT_BACK_TILES_ON_TILE_RACK, null);
    }
  }
}
