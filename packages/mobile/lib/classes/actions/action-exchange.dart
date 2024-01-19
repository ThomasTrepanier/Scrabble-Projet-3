import 'package:mobile/classes/actions/action-data.dart';
import 'package:mobile/classes/tile/tile.dart';

class ActionExchangePayload extends ActionPayload {
  late List<Tile> tiles;

  ActionExchangePayload({required this.tiles});

  ActionExchangePayload.fromJson(Map<String, dynamic> json)
      : super.fromJson(json) {
    tiles = (json['tiles'] as List<Map<String, dynamic>>)
        .map((tile) => Tile(
            letter: tile['letter'],
            value: tile['value'],
            isWildcard: tile['isBlank'],
            playedLetter: tile['playedLetter']))
        .toList();
  }

  @override
  Map<String, dynamic> toJson() => {
        'tiles': tiles.map((tile) => tile.toJson()).toList(),
      };
}
