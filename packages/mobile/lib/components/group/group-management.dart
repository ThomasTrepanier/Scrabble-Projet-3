import 'package:flutter/material.dart';
import 'package:mobile/classes/user.dart';
import 'package:mobile/components/app_button.dart';

import '../../classes/group.dart';
import '../../constants/create-lobby-constants.dart';
import '../../view-methods/create-lobby-methods.dart';

class GroupManagement extends StatelessWidget {
  GroupManagement(this.group);
  final Group group;
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(8.0),
      child: Container(
          child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          AppButton(
              onPressed: () async {
                await backOut();
                if (context.mounted) Navigator.pop(context);
              },
              theme: AppButtonTheme.secondary,
              icon: Icons.keyboard_arrow_left_sharp,
              text: STOP_GAME_SETUP),
          handleStartGameButton()
        ],
      )),
    );
  }
}

StreamBuilder<List<PublicUser>> handleStartGameButton() {
  return StreamBuilder<List<PublicUser>>(
    stream: playerList$.stream,
    builder: (BuildContext context, AsyncSnapshot<List<PublicUser>> snapshot) {
      return AppButton(
          onPressed: isMinimumPlayerCount()
              ? null
              : () async {
                  await startGame();
                },
          icon: Icons.start,
          text: START_GAME);
    },
  );
}
