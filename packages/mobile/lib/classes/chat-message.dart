import 'package:mobile/classes/user.dart';
import 'package:uuid/uuid.dart';

class ChatMessage {
  final PublicUser sender;
  final String content;
  final String date;
  final String uid;

  ChatMessage(
      {required this.sender, required this.content, required this.date}) : uid = Uuid().v4();

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      sender: PublicUser.fromJson(json['sender']),
      content: json['content'] as String,
      date: json['date'] as String,
    );
  }

  Map<String, dynamic> toJson() => {
        "sender": sender,
        "content": content,
        "date": date,
      };
}
