import 'package:mobile/classes/tile/tile.dart';

class TilesParser {

  List<Tile> parseTiles(List<dynamic> tiles) {
    return tiles.map((dynamic tile) => Tile.fromJson(tile)).toList();
  }
}
