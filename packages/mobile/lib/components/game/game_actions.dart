import 'dart:async';

import 'package:flutter/material.dart';
import 'package:mobile/classes/actions/action-data.dart';
import 'package:mobile/classes/game/game.dart';
import 'package:mobile/classes/tile/tile.dart';
import 'package:mobile/components/alert-dialog.dart';
import 'package:mobile/components/app_button.dart';
import 'package:mobile/constants/game-events.dart';
import 'package:mobile/constants/game.constants.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/action-service.dart';
import 'package:mobile/services/game-event.service.dart';
import 'package:mobile/services/game.service.dart';
import 'package:mobile/services/player-leave-service.dart';
import 'package:mobile/services/round-service.dart';
import 'package:rxdart/rxdart.dart';

import '../../services/user.service.dart';
import '../../view-methods/group.methods.dart';

const REPLACE_VIRTUAL_PLAYER_LABEL = 'Remplacer Joueur Virtuel';

class GameActions extends StatefulWidget {
  @override
  State<GameActions> createState() => _GameActionsState();
}

class _GameActionsState extends State<GameActions> {
  late var _index;
  var _isObservingVirtualPlayer = false;
  late StreamSubscription observedPlayerChangeSubscription;

  @override
  void initState() {
    super.initState();

    observedPlayerChangeSubscription =
        changeObservedPlayerStream.listen((int index) {
      _index = index;
    });

    isObservingVirtualPlayerStream.listen((bool isObservingVirtualPlayer) {
      _isObservingVirtualPlayer = isObservingVirtualPlayer;
    });
  }

  @override
  void dispose() {
    observedPlayerChangeSubscription.cancel();
    super.dispose();
  }

  final GameService _gameService = getIt.get<GameService>();

  final ActionService _actionService = getIt.get<ActionService>();

  final RoundService _roundService = getIt.get<RoundService>();

  final GameEventService _gameEventService = getIt.get<GameEventService>();

  void surrender(BuildContext context) {
    getIt.get<PlayerLeaveService>().abandonGame(context);
  }

  void leave(BuildContext context) {
    getIt.get<PlayerLeaveService>().leaveGame(context);
  }

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<MultiplayerGame?>(
      stream: _gameService.gameStream,
      builder: (context, snapshot) {
        return Card(
          child: Container(
              height: 70,
              padding:
                  EdgeInsets.symmetric(vertical: SPACE_2, horizontal: SPACE_3),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  AppButton(
                    text: getIt.get<UserService>().isObserver
                        ? QUIT_LABEL_FR
                        : null,
                    onPressed: () => getIt.get<UserService>().isObserver
                        ? leave(context)
                        : surrender(context),
                    icon: getIt.get<UserService>().isObserver
                        ? Icons.output_outlined
                        : Icons.flag,
                    size: AppButtonSize.large,
                    theme: AppButtonTheme.danger,
                  ),
                  Visibility(
                    visible: !getIt.get<UserService>().isObserver,
                    child: StreamBuilder<bool>(
                        stream: _canPlayStream(),
                        initialData: false,
                        builder: (context, snapshot) {
                          return AppButton(
                            onPressed: snapshot.hasData && snapshot.data!
                                ? () {
                                    _actionService.sendAction(ActionType.hint);
                                  }
                                : null,
                            icon: Icons.lightbulb,
                            size: AppButtonSize.large,
                          );
                        }),
                  ), //Échanger
                  Visibility(
                    visible: !getIt.get<UserService>().isObserver,
                    child: StreamBuilder<bool>(
                        stream: _canPlayStream(),
                        initialData: false,
                        builder: (context, snapshot) {
                          return AppButton(
                            onPressed: snapshot.hasData && snapshot.data!
                                ? () {
                                    _actionService.sendAction(ActionType.pass);
                                    _gameEventService.add<void>(
                                        PUT_BACK_TILES_ON_TILE_RACK, null);
                                  }
                                : null,
                            icon: Icons.not_interested_rounded,
                            size: AppButtonSize.large,
                          );
                        }),
                  ), // Passer
                  Visibility(
                    visible: !getIt.get<UserService>().isObserver,
                    child: StreamBuilder<bool>(
                      stream: snapshot.hasData
                          ? _canPlaceStream(snapshot.data!)
                          : Stream.value(false),
                      builder: (context, canPlace) {
                        return AppButton(
                          onPressed: canPlace.data ?? false
                              ? () => _gameService.playPlacement()
                              : null,
                          icon: Icons.play_arrow_rounded,
                          size: AppButtonSize.large,
                        );
                      },
                    ),
                  ), // remplacer JV
                  Visibility(
                    visible: getIt.get<UserService>().isObserver,
                    child: StreamBuilder<bool>(
                      stream: isObservingVirtualPlayerStream,
                      initialData: false,
                      builder: (context, snapshot) {
                        bool isObservingVirtualPlayer = snapshot.data ?? false;
                        return Tooltip(
                          message: REPLACE_VIRTUAL_PLAYER_LABEL,
                          child: AppButton(
                            text: REPLACE_LABEL_FR,
                            onPressed: snapshot.hasData &&
                                    isObservingVirtualPlayer
                                ? () =>
                                    _openReplacePlayerDialogBox(context, _index)
                                : null,
                            icon: Icons.swap_horiz_rounded,
                            size: AppButtonSize.large,
                            theme: AppButtonTheme.primary,
                          ),
                        );
                      },
                    ),
                  )
                ],
              )),
        );
      },
    );
  }

  Stream<bool> _canPlayStream() {
    return CombineLatestStream<dynamic, bool>([
      _gameService.gameStream,
      _actionService.isActionBeingProcessedStream,
      _roundService.getActivePlayerId()
    ], (values) {
      MultiplayerGame game = values[0];
      bool isActionBeingProcessed = values[1];
      String activePlayerSocketId = values[2];

      return !getIt.get<UserService>().isObserver &&
          _roundService.isActivePlayer(
              activePlayerSocketId, game.players.getLocalPlayer().socketId) &&
          !game.isOver &&
          !isActionBeingProcessed;
    });
  }

  Stream<bool> _endGameStream() {
    return CombineLatestStream<dynamic, bool>([
      _gameService.gameStream,
    ], (values) {
      MultiplayerGame game = values[0];

      return game.isOver;
    });
  }

  Stream<bool> _canExchangeStream() {
    return CombineLatestStream<dynamic, bool>(
        [_canPlayStream(), _gameService.getTileRack().selectedTilesStream],
        (values) {
      bool canPlay = values[0];
      List<Tile> selectedTiles = values[1];

      return canPlay && selectedTiles.isNotEmpty;
    });
  }

  Stream<bool> _canPlaceStream(MultiplayerGame game) {
    return CombineLatestStream(
        [_canPlayStream(), game.board.isValidPlacementStream], (values) {
      bool canPlay = values[0];
      bool isValidPlacement = values[1];

      return canPlay && isValidPlacement;
    });
  }

  void handleObservedChange(int index) {
    _index = index;
  }

  void handleVirtualPlayerObserving(bool isObservingVirtualPlayer) {
    _isObservingVirtualPlayer = isObservingVirtualPlayer;
  }

  void _openReplacePlayerDialogBox(BuildContext context, int playerIndex) {
    triggerDialogBox('Remplacer un joueur virtuel', [
      Center(child: Text('Voulez-vous vraiment remplacer un joueur virtuel?'))
    ], [
      DialogBoxButtonParameters(
          content: 'Annuler',
          theme: AppButtonTheme.secondary,
          closesDialog: true),
      DialogBoxButtonParameters(
          content: 'Remplacer',
          theme: AppButtonTheme.primary,
          onPressed: () {
            Navigator.pop(context);
            _gameService.replaceVirtualPlayer(_index);
          }),
    ]);
  }
}
