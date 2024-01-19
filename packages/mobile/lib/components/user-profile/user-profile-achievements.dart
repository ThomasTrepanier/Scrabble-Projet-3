import 'package:flutter/material.dart';
import 'package:mobile/classes/achievements.dart';
import 'package:mobile/components/alert-dialog.dart';
import 'package:mobile/components/app_button.dart';
import 'package:mobile/components/image.dart';
import 'package:mobile/constants/layout.constants.dart';

import '../../locator.dart';
import '../../services/theme-color-service.dart';

enum AchievementProgressType {
  none,
  yes,
  max,
}

class UserProfileAchievements extends StatelessWidget {
  final ThemeColorService _themeColorService = getIt.get<ThemeColorService>();
  final List<UserAchievement> achievements;

  UserProfileAchievements({required this.achievements});

  @override
  Widget build(BuildContext context) {
    return Card(
        child: Padding(
            padding: EdgeInsets.all(SPACE_4),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Wrap(
                  alignment: WrapAlignment.center,
                  spacing: SPACE_3,
                  runSpacing: SPACE_3,
                  children: achievements
                      .map((achievement) =>
                          buildAchievement(context, achievement))
                      .toList(),
                )
              ],
            )));
  }

  Widget buildAchievement(BuildContext context, UserAchievement achievement) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: SPACE_3),
      child: Column(
        children: [
          GestureDetector(
            onTap: () => triggerDialogBox(
                achievement.achievement.name,
                [buildDialog(context, achievement)],
                [
                  DialogBoxButtonParameters(
                      content: 'Ok',
                      theme: AppButtonTheme.primary,
                      closesDialog: true)
                ],
                dismissOnBackgroundTouch: true),
            child: Container(
              margin: EdgeInsets.only(bottom: SPACE_1),
              child: AppImage(
                src: achievement.level?.image ??
                    achievement.achievement.defaultImage,
                width: 125,
              ),
            ),
          ),
          Text(
            achievement.value.round().toString(),
            style: TextStyle(
                color: _themeColorService.themeDetails.value.color.colorValue,
                fontSize: 36,
                fontWeight: FontWeight.w600),
          ),
          Text(
            achievement.achievement.name,
            style: TextStyle(fontWeight: FontWeight.w500),
          ),
          Opacity(
            opacity: 0.65,
            child: getMessage(achievement),
          )
        ],
      ),
    );
  }

  Widget getMessage(UserAchievement achievement) {
    switch (getProgressType(achievement)) {
      case AchievementProgressType.max:
        return Text('Niveau maximum!');
      case AchievementProgressType.none:
      case AchievementProgressType.yes:
        return Row(
          children: [
            Text('Prochain niveau: '),
            Text(
              getNextLevelPoints(achievement).toString(),
              style: TextStyle(fontWeight: FontWeight.w500),
            )
          ],
        );
    }
  }

  Widget buildDialog(BuildContext context, UserAchievement achievement) {
    return Column(
      children: [
        Text(achievement.achievement.description),
        SizedBox(
          height: SPACE_4,
        ),
        Row(
          children: achievement.achievement.levels
              .asMap()
              .entries
              .map<Widget>((level) => Container(
                    margin: EdgeInsets.symmetric(horizontal: SPACE_3),
                    child: Opacity(
                      opacity: ((achievement.levelIndex ?? -1) >= level.key
                          ? 1
                          : 0.55),
                      child: Column(
                        children: [
                          Container(
                            margin: EdgeInsets.only(bottom: SPACE_1),
                            child: AppImage(
                              src: level.value.image,
                              width: 100,
                            ),
                          ),
                          Text(
                            level.value.value.toString(),
                            style: TextStyle(
                                color: _themeColorService
                                    .themeDetails.value.color.colorValue,
                                fontSize: 36,
                                fontWeight: FontWeight.w600),
                          )
                        ],
                      ),
                    ),
                  ))
              .toList(),
        )
      ],
    );
  }

  AchievementProgressType getProgressType(UserAchievement achievement) {
    return achievement.levelIndex == null
        ? AchievementProgressType.none
        : achievement.levelIndex == achievement.achievement.levels.length - 1
            ? AchievementProgressType.max
            : AchievementProgressType.yes;
  }

  int getNextLevelPoints(UserAchievement achievement) {
    switch (getProgressType(achievement)) {
      case AchievementProgressType.max:
        return 9999;
      case AchievementProgressType.yes:
        return achievement
            .achievement.levels[achievement.levelIndex! + 1].value;
      case AchievementProgressType.none:
        return achievement.achievement.levels[0].value;
    }
  }

  int getPreviousLevelPoints(UserAchievement achievement) {
    switch (getProgressType(achievement)) {
      case AchievementProgressType.max:
        return achievement.achievement
            .levels[achievement.achievement.levels.length - 1].value;
        ;
      case AchievementProgressType.yes:
        return achievement
            .achievement.levels[achievement.levelIndex! - 1].value;
      case AchievementProgressType.none:
        return 0;
    }
  }

  int getProgress(UserAchievement achievement) {
    var previousLevelPoints = getPreviousLevelPoints(achievement);
    var nextLevelPoints = getNextLevelPoints(achievement);
    var currentProgress = (achievement.value - previousLevelPoints) ~/
        (nextLevelPoints - previousLevelPoints);

    return ((achievement.levelIndex ?? -1) + 1) ~/
            achievement.achievement.levels.length +
        currentProgress ~/ achievement.achievement.levels.length;
  }
}
