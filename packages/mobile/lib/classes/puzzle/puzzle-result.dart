// ignore_for_file: non_constant_identifier_names

import 'dart:math';

import 'package:mobile/classes/actions/word-placement.dart';
import 'package:mobile/classes/game/game-message.dart';
import 'package:mobile/classes/puzzle/puzzle-level.dart';
import 'package:mobile/classes/tile/square.dart';

class PuzzleResult {
  final int userPoints;
  final PuzzleResultStatus result;
  final ScoredWordPlacement targetPlacement;
  final List<ScoredWordPlacement> allPlacements;

  PuzzleResult(
      {required this.userPoints,
      required this.result,
      required this.targetPlacement,
      required this.allPlacements});

  factory PuzzleResult.fromJson(Map<String, dynamic> json) {
    return PuzzleResult(
        userPoints: max(0, json['userPoints'] ?? 0),
        result: PuzzleResultStatus.parse(json['result']),
        targetPlacement: ScoredWordPlacement.fromJson(json['targetPlacement']),
        allPlacements: (json['allPlacements'] as List<dynamic>)
            .map((dynamic placement) => ScoredWordPlacement.fromJson(placement))
            .toList());
  }
}

class PuzzlePlayed extends PuzzleResult {
  final PuzzleLevelName levelName;
  final ScoredWordPlacement? playedPlacement;
  final List<Square> gridConfig;

  PuzzlePlayed(
      {required super.userPoints,
      required super.result,
      required super.targetPlacement,
      required super.allPlacements,
      required this.levelName,
      required this.playedPlacement,
      required this.gridConfig});

  factory PuzzlePlayed.afterPlayed(
          PuzzleLevelName levelName,
          List<Square> gridConfig,
          ScoredWordPlacement? playedPlacement,
          PuzzleResult puzzleResult) =>
      PuzzlePlayed(
          userPoints: puzzleResult.userPoints,
          result: puzzleResult.result,
          targetPlacement: puzzleResult.targetPlacement,
          allPlacements: puzzleResult.allPlacements,
          levelName: levelName,
          playedPlacement: playedPlacement,
          gridConfig: gridConfig);

  GameMessage placementToGameMessage() {
    return GameMessage(
        content:
            'Vous avez placé ${playedPlacement?.tilesToString() ?? ''} pour $userPoints points',
        gameId: '',
        senderId: '');
  }
}

enum PuzzleResultStatus {
  won,
  valid,
  invalid,
  abandoned,
  timeout;

  String get displayName => PUZZLE_RESULT_TO_DISPLAY_NAME[this] ?? 'Inconnu';

  factory PuzzleResultStatus.parse(dynamic value) {
    if (value is int) return PuzzleResultStatus.fromInt(value);
    if (value is String) {
      return PuzzleResultStatus.fromDisplayName(value);
    }
    throw Exception('Could not parse PuzzleResultStatus from: $value');
  }

  factory PuzzleResultStatus.fromInt(int value) {
    return PuzzleResultStatus.values[value];
  }

  factory PuzzleResultStatus.fromDisplayName(String displayName) {
    return PUZZLE_RESULT_TO_DISPLAY_NAME.entries
        .where((MapEntry<PuzzleResultStatus, String> entry) =>
            entry.value == displayName)
        .first
        .key;
  }

  Map<String, dynamic> toJson() => {
    'status': PUZZLE_RESULT_TO_DISPLAY_NAME[this],
  };
}

Map<PuzzleResultStatus, String> PUZZLE_RESULT_TO_DISPLAY_NAME = {
  PuzzleResultStatus.won: 'Gagné',
  PuzzleResultStatus.valid: 'Valide',
  PuzzleResultStatus.invalid: 'Invalide',
  PuzzleResultStatus.abandoned: 'Abandonné',
  PuzzleResultStatus.timeout: 'Temps écoulé',
};
