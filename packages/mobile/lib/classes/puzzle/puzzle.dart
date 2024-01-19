import 'package:mobile/classes/abstract-game.dart';
import 'package:mobile/classes/puzzle/puzzle-level.dart';
import 'package:mobile/classes/puzzle/puzzle-player.dart';
import 'package:mobile/classes/puzzle/puzzle-type.dart';
import 'package:mobile/classes/tile/square.dart';

class PuzzleGame extends AbstractGame {
  final PuzzlePlayer puzzlePlayer;
  final PuzzleLevel puzzleLevel;
  final List<Square> gridConfig;
  final PuzzleType puzzleType;

  PuzzleGame(
      {required super.board,
      required super.tileRack,
      required this.puzzlePlayer,
      required this.puzzleLevel,
      required this.gridConfig,
      required this.puzzleType});
}
