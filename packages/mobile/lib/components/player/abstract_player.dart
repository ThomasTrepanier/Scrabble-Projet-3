import 'package:flutter/material.dart';
import 'package:mobile/classes/game/player.dart' as c;
import 'package:mobile/components/animation/pulse.dart';
import 'package:mobile/components/user-avatar.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/constants/user-constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/routes/navigator-key.dart';
import 'package:mobile/services/theme-color-service.dart';

abstract class AbstractPlayer extends StatelessWidget {
  final ThemeColorService _themeColorService = getIt.get<ThemeColorService>();

  final bool isPlaying;
  final c.Player player;
  final bool isObserved;

  AbstractPlayer({
    required this.player,
    this.isPlaying = false,
    this.isObserved = false,
  });

  @override
  Widget build(BuildContext context) {
    return Pulse(
      active: isPlaying && player.isLocalPlayer,
      scale: 1.035,
      duration: Duration(milliseconds: 750),
      child: getContent(context),
    );
  }

  Widget getContent(BuildContext context);

  Widget getPlayerInfo({bool large = false}) {
    var theme = Theme.of(navigatorKey.currentContext!);
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Avatar(
            avatar: player.user.avatar,
            forceInitials: player.user.avatar.isEmpty,
            initials: getUsersInitials(player.user.username),
            background: theme.colorScheme.onBackground,
            radius: 16,
            size: large ? 44 : 22),
        SizedBox(
          width: SPACE_1,
        ),
        Expanded(
            child: Container(
          margin: EdgeInsets.only(right: SPACE_2),
          child: Text(
            player.user.username,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
                fontSize: large ? 20 : 15,
                height: 1,
                color: getTextColor(),
                fontWeight: FontWeight.w500),
          ),
        )),
      ],
    );
  }

  Color? getColor() {
    return isPlaying
        ? _themeColorService.themeDetails.value.color.colorValue
        : null;
  }

  Color? getTextColor() {
    return isPlaying ? Colors.white : null;
  }
}
