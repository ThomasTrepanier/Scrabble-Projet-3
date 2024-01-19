// ignore_for_file: constant_identifier_names

import 'package:mobile/classes/user.dart';

class DailyPuzzleResult extends PublicUser {
  final int score;

  DailyPuzzleResult(
      {required super.username,
      required super.avatar,
      super.email = '',
      required this.score});

  factory DailyPuzzleResult.fromJson(Map<String, dynamic> json) {
    PublicUser user = PublicUser.fromJson(json);
    return DailyPuzzleResult(
        username: user.username, avatar: user.avatar, score: json['score']);
  }
}

class DailyPuzzleLeaderboard {
  final List<DailyPuzzleResult> leaderboard;
  final int userScore;
  final int userRank;
  final int totalPlayers;

  DailyPuzzleLeaderboard(
      {required this.leaderboard,
      required this.userScore,
      required this.userRank,
      required this.totalPlayers});

  factory DailyPuzzleLeaderboard.fromJson(Map<String, dynamic> json) {
    return DailyPuzzleLeaderboard(
        leaderboard: (json['leaderboard'] as List<dynamic>)
            .map((dynamic entry) => DailyPuzzleResult.fromJson(entry))
            .toList(),
        userScore: json['userScore'],
        userRank: json['userRank'],
        totalPlayers: json['totalPlayers']);
  }
}

class DailyCompletionStatus {
  final bool isCompleted;

  DailyCompletionStatus({required this.isCompleted});

  factory DailyCompletionStatus.fromJson(Map<String, dynamic> json) {
    return DailyCompletionStatus(isCompleted: json['isCompleted']);
  }
}

const DAILY_PUZZLE_NOT_COMPLETED = -2;
