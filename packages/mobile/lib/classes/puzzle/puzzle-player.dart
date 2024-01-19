import 'package:mobile/classes/puzzle/puzzle-result.dart';
import 'package:mobile/classes/user.dart';

class PuzzlePlayer {
  final PublicUser user;
  int streakPoints;
  int streakMaxPoints;

  PuzzlePlayer(
      {required this.user,
      this.streakPoints = 0,
      this.streakMaxPoints = 0});

  void updateStreak(PuzzleResult result) {
    streakPoints += result.userPoints;
    streakMaxPoints += result.targetPlacement.score;
  }
}
