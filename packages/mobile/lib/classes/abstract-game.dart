import 'package:mobile/classes/board/board.dart';
import 'package:mobile/classes/tile/tile-rack.dart';
import 'package:mobile/classes/game/players_container.dart';
import 'package:mobile/classes/tile/tile-reserve.dart';

class AbstractGame {
  Board board;
  TileRack tileRack;

  AbstractGame({
    required this.board,
    required this.tileRack,
  });
}



