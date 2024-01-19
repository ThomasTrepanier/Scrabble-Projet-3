import 'dart:async';

import 'package:flutter/cupertino.dart';
import 'package:mobile/classes/channel.dart';
import 'package:mobile/components/chatbox.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/chat.service.dart';
import 'package:rxdart/rxdart.dart';

class ChatboxWrapper extends StatefulWidget {
  @override
  State<ChatboxWrapper> createState() => _ChatboxWrapperState();
}

class _ChatboxWrapperState extends State<ChatboxWrapper> {
  final ChatService _chatService = getIt.get<ChatService>();
  Stream<Channel?> _openedChannel = Stream.empty();

  @override
  void initState() {
    super.initState();
    _openedChannel = CombineLatestStream<dynamic, Channel?>(
        [_chatService.myChannels.asBroadcastStream(), _chatService.openedChannelId.asBroadcastStream()], (values) {
      List<Channel> myChannels = values[0];
      int? openedChannelId = values[1];

      if (openedChannelId == null) return null;

      try {
        return myChannels.firstWhere(
                (Channel channel) => channel.idChannel == openedChannelId);
      } on StateError catch (_) {
        return null;
      }
    }).asBroadcastStream();
  }

  @override
  void dispose() {
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return StreamBuilder(
      stream: _openedChannel,
      builder: (context, snapshot) {
        return snapshot.hasData
            ? Chatbox(channel: snapshot.data!)
            : SizedBox.shrink();
      },
    );
  }
}
