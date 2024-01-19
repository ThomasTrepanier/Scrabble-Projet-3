class GameHistory {
  DateTime startTime;
  DateTime endTime;
  int score;
  bool hasAbandoned;
  bool isWinner;
  int? idAnalysis;
  double? ratingVariation;

  GameHistory(
      {required this.startTime,
      required this.endTime,
      required this.score,
      required this.hasAbandoned,
      required this.isWinner,
      required this.idAnalysis,
      required this.ratingVariation});

  GameHistory.fromJson(Map<String, dynamic> json)
      : this(
            startTime: DateTime.parse(json['startTime']),
            endTime: DateTime.parse(json['endTime']),
            score: json['score'],
            hasAbandoned: json['hasAbandoned'],
            isWinner: json['isWinner'],
            idAnalysis: json['idAnalysis'],
            ratingVariation: (json['ratingVariation'] as num).toDouble());

  static List<GameHistory> fromJsonList(List<dynamic> list) {
    return list
        .map<GameHistory>(
            (json) => GameHistory.fromJson(json as Map<String, dynamic>))
        .toList();
  }
}
