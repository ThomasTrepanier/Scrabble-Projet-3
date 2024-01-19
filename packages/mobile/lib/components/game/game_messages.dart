import 'package:flutter/material.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/game-messages.service.dart';

import '../../classes/game/game-message.dart';

class GameMessages extends StatelessWidget {
  final GameMessagesService gameMessagesService =
      getIt.get<GameMessagesService>();
  final ScrollController _scrollController = ScrollController();

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<List<Widget>>(
        stream: gameMessagesService.messageEvent,
        builder: (context, snapshot) {
          final children = snapshot.data ?? [];

          WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToEnd());
          return Card(
            child: SingleChildScrollView(
              reverse: false,
              controller: _scrollController,
              padding: EdgeInsets.symmetric(
                vertical: SPACE_2,
                horizontal: SPACE_3,
              ),
              child: Container(
                child: Column(children: children),
              ),
            ),
          );
        });
  }

  _scrollToEnd() async {
    _scrollController.animateTo(_scrollController.position.maxScrollExtent,
        duration: Duration(milliseconds: 200), curve: Curves.easeInOut);
  }
}
