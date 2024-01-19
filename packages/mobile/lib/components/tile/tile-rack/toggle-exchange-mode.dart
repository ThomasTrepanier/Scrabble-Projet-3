import 'package:flutter/material.dart';
import 'package:mobile/classes/actions/action-data.dart';
import 'package:mobile/classes/game/game.dart';
import 'package:mobile/classes/tile/tile-rack.dart';
import 'package:mobile/classes/tile/tile.dart';
import 'package:mobile/components/app_button.dart';
import 'package:mobile/constants/game-events.dart';
import 'package:mobile/constants/game.constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/action-service.dart';
import 'package:mobile/services/game-event.service.dart';
import 'package:mobile/services/game.service.dart';
import 'package:mobile/services/round-service.dart';
import 'package:mobile/services/user.service.dart';
import 'package:rxdart/rxdart.dart';

class ToggleExchangeModeWidget extends StatelessWidget {
  ToggleExchangeModeWidget({
    super.key,
    required this.tileRack,
  });

  final TileRack tileRack;
  final GameEventService _gameEventService = getIt.get<GameEventService>();
  final GameService _gameService = getIt.get<GameService>();
  final ActionService _actionService = getIt.get<ActionService>();
  final RoundService _roundService = getIt.get<RoundService>();

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<bool>(
        stream: tileRack.isExchangeModeEnabled,
        builder: (context, snapshot) {
          return (snapshot.data ?? false)
              ? StreamBuilder(
                  stream: CombineLatestStream([
                    tileRack.selectedTilesStream,
                    tileRack.stream,
                    _canPlayStream()
                  ], (values) => values),
                  builder: (context, snapshot) {
                    return AppButton(
                      onPressed: ((snapshot.data?[2] ?? false) as bool) &&
                              ((snapshot.data?[0] ?? []) as List).isNotEmpty &&
                              ((snapshot.data?[1] ?? []) as List).length ==
                                  MAX_TILES_PER_PLAYER
                          ? () {
                              _actionService.sendAction(
                                  ActionType.exchange,
                                  _gameService
                                      .getTileRack()
                                      .getSelectedTilesPayload());
                              tileRack.disableExchangeMode();
                            }
                          : null,
                      icon: Icons.keyboard_return,
                      iconOnly: true,
                    );
                  })
              : StreamBuilder(
                  stream: CombineLatestStream<dynamic, dynamic>(
                      [_canPlayStream()], (values) => values),
                  builder: (context, snapshot) => AppButton(
                        onPressed: (snapshot.data?[0] ?? false) as bool
                            ? () {
                                _gameEventService.add<void>(
                                    PUT_BACK_TILES_ON_TILE_RACK, null);
                                tileRack.toggleExchangeMode();
                              }
                            : null,
                        icon: Icons.repeat,
                        iconOnly: true,
                      ));
        });
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

  Stream<bool> _canExchangeStream() {
    return CombineLatestStream<dynamic, bool>(
        [_canPlayStream(), _gameService.getTileRack().selectedTilesStream],
        (values) {
      bool canPlay = values[0];
      List<Tile> selectedTiles = values[1];

      return canPlay && selectedTiles.isNotEmpty;
    });
  }
}
