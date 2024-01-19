import 'package:flutter/material.dart';
import 'package:mobile/classes/virtual-player-level.dart';
import 'package:mobile/components/user-avatar.dart';
import 'package:mobile/constants/avatars-constants.dart';
import 'package:mobile/constants/user-constants.dart';

import '../../classes/user.dart';
import '../../constants/create-lobby-constants.dart';
import '../../view-methods/create-lobby-methods.dart';
import '../error-pop-up.dart';

class WaitingRoom extends StatefulWidget {
  const WaitingRoom({
    super.key,
    required this.virtualPlayerLevel,
  });

  final VirtualPlayerLevel virtualPlayerLevel;

  @override
  State<WaitingRoom> createState() => _WaitingRoomState();
}

class _WaitingRoomState extends State<WaitingRoom> {
  @override
  Widget build(BuildContext context) {
    var theme = Theme.of(context);

    return Padding(
        padding: EdgeInsets.only(left: 0, right: 0, top: 10.0, bottom: 50.0),
        child: Container(
          alignment: Alignment.center,
          child: handlePlayerListChange(theme, widget.virtualPlayerLevel),
        ));
  }
}

StreamBuilder<List<PublicUser>> handlePlayerListChange(
    ThemeData theme, VirtualPlayerLevel virtualPlayerLevel) {
  return StreamBuilder<List<PublicUser>>(
    stream: playerList$.stream,
    builder: (BuildContext context, AsyncSnapshot<List<PublicUser>> snapshot) {
      if (snapshot.hasError) {
        errorSnackBar(
            context,
            'Error: ${snapshot.error}'
            'Stack trace: ${snapshot.stackTrace}');
        return Text('');
      }

      List<PublicUser> users = snapshot.hasData
          ? snapshot.data!
          : List.generate(MAX_PLAYER_COUNT,
              (_) => generateVirtualPlayerUser(virtualPlayerLevel));
      while (users.length < MAX_PLAYER_COUNT) {
        users.add(generateVirtualPlayerUser(virtualPlayerLevel));
      }

      return Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              PlayerInRoom(user: users[0]),
              PlayerInRoom(user: users[1]),
            ],
          ),
          Text("vs", style: TextStyle(fontWeight: FontWeight.bold)),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              PlayerInRoom(user: users[2]),
              PlayerInRoom(
                user: users[3],
              ),
            ],
          ),
        ],
      );
    },
  );
}

class PlayerInRoom extends StatelessWidget {
  const PlayerInRoom({super.key, required this.user});

  final PublicUser user;

  @override
  Widget build(BuildContext context) {
    var theme = Theme.of(context);

    return SizedBox(
      height: 60,
      width: 200,
      child: Container(
          decoration: BoxDecoration(
            color: theme.colorScheme.background,
            boxShadow: [
              BoxShadow(
                color: Colors.grey.withOpacity(0.75),
                spreadRadius: 0.5,
                blurRadius: 3,
                offset: Offset(0, 3),
              ),
            ],
            borderRadius: BorderRadius.all(Radius.circular(32)),
          ),
          child: Padding(
            padding: const EdgeInsets.all(8.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Avatar(
                    avatar: user.avatar,
                    forceInitials: user.avatar.isEmpty,
                    initials: getUsersInitials(user.username),
                    background: theme.colorScheme.onBackground,
                    radius: LOBBY_AVATAR_RADIUS,
                    size: LOBBY_AVATAR_SIZE),
                SizedBox(
                  width: 8,
                ),
                setPlayerName(user.username, theme)
              ],
            ),
          )),
    );
  }
}

SizedBox setPlayerName(String username, ThemeData theme) {
  return SizedBox(
    width: 120,
    child: Text(
      username,
      overflow: TextOverflow.ellipsis,
      style: TextStyle(
          fontSize: 17,
          color: theme.colorScheme.primary,
          fontWeight: FontWeight.w500),
    ),
  );
}
