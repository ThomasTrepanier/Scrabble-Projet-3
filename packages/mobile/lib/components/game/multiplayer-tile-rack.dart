import 'package:flutter/material.dart';
import 'package:mobile/classes/board/board.dart';
import 'package:mobile/classes/tile/tile-rack.dart';
import 'package:mobile/classes/tile/tile.dart';
import 'package:mobile/components/tile/tile-rack/abstract-tile-rack.dart';
import 'package:mobile/components/tile/tile-rack/clear-placed-tiles.dart';
import 'package:mobile/components/tile/tile-rack/toggle-exchange-mode.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/game.service.dart';

class MultiplayerTileRack extends AbstractTileRack {
  MultiplayerTileRack({required super.gameStream});

  final GameService _gameService = getIt.get<GameService>();

  @override
  List<Widget> endOfTileRackButtons(TileRack tileRack, Board board) {
    return List<Widget>.of([
      ToggleExchangeModeWidget(tileRack: tileRack),
      ClearPlacedTilesWidget(
        hasPlacementStream: board.hasPlacementStream,
        tileRack: tileRack,
      ),
    ]);
  }

  @override
  Widget buildTile(Tile tile, int index) {
    return StreamBuilder<bool>(
        stream: _gameService.getTileRack().isExchangeModeEnabled,
        builder: (context, isExchangeModeEnabled) {
          return isExchangeModeEnabled.data == null ||
                  isExchangeModeEnabled.data == false
              ? super.buildDraggableTile(tile, index)
              : _buildSelectableTile(tile, index, true);
        });
  }

  Widget _buildSelectableTile(Tile tile, int index, bool shouldWiggle) {
    return StreamBuilder(
        stream: gameStream,
        builder: (context, snapshot) {
          return GestureDetector(
              onTap: snapshot.data != null
                  ? () => snapshot.data!.tileRack.toggleSelectedTile(tile)
                  : null,
              child: super.buildWrappedTile(tile, index, shouldWiggle));
        });
  }
}
