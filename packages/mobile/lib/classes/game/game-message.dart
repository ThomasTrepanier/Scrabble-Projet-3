class GameMessage {
  final String content;
  final String senderId;
  final String gameId;
  final bool? isClickable;

  GameMessage({
    required this.content,
    required this.senderId,
    required this.gameId,
    this.isClickable,
  });

  factory GameMessage.fromJson(Map<String, dynamic> json) {
    return GameMessage(
      content: json['content'] as String,
      senderId: json['senderId'] as String,
      gameId: json['gameId'] as String,
      isClickable: json['isClickable'] as bool?,
    );
  }
}
