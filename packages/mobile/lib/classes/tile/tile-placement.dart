import 'package:mobile/classes/actions/action-place.dart';
import 'package:mobile/classes/board/board.dart';
import 'package:mobile/classes/board/navigator.dart';
import 'package:mobile/classes/board/orientation.dart';
import 'package:mobile/classes/board/position.dart';
import 'package:mobile/classes/tile/tile.dart';
import 'package:mobile/constants/game.constants.dart';

class TilePlacement {
  Tile tile;
  final Position position;

  TilePlacement({required this.tile, required this.position});

  factory TilePlacement.fromJson(Map<String, dynamic> json) {
    return TilePlacement(
        tile: Tile.fromJson(json['tile']),
        position: Position.fromJson(json['position']));
  }

  Map<String, dynamic> toJson() => {
        'tile': tile.toJson(),
        'position': position.toJson(),
      };

  bool equals(TilePlacement other) {
    return position.equals(other.position) && tile == other.tile;
  }

  TilePlacement copy() {
    return TilePlacement(tile: tile.copy(), position: position.copy());
  }
}

class Placement {
  List<TilePlacement> tiles;

  Placement({List<TilePlacement>? tiles}) : tiles = tiles ?? [];

  add(TilePlacement tilePlacement) {
    tiles = [...tiles, tilePlacement];
  }

  remove(TilePlacement tilePlacement) {
    var index = tiles.indexWhere((tile) => tile.equals(tilePlacement));

    if (index < 0) {
      throw Exception(CANNOT_REMOVE_TILE_NOT_FOUND);
    }

    tiles.removeAt(index);
  }

  clear() {
    tiles.clear();
  }

  ActionPlacePayload toActionPayload() {
    var orientation = _getPlacementOrientation(tiles);

    if (orientation == null) {
      throw Exception(CANNOT_CONVERT_PLACEMENT_TO_PAYLOAD_IS_INVALID);
    }
    var sortedTiles = _sortTilePlacements(tiles, orientation);

    return ActionPlacePayload(
        tiles: sortedTiles.map((tilePlacement) => tilePlacement.tile).toList(),
        position: sortedTiles.first.position,
        orientation: orientation);
  }

  bool validatePlacement(Board board) {
    if (tiles.isEmpty) return false;
    var orientation = _getPlacementOrientation(tiles);

    // The method returns an orientation if all the tiles are in one line.
    // If there is no orientation, then the tiles are scattered on the board.
    if (orientation == null) return false;

    var sortedTilePlacements = _sortTilePlacements(tiles, orientation);
    var navigator = Navigator(
        board: board,
        orientation: orientation,
        position: sortedTilePlacements.first.position);
    int index = 0;
    bool hasNeighbors = _placementIncludesMiddle();

    // Check if placement starts with existing tile.
    if (!navigator.clone().backward().isEmpty()) hasNeighbors = true;
    // Check if placement ends with existing tile.
    if (!hasNeighbors &&
        !Navigator(
                board: board,
                orientation: orientation,
                position: sortedTilePlacements.last.position)
            .forward()
            .isEmpty()) hasNeighbors = true;

    // We iterate through the placement
    while (navigator.isWithinBounds()) {
      var tilePlacement = sortedTilePlacements[index];

      // We check wether the current position has the desired tile
      if (tilePlacement.position.equals(navigator.position)) {
        // If the desired tile is present, go to next tile
        index++;
        // We check if the tile as a neighbors.
        if (navigator.hasNonEmptyNeighbor()) hasNeighbors = true;
        // If we went through all the tiles without a problem, then the placement is valid
        if (index == sortedTilePlacements.length) return hasNeighbors;
      } else {
        // If the desired tile is not present, than we make sure that an existing tile is present.
        // If not, then there is a gap in the placement, it is invalid.
        if (navigator.isEmpty()) {
          return false;
        } else {
          // If there is an existing tile within the placement, than the placement is a neighbors to an existing tile.
          hasNeighbors = true;
        }
      }

      navigator.forward();
    }

    // I have no idea how it could reach this. But sometimes I do dumb shit. Better safe than sorry.
    throw Exception(CANNOT_VALIDATE_PLACEMENT_IS_OUT_OF_BOUNDS);
  }

  Orientation? _getPlacementOrientation(List<TilePlacement> tilePlacements) {
    var xValues = tilePlacements.map((placement) => placement.position.x);
    var yValues = tilePlacements.map((placement) => placement.position.y);

    if (yValues.every((y) => y == yValues.first)) return Orientation.horizontal;
    if (xValues.every((x) => x == xValues.first)) return Orientation.vertical;

    return null;
  }

  List<TilePlacement> _sortTilePlacements(
      List<TilePlacement> tilePlacements, Orientation orientation) {
    var list = [...tilePlacements];
    list.sort((a, b) => a.position.getComponentFromOrientation(orientation) >
            b.position.getComponentFromOrientation(orientation)
        ? 1
        : -1);

    return list;
  }

  bool _placementIncludesMiddle() {
    return tiles.any((TilePlacement tile) =>
        tile.position.row == MIDDLE_ROW && tile.position.column == MIDDLE_COL);
  }

  Placement clone() {
    return Placement(tiles: [...tiles]);
  }
}
