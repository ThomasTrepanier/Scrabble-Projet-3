import 'package:flutter/material.dart';
import 'package:flutter_chat_types/flutter_chat_types.dart' as types;
import 'package:flutter_chat_ui/flutter_chat_ui.dart';
import 'package:mobile/classes/channel.dart';
import 'package:mobile/classes/user.dart';
import 'package:mobile/services/chat.service.dart';
import 'package:mobile/services/theme-color-service.dart';

import '../classes/channel-message.dart';
import '../classes/chat-message.dart';
import '../locator.dart';
import '../routes/routes.dart';
import '../services/user.service.dart';

class Chatbox extends StatefulWidget {
  final Channel channel;

  const Chatbox({super.key, required this.channel});

  @override
  State<Chatbox> createState() => _ChatboxState();
}

class _ChatboxState extends State<Chatbox> {
  final ChatService _chatService = getIt.get<ChatService>();
  final UserService userService = getIt.get<UserService>();

  late PublicUser userData;
  late types.User _userView;
  Color themeColor =
      getIt.get<ThemeColorService>().themeDetails.value.color.colorValue;

  @override
  void initState() {
    super.initState();
    userData = userService.getUser();
    _userView = types.User(id: userData.email, firstName: userData.username);
  }

  @override
  Widget build(BuildContext context) {
    var theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
          title: Text(widget.channel.name),
          shadowColor: Colors.black,
          backgroundColor: Colors.white,
          elevation: 1,
          leading: IconButton(
              icon: Icon(
                Icons.arrow_back,
                color: theme.primaryColor,
              ),
              onPressed: () {
                _chatService.scaffoldKey.currentState?.closeEndDrawer();
                _chatService.closeChannel();
              }),
          automaticallyImplyLeading: false,
          surfaceTintColor: theme.colorScheme.primary),
      body: Chat(
        theme: DefaultChatTheme(
          inputBackgroundColor: themeColor,
          primaryColor: themeColor,
        ),
        onAvatarTap: _navigateToProfile,
        messages: _filterToChatBoxFormat(widget.channel.messages),
        onSendPressed: _handleSendPressed,
        showUserAvatars: true,
        showUserNames: true,
        user: _userView,
      ),
    );
  }

  void _navigateToProfile(types.User user) {
    Navigator.pushNamed(context, PROFILE_ROUTE,
        arguments: PublicUser(
            username: user.firstName ?? '', avatar: user.imageUrl ?? ''));
  }

  void _handleSendPressed(types.PartialText message) {
    if (message.text != "") {
      final messageData = ChatMessage(
        sender: userData,
        content: message.text,
        date: DateTime.now().toString(),
      );

      _chatService.sendMessage(widget.channel, messageData);
    }
  }

  List<types.TextMessage> _filterToChatBoxFormat(
      List<ChannelMessage> messages) {
    return List<types.TextMessage>.from(
        messages.map((message) => _toChatBoxFormat(message.message)));
  }

  types.TextMessage _toChatBoxFormat(ChatMessage message) {
    return types.TextMessage(
      author: types.User(
          imageUrl: message.sender.avatar,
          id: message.sender.email,
          firstName: message.sender.username),
      createdAt: DateTime.parse(message.date).millisecondsSinceEpoch,
      id: message.uid,
      text: message.content,
    );
  }
}
