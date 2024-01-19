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

class PuzzleTileRack extends AbstractTileRack {
  PuzzleTileRack({required super.gameStream});

  @override
  List<Widget> endOfTileRackButtons(TileRack tileRack, Board board) {
    return List<Widget>.of([
      ClearPlacedTilesWidget(
        hasPlacementStream: board.hasPlacementStream,
        tileRack: tileRack,
      ),
    ]);
  }

  @override
  Widget buildTile(Tile tile, int index) {
    return super.buildDraggableTile(tile, index);
  }
}
