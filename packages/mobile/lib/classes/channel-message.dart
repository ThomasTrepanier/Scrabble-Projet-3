import 'package:mobile/classes/chat-message.dart';

class ChannelMessage {
  final ChatMessage message;
  final int idChannel;
  bool isRead;

  get isNotRead => isRead == false;

  ChannelMessage({required this.message, required this.idChannel, this.isRead = true});

  factory ChannelMessage.fromJson(Map<String, dynamic> json) {
    return ChannelMessage(
      message: ChatMessage.fromJson(json['message']),
      idChannel: json['idChannel'] as int,
    );
  }

  Map<String, dynamic> toJson() => {
        "message": message,
        "idChannel": idChannel,
      };
}
