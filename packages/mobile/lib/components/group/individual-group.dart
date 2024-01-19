import 'package:flutter/material.dart';
import 'package:mobile/classes/game-visibility.dart';
import 'package:mobile/classes/group.dart';
import 'package:mobile/classes/user.dart';
import 'package:mobile/components/game-password-pop-up/game-password-pop-up.dart';
import 'package:mobile/components/user-avatar.dart';
import 'package:mobile/constants/create-lobby-constants.dart';
import 'package:mobile/constants/user-constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/routes/routes.dart';
import 'package:mobile/services/group-join.service.dart';
import 'package:mobile/services/sound-service.dart';

import '../../classes/sound.dart';
import '../../services/theme-color-service.dart';
import '../../utils/duration-format.dart';

class IndividualGroup extends StatefulWidget {
  IndividualGroup(
      {super.key,
      required this.theme,
      required this.group,
      required this.joinGroupFunction});

  final ThemeData theme;
  final Group group;
  final Function joinGroupFunction;

  @override
  State<IndividualGroup> createState() => _IndividualGroupState();
}

class _IndividualGroupState extends State<IndividualGroup> {
  final GroupJoinService groupJoinService = getIt.get<GroupJoinService>();

  @override
  void initState() {
    super.initState();
  }

  @override
  void dispose() {
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    Color themeColor =
        getIt.get<ThemeColorService>().themeDetails.value.color.colorValue;
    return Container(
      margin: EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
          color: widget.theme.colorScheme.background,
          borderRadius: BorderRadius.all(Radius.circular(8))),
      child: IntrinsicHeight(
        child: Row(crossAxisAlignment: CrossAxisAlignment.center, children: [
          Row(
              children: List.generate(
            MAX_PLAYER_COUNT,
            (index) {
              PublicUser userToShow = widget.group.users.length > index
                  ? widget.group.users[index]
                  : generateVirtualPlayerUser(widget.group.virtualPlayerLevel);
              return PlayerInGroup(user: userToShow);
            },
          )),
          VerticalDivider(
            width: 32,
            thickness: 2,
            indent: 8,
            endIndent: 8,
            color: widget.theme.colorScheme.tertiary,
          ),
          GroupParameters(theme: widget.theme, group: widget.group),
          SizedBox(
            width: 32,
          ),
          Expanded(
            child: Column(
              mainAxisSize: MainAxisSize.max,
              children: [
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.only(right: 16),
                    child: Row(
                      mainAxisSize: MainAxisSize.max,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        SizedBox(width: 16),
                        Observers(
                            numberOfObservers: widget.group.numberOfObservers),
                        SizedBox(width: 8),
                        GameVisibilityView(
                          gameVisibility: widget.group.gameVisibility,
                        ),
                        SizedBox(width: 24),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            SizedBox(
                              width: 60,
                              height: 60,
                              child: ElevatedButton(
                                  onPressed: () async {
                                    getIt
                                        .get<SoundService>()
                                        .playSound(Sound.click);

                                    if (widget.group.gameVisibility ==
                                        GameVisibility.protected) {
                                      await groupJoinService
                                          .handleGroupUpdatesRequest(
                                              widget.group.groupId!, true);
                                      // ignore: use_build_context_synchronously
                                      showGamePasswordPopup(
                                          context,
                                          widget.group,
                                          widget.joinGroupFunction,
                                          true);
                                    } else {
                                      widget.joinGroupFunction(
                                          widget.group.groupId, "", true);
                                      Navigator.pushNamed(
                                              context, JOIN_WAITING_ROUTE,
                                              arguments: widget.group)
                                          .then((_) => getIt
                                              .get<GroupJoinService>()
                                              .getGroups());
                                    }
                                  },
                                  style: ElevatedButton.styleFrom(
                                      backgroundColor: themeColor,
                                      foregroundColor: Colors.white,
                                      padding: EdgeInsets.all(0),
                                      shape: BeveledRectangleBorder(
                                          borderRadius: BorderRadius.all(
                                              Radius.circular(2)))),
                                  child: Icon(Icons.visibility, size: 40)),
                            ),
                          ],
                        ),
                        SizedBox(width: 24),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            SizedBox(
                              width: 90,
                              height: 60,
                              child: ElevatedButton(
                                  onPressed: widget.group.canJoin!
                                      ? () async {
                                          getIt
                                              .get<SoundService>()
                                              .playSound(Sound.click);
                                          if (widget.group.gameVisibility ==
                                              GameVisibility.protected) {
                                            await groupJoinService
                                                .handleGroupUpdatesRequest(
                                                    widget.group.groupId!,
                                                    false);
                                            // ignore: use_build_context_synchronously
                                            showGamePasswordPopup(
                                                context,
                                                widget.group,
                                                widget.joinGroupFunction,
                                                false);
                                          } else {
                                            widget.joinGroupFunction(
                                                widget.group.groupId,
                                                "",
                                                false);
                                            Navigator.pushNamed(
                                                    context, JOIN_WAITING_ROUTE,
                                                    arguments: widget.group)
                                                .then((_) => getIt
                                                    .get<GroupJoinService>()
                                                    .getGroups());
                                          }
                                        }
                                      : null,
                                  style: ElevatedButton.styleFrom(
                                      backgroundColor: themeColor,
                                      foregroundColor: Colors.white,
                                      padding: EdgeInsets.all(0),
                                      shape: BeveledRectangleBorder(
                                          borderRadius: BorderRadius.all(
                                              Radius.circular(2)))),
                                  child:
                                      Icon(Icons.play_arrow_rounded, size: 60)),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ]),
      ),
    );
  }
}

class Observers extends StatelessWidget {
  const Observers({super.key, required this.numberOfObservers});

  final int numberOfObservers;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Icon(Icons.visibility, size: 40),
        SizedBox(width: 8),
        Text(
          numberOfObservers.toString(),
          style:
              TextStyle(fontSize: 24, fontWeight: FontWeight.w500, height: 1),
        )
      ],
    );
  }
}

class GameVisibilityView extends StatelessWidget {
  const GameVisibilityView({super.key, required this.gameVisibility});

  final GameVisibility gameVisibility;

  @override
  Widget build(BuildContext context) {
    return Tooltip(
        message: gameVisibility.description,
        triggerMode: TooltipTriggerMode.tap,
        preferBelow: false,
        showDuration: Duration(seconds: 3),
        child: Icon(gameVisibility.icon, size: 40));
  }
}

class GroupParameters extends StatelessWidget {
  const GroupParameters({
    super.key,
    required this.theme,
    required this.group,
  });

  final ThemeData theme;
  final Group group;

  @override
  Widget build(BuildContext context) {
    return IntrinsicWidth(
      child: SizedBox(
        width: 130,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            SizedBox(height: 8),
            Expanded(
              child: Container(
                alignment: Alignment.center,
                decoration: BoxDecoration(
                    color: theme.colorScheme.tertiary,
                    borderRadius: BorderRadius.all(Radius.circular(8))),
                child: Padding(
                  padding: const EdgeInsets.all(4),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.hourglass_bottom),
                      SizedBox(width: 8),
                      Text(formatTime(group.maxRoundTime)),
                    ],
                  ),
                ),
              ),
            ),
            SizedBox(height: 8),
            Expanded(
              child: Container(
                decoration: BoxDecoration(
                    color: theme.colorScheme.tertiary,
                    borderRadius: BorderRadius.all(Radius.circular(8))),
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(8, 4, 16, 4),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.smart_toy_sharp),
                      SizedBox(width: 8),
                      Text(group.virtualPlayerLevel.levelName),
                    ],
                  ),
                ),
              ),
            ),
            SizedBox(height: 8),
          ],
        ),
      ),
    );
  }
}

class PlayerInGroup extends StatelessWidget {
  const PlayerInGroup({
    super.key,
    required this.user,
  });

  final PublicUser user;

  @override
  Widget build(BuildContext context) {
    String username = user.username;
    String? avatar = user.avatar.isNotEmpty ? user.avatar : null;

    var theme = Theme.of(context);

    return Container(
      margin: EdgeInsets.fromLTRB(4, 8, 4, 4),
      padding: EdgeInsets.only(bottom: 4),
      child: IntrinsicWidth(
        child: SizedBox(
          width: 100,
          child: Column(
            children: [
              FittedBox(
                fit: BoxFit.cover,
                child: Avatar(
                    avatar: avatar,
                    forceInitials: avatar == null,
                    initials: getUsersInitials(username),
                    background: theme.colorScheme.onBackground,
                    radius: 32,
                    size: 60),
              ),
              SizedBox(
                height: 4,
              ),
              Center(
                  child: Text(
                username,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                softWrap: true,
              ))
            ],
          ),
        ),
      ),
    );
  }
}
