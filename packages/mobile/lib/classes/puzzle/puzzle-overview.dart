import 'package:mobile/classes/puzzle/puzzle-level.dart';
import 'package:mobile/classes/puzzle/puzzle-result.dart';

class PuzzleOverview {
  final int scoredPoints;
  final int maxPoints;
  final PuzzleResultStatus resultStatus;
  final PuzzleLevelName levelName;

  PuzzleOverview(
      {required this.scoredPoints,
      required this.maxPoints,
      required this.resultStatus,
      required this.levelName});

  factory PuzzleOverview.fromPuzzlePlayed(
      PuzzlePlayed puzzlePlayed) {
    return PuzzleOverview(
        scoredPoints: puzzlePlayed.userPoints,
        maxPoints: puzzlePlayed.targetPlacement.score,
        resultStatus: puzzlePlayed.result,
        levelName: puzzlePlayed.levelName);
  }

  String get message {
    switch (resultStatus) {
      case PuzzleResultStatus.won:
        return 'Victoire!';
      case PuzzleResultStatus.valid:
        return 'Bien joué!';
      case PuzzleResultStatus.invalid:
        return 'Le placement que vous avez fait est invalide';
      case PuzzleResultStatus.abandoned:
        return 'Puzzle abandonné';
      case PuzzleResultStatus.timeout:
        return 'Temps écoulé';
      default:
        return '';
    }
  }
}
