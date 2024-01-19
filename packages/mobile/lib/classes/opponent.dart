class Opponent {
  final String name;

  Opponent({
    required this.name,
  });

  Map<String, dynamic> toJson() {
    return {
      'opponentName': name,
    };
  }
}
