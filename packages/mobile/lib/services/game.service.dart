import 'package:flutter/material.dart';
import 'package:mobile/classes/actions/action-data.dart';
import 'package:mobile/classes/analysis/analysis-request.dart';
import 'package:mobile/classes/board/board.dart';
import 'package:mobile/classes/game/game-config.dart';
import 'package:mobile/classes/game/game-update.dart';
import 'package:mobile/classes/game/game.dart';
import 'package:mobile/classes/game/player.dart';
import 'package:mobile/classes/game/players_container.dart';
import 'package:mobile/classes/sound.dart';
import 'package:mobile/classes/tile/tile-rack.dart';
import 'package:mobile/components/analysis/analysis-request-dialog.dart';
import 'package:mobile/constants/game-events.dart';
import 'package:mobile/constants/locale/analysis-constants.dart';
import 'package:mobile/constants/locale/groups-constants.dart';
import 'package:mobile/controllers/game-play.controller.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/routes/navigator-key.dart';
import 'package:mobile/routes/routes.dart';
import 'package:mobile/services/action-service.dart';
import 'package:mobile/services/end-game.service.dart';
import 'package:mobile/services/game-event.service.dart';
import 'package:mobile/services/game-messages.service.dart';
import 'package:mobile/services/round-service.dart';
import 'package:mobile/services/sound-service.dart';
import 'package:mobile/services/user.service.dart';
import 'package:mobile/view-methods/create-lobby-methods.dart';
import 'package:mobile/view-methods/group.methods.dart';
import 'package:rxdart/rxdart.dart';

import '../classes/rounds/round.dart';
import '../components/alert-dialog.dart';
import '../components/app_button.dart';
import '../components/error-pop-up.dart';
import '../constants/locale/game-constants.dart';
import 'game-observer-service.dart';

class GameService {
  final SoundService _soundService = getIt.get<SoundService>();
  final GamePlayController gamePlayController = getIt.get<GamePlayController>();
  final ActionService _actionService = getIt.get<ActionService>();
  final RoundService _roundService = getIt.get<RoundService>();
  final GameEventService _gameEventService = getIt.get<GameEventService>();
  final UserService _userService = getIt.get<UserService>();
  final GameObserverService _gameObserverService =
      getIt.get<GameObserverService>();
  final BehaviorSubject<MultiplayerGame?> _game;

  static final GameService _instance = GameService._();

  factory GameService() {
    return _instance;
  }

  GameService._() : _game = BehaviorSubject() {
    startGameEvent.listen((InitializeGameData initializeGameData) => startGame(
        initializeGameData.localPlayerSocketId,
        initializeGameData.startGameData));
    replaceVirtualPlayerEvent$.listen((InitializeGameData gameData) =>
        handleReplaceVirtualPlayer(
            gameData.localPlayerSocketId, gameData.startGameData));
    gamePlayController.gameUpdateEvent
        .listen((GameUpdateData gameUpdate) => updateGame(gameUpdate));
  }

  String? get currentGameId => gamePlayController.currentGameId;

  void startGame(String localPlayerId, StartGameData startGameData) {
    PlayersContainer playersContainer = PlayersContainer.fromPlayers(
        player1: startGameData.player1,
        player2: startGameData.player2,
        player3: startGameData.player3,
        player4: startGameData.player4);

    playersContainer.localPlayerId = localPlayerId;
    if (_userService.isObserver) {
      playersContainer.localPlayerId = playersContainer.player1.socketId;
    } else {
      _roundService.setLocalPlayerId(localPlayerId);
    }

    playersContainer.players
        .where((Player player) => player.socketId == localPlayerId)
        .map((Player player) => player.isLocalPlayer = true);

    _gameObserverService.playersContainer.add(playersContainer);
    _gameObserverService.setPlayerTileRack(1);

    TileRack tileRack =
        TileRack().setTiles(playersContainer.getLocalPlayer().tiles);

    _game.add(MultiplayerGame(
        board: Board(),
        tileRack: tileRack,
        players: playersContainer,
        tileReserve: startGameData.tileReserve));
    _roundService.startRound(startGameData.firstRound, _onTimerExpires);
    getIt.get<GameMessagesService>().resetMessages();
    Navigator.pushReplacementNamed(
        navigatorKey.currentContext!, GAME_PAGE_ROUTE);
  }

  void updateGame(GameUpdateData gameUpdate) {
    if (_game.value == null) {
      throw Exception('Cannot update game: game is null');
    }

    MultiplayerGame game = _game.value!;

    _gameEventService.add<void>(CLEAR_SYNCED_TILES, null);
    _gameEventService.add<void>(CLEAR_PLACEMENT, null);

    if (gameUpdate.tileReserve != null) {
      game.tileReserve = gameUpdate.tileReserve!;
    }

    if (gameUpdate.player1 != null) {
      game.players.getPlayer(1).updatePlayerData(gameUpdate.player1!);
    }

    if (gameUpdate.player2 != null) {
      game.players.getPlayer(2).updatePlayerData(gameUpdate.player2!);
    }

    if (gameUpdate.player3 != null) {
      game.players.getPlayer(3).updatePlayerData(gameUpdate.player3!);
    }

    if (gameUpdate.player4 != null) {
      game.players.getPlayer(4).updatePlayerData(gameUpdate.player4!);
    }

    _gameObserverService.playersContainer.add(game.players);

    if (gameUpdate.board != null) {
      game.board.updateBoardData(gameUpdate.board!);
    }

    if (gameUpdate.round != null) {
      _roundService.updateRoundData(gameUpdate.round!, _onTimerExpires);
    }

    if (gameUpdate.isGameOver != null) {
      game.isOver = gameUpdate.isGameOver!;
      game.idGameHistory = gameUpdate.idGameHistory;
      if (game.isOver) {
        getIt
            .get<EndGameService>()
            .setEndGame(game.isOver, gameUpdate.winners ?? []);
      }
    }

    if (!_userService.isObserver) {
      game.tileRack.setTiles(game.players.getLocalPlayer().tiles);
    }

    _game.add(game);
  }

  MultiplayerGame get game {
    if (!_game.hasValue || _game.value == null) throw Exception("No game");

    return _game.value!;
  }

  ValueStream<MultiplayerGame?> get gameStream {
    return _game.stream;
  }

  Stream<TileRack?> get tileRackStream {
    return _game.map((game) => game?.tileRack);
  }

  TileRack getTileRack() {
    if (_game.value == null) throw Exception("No game");

    return _game.value!.tileRack;
  }

  void playPlacement() {
    if (!(_game.value?.board.isValidPlacement ?? false)) return;

    var placement = _game.value?.board.currentPlacement;

    if (placement == null) {
      throw Exception('Cannot play placement: placement is null');
    }

    _actionService.sendAction(ActionType.place, placement.toActionPayload());
  }

  void handleEndGame(BuildContext context) {
    String localUsername = _userService.getUser().username;
    List<String> winners = getIt.get<EndGameService>().winners$.value;
    bool isWinner = winners.contains(localUsername);

    if (isWinner) {
      _soundService.playSound(Sound.victory);
    } else {
      _soundService.playSound(Sound.endGame);
    }

    Player localPlayer = game.players.getPlayerByName(localUsername);

    triggerDialogBox(
        !userService.isObserver
            ? DIALOG_END_OF_GAME_TITLE(isWinner)
            : DIALOG_END_OF_GAME_TITLE_OBSERVER(winners),
        !userService.isObserver
            ? [
                Text(DIALOG_END_OF_GAME_CONTENT(isWinner),
                    style: TextStyle(fontSize: 16)),
                handleRatingChange(localPlayer),
              ]
            : [],
        !userService.isObserver
            ? [
                handleLeaveButton(context),
                DialogBoxButtonParameters(
                    content: DIALOG_SEE_ANALYSIS_BUTTON,
                    theme: AppButtonTheme.primary,
                    onPressed: () {
                      Navigator.pop(context);

                      AnalysisRequestDialog(
                              title: ANALYSIS_REQUEST_TITLE,
                              message: ANALYSIS_REQUEST_COMPUTING,
                              idAnalysis: game.idGameHistory,
                              requestType: AnalysisRequestInfoType.idGame)
                          .openAnalysisRequestDialog(context);
                    }),
              ]
            : [handleLeaveButton(context)],
        dismissOnBackgroundTouch: true);
  }

  Widget handleRatingChange(Player localPlayer) {
    return Row(
      children: [
        Text(
            "$DIALOG_END_OF_GAME_RATING_CONTENT ${localPlayer.adjustedRating.round()}",
            style: TextStyle(fontSize: 16)),
        SizedBox(width: 5),
        localPlayer.ratingVariation >= 0
            ? Text("(+${localPlayer.ratingVariation.round()})",
                style: TextStyle(color: Colors.green))
            : Text("(${localPlayer.ratingVariation.round()})",
                style: TextStyle(color: Colors.red))
      ],
    );
  }

  bool isLocalPlayerPlaying() {
    try {
      return _roundService.currentRound.socketIdOfActivePlayer ==
          game.players.localPlayerId;
    } catch (err) {
      return true;
    }
  }

  Stream<bool> isLocalPlayerPlayingStream() {
    return CombineLatestStream<dynamic, bool>(
        [_roundService.getActivePlayerId(), gameStream], (values) {
      String activePlayerId = values[0];
      MultiplayerGame? game = values[1];

      _gameObserverService.activePlayerId.add(activePlayerId);

      return game != null
          ? game.players.localPlayerId == activePlayerId
          : false;
    }).asBroadcastStream();
  }

  void _onTimerExpires() {
    if (!_userService.isObserver &&
        _roundService.currentRound.socketIdOfActivePlayer ==
            getIt.get<GameService>().game.players.getLocalPlayer().socketId) {
      _actionService.sendAction(ActionType.pass);
      _gameEventService.add<void>(PUT_BACK_TILES_ON_TILE_RACK, null);
    }
  }

  void handleReplaceVirtualPlayer(
      String localPlayerId, StartGameData gameData) {
    _userService.isObserver = false;
    PlayersContainer playersContainer = PlayersContainer.fromPlayers(
        player1: gameData.player1,
        player2: gameData.player2,
        player3: gameData.player3,
        player4: gameData.player4);
    playersContainer.localPlayerId = localPlayerId;

    playersContainer.players
        .where((Player player) => player.socketId == localPlayerId)
        .map((Player player) => player.isLocalPlayer = true);

    _gameObserverService.playersContainer.add(playersContainer);

    TileRack tileRack =
        TileRack().setTiles(playersContainer.getLocalPlayer().tiles);

    _game.add(MultiplayerGame(
        board: _game.value!.board,
        tileRack: tileRack,
        players: playersContainer,
        tileReserve: gameData.tileReserve));

    getIt.get<GameMessagesService>().resetMessages();
    Navigator.pushReplacementNamed(
        navigatorKey.currentContext!, GAME_PAGE_ROUTE);

    // Sync le timer avec ce qui reste du round

    Duration elapsedTime = DateTime.now().difference(_roundService.startTime);
    Duration remaining = gameData.firstRound.duration - elapsedTime;
    var currentRound = Round(
        socketIdOfActivePlayer: gameData.firstRound.socketIdOfActivePlayer,
        duration: remaining);
    _roundService.startRound(currentRound, _onTimerExpires);
  }

  Future<void> replaceVirtualPlayer(int playerNumber) async {
    await gamePlayController
        .replaceVirtualPlayer(playerNumber)
        .catchError((error) {
      errorSnackBar(navigatorKey.currentContext!, GAME_CANCEL_FAILED);
      return error;
    });
  }

  DialogBoxButtonParameters handleLeaveButton(BuildContext context) {
    return DialogBoxButtonParameters(
        content: DIALOG_LEAVE_BUTTON_CONTINUE,
        theme: AppButtonTheme.secondary,
        onPressed: () async {
          await getIt.get<GamePlayController>().leaveGame();

          if (!context.mounted) return;
          Navigator.popUntil(context, ModalRoute.withName(HOME_ROUTE));
        });
  }
}
