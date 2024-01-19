class TileReserveData {
  String letter;
  int amount;

  TileReserveData({required this.letter, required this.amount});

  factory TileReserveData.fromJson(Map<String, dynamic> json) {
    return TileReserveData(
      letter: json['letter'] as String,
      amount: json['amount'] as int,
    );
  }
}
