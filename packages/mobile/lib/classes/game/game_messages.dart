import 'package:mobile/classes/actions/action-place.dart';
import 'package:mobile/classes/board/orientation.dart';
import 'package:mobile/classes/board/position.dart';
import 'package:mobile/classes/tile/tile-rack.dart';
import 'package:mobile/classes/tile/tile.dart';

class PlacementMessage {
  final String letters;
  final int points;

  PlacementMessage({
    required this.letters,
    required this.points,
  });
}

class OpponentPlacementMessage extends PlacementMessage {
  final String name;

  OpponentPlacementMessage({
    required this.name,
    required super.letters,
    required super.points,
  });
}

class HintMessagePayload extends PlacementMessage {
  final String position;

  HintMessagePayload({
    required super.letters,
    required super.points,
    required this.position,
  });

  ActionPlacePayload toActionPayload(TileRack tileRack) {
    List<Tile> tileRackTiles = [...tileRack.stream.value.map((t) => t.copy())];

    List<Tile> tilesToPlace = letters.split('').map((letter) {
      if (isBlankTile(letter)) {
        int indexOfBlank = tileRackTiles.indexWhere((Tile t) => t.letter == '*');
        if (indexOfBlank < 0) throw Exception('The player does not have a working blank tile');

        Tile blankTile = tileRackTiles.removeAt(indexOfBlank);
        blankTile.playedLetter = letter;
        return blankTile;
      }

      int indexOfTile = tileRackTiles.indexWhere((Tile t) => t.letter == letter.toUpperCase());
      if (indexOfTile < 0) throw Exception('The player does not have a working tile');
      return tileRackTiles.removeAt(indexOfTile);
    }).toList();

    Position pos = Position.fromString(position);

    String lastLetter = position.substring(position.length - 1);

    Orientation orientation =
        lastLetter == 'h' ? Orientation.horizontal : Orientation.vertical;


    return ActionPlacePayload(
        tiles: tilesToPlace, position: pos, orientation: orientation);
  }

  bool isBlankTile(String letter) => letter == letter.toUpperCase();
}

class HintMessage {
  final List<HintMessagePayload> hints;

  HintMessage(this.hints);
}
