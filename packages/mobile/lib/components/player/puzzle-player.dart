import 'package:flutter/material.dart';
import 'package:mobile/components/user-avatar.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/classes/puzzle/puzzle-player.dart' as c;
import 'package:mobile/constants/user-constants.dart';

class PuzzlePlayer extends StatelessWidget {
  PuzzlePlayer({
    required this.player,
  });

  final c.PuzzlePlayer player;

  @override
  Widget build(BuildContext context) {
    ThemeData theme = Theme.of(context);

    return Card(
        color: theme.primaryColor,
        child: Container(
          padding: EdgeInsets.symmetric(
            horizontal: SPACE_2,
            vertical: SPACE_1,
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Avatar(
                  avatar: player.user.avatar,
                  forceInitials: player.user.avatar.isEmpty,
                  initials: getUsersInitials(player.user.username),
                  background: theme.colorScheme.onBackground,
                  radius: 16,
                  size: 44),
              SizedBox(
                width: SPACE_2,
              ),
              Expanded(
                  child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    player.user.username,
                    overflow: TextOverflow.ellipsis,
                    textAlign: TextAlign.start,
                    style: TextStyle(
                        fontSize: 20,
                        height: 1,
                        fontWeight: FontWeight.w500,
                        color: Colors.white),
                  ),
                  SizedBox(
                    height: SPACE_1,
                  ),
                  Opacity(
                    opacity: 0.64,
                    child: Text(
                      '${player.streakPoints} / ${player.streakMaxPoints} pts',
                      style: TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 14,
                          height: 1,
                          color: Colors.white),
                      overflow: TextOverflow.ellipsis,
                      textAlign: TextAlign.start,
                    ),
                  ),
                ],
              )),
            ],
          ),
        ));
  }
}
