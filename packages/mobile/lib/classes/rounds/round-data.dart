import 'package:mobile/classes/player/player-data.dart';

class RoundData {
  PlayerUpdateData playerData;
  DateTime startTime;
  DateTime limitTime;
  DateTime? completedTime;

  RoundData(
      {required this.playerData,
      required this.startTime,
      required this.limitTime,
      this.completedTime});

  factory RoundData.fromJson(Map<String, dynamic> json) {
    return RoundData(
      playerData:
          PlayerUpdateData.fromJson(json['playerData'] as Map<String, dynamic>),
      startTime: DateTime.parse(json['startTime'] as String),
      limitTime: DateTime.parse(json['limitTime'] as String),
      completedTime: json['completedTime'] != null
          ? DateTime.parse(json['completedTime'] as String)
          : null,
    );
  }
}
