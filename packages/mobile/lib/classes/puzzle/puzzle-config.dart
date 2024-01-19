import 'package:mobile/classes/puzzle/puzzle-level.dart';
import 'package:mobile/classes/puzzle/puzzle-type.dart';
import 'package:mobile/classes/tile/square.dart';
import 'package:mobile/classes/tile/tile.dart';
import 'package:mobile/constants/create-game.constants.dart';

class StartPuzzle {
  List<Square> board;
  List<Tile> tiles;
  late PuzzleLevel puzzleLevel;
  late PuzzleType puzzleType;

  StartPuzzle({required this.board, required this.tiles});

  factory StartPuzzle.fromJson(Map<String, dynamic> json) {
    return StartPuzzle(
        board: List<Square>.from(
            (json['board']['grid'] as List<dynamic>).expand((element) => element).map((e) => Square.fromJson(e))),
        tiles: List<Tile>.from(
            (json['tiles'] as List).map((e) => Tile.fromJson(e))));
  }

  StartPuzzle withPuzzleLevel(PuzzleLevel puzzleLevel) {
    this.puzzleLevel = puzzleLevel;
    return this;
  }

  StartPuzzle withPuzzleType(PuzzleType puzzleType) {
    this.puzzleType = puzzleType;
    return this;
  }

}
