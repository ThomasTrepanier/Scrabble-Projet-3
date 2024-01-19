import 'channel-message.dart';

class Channel {
  final int idChannel;
  final String name;
  final bool canQuit;
  final bool isPrivate;
  List<ChannelMessage> messages = List.empty();

  bool get hasUnreadMessages => messages.any((ChannelMessage m) => m.isRead == false);

  Channel({
    required this.idChannel,
    required this.name,
    required this.canQuit,
    required this.isPrivate,
  });

  factory Channel.fromJson(Map<String, dynamic> json) {
    return Channel(
      idChannel: json['idChannel'] as int,
      name: json['name'] as String,
      canQuit: json['canQuit'] as bool,
      isPrivate: json['private'] as bool,
    );
  }
  Map<String, dynamic> toJson() => {
        "idChannel": idChannel,
        "name": name,
        "canQuit": canQuit,
        "private": isPrivate,
      };
}

class ChannelCreation {
  final String name;

  ChannelCreation({required this.name});

  factory ChannelCreation.fromJson(Map<String, dynamic> json) {
    return ChannelCreation(
      name: json['name'] as String,
    );
  }
  Map<String, dynamic> toJson() => {
        "name": name,
      };
}
