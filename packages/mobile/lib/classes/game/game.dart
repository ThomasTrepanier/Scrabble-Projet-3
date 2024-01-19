import 'package:mobile/classes/abstract-game.dart';
import 'package:mobile/classes/game/players_container.dart';
import 'package:mobile/classes/tile/tile-reserve.dart';

class MultiplayerGame extends AbstractGame {
  PlayersContainer players;
  List<TileReserveData> tileReserve;
  bool isOver;
  int? idGameHistory;

  MultiplayerGame({
    required super.board,
    required super.tileRack,
    required this.players,
    required this.tileReserve,
    this.isOver = false,
  });

  int computeNumberOfTilesLeft() {
    if (tileReserve.isEmpty) return 0;

    return tileReserve
        .map((TileReserveData tile) => tile.amount)
        .reduce((value, int amount) => value + amount);
  }
}
