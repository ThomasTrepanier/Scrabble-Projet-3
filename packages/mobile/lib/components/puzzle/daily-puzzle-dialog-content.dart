import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:mobile/classes/puzzle/daily-puzzle.dart';
import 'package:mobile/components/LoadingDots.dart';
import 'package:mobile/components/user-avatar.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/constants/locale/puzzle-constants.dart';
import 'package:mobile/constants/puzzle-constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/routes/routes.dart';
import 'package:mobile/services/puzzle-service.dart';
import 'package:mobile/services/theme-color-service.dart';
import 'package:mobile/services/user.service.dart';

class DailyPuzzleDialogContent extends StatefulWidget {
  @override
  State<DailyPuzzleDialogContent> createState() =>
      _DailyPuzzleDialogContentState();
}

class _DailyPuzzleDialogContentState extends State<DailyPuzzleDialogContent> {
  final PuzzleService _puzzleService = getIt.get<PuzzleService>();
  final ThemeColorService _themeColorService = getIt.get<ThemeColorService>();
  final UserService _userService = getIt.get<UserService>();

  @override
  Widget build(BuildContext context) {
    ThemeData theme = Theme.of(context);

    return FutureBuilder<DailyPuzzleLeaderboard>(
      future: _puzzleService.getDailyPuzzleLeaderboard(),
      builder: (context, snapshot) {
        DailyPuzzleLeaderboard? leaderboard = snapshot.data;

        return Column(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              height: 36,
              child: Center(
                child: Text('Classement du puzzle quotidien',
                    style: theme.textTheme.titleLarge!
                        .copyWith(fontWeight: FontWeight.w500)),
              ),
            ),
            Container(
              height: 24,
              child: Center(
                child: Opacity(
                    opacity: 0.64,
                    child: Text(
                      DateFormat.yMMMMd('fr_FR').format(DateTime.now()),
                      style: theme.textTheme.titleMedium,
                    )),
              ),
            ),
            Expanded(flex: 1, child: leaderboard != null && leaderboard.leaderboard.isNotEmpty
                ? SingleChildScrollView(
              child: Column(children: List.generate(
                  leaderboard.leaderboard.length,
                      (index) =>
                      _dailyLeaderboardEntry(
                          index, leaderboard.leaderboard[index]))),
            )
                : Opacity(
              opacity: 0.64,
              child: Center(
                child: Text(
                  "Personne n'a encore joué au puzzle aujourd'hui. \n Soyez le premier!",
                  textAlign: TextAlign.center,
                  style: theme.textTheme.titleMedium!
                      .copyWith(fontWeight: FontWeight.w500),
                ),
              ),
            ),),
            Container(
                decoration: BoxDecoration(
                    borderRadius: BorderRadius.all(Radius.circular(8.0)),
                    color: theme.colorScheme.tertiary),
                padding: EdgeInsets.all(SPACE_1),
                height: 32,
                child: leaderboard != null ? Text(
                   _buildMessage(leaderboard),
                  textAlign: TextAlign.center,
                ) : Center(child: LoadingDots(style: theme.textTheme.bodyLarge!, delay: Duration(milliseconds: 250),)))
          ],
        );

      }
    );
  }

  String _buildMessage(DailyPuzzleLeaderboard leaderboard) {
    if (leaderboard.userScore == DAILY_PUZZLE_NOT_COMPLETED) {
      return DAILY_PUZZLE_MESSAGE_NOT_COMPLETED_MESSAGE;
    }
    if (leaderboard.userScore <= 0) {
      return DAILY_PUZZLE_MESSAGE_NOT_WON;
    }
    if (leaderboard.userScore > 0 && leaderboard.userRank == 1) {
      return DAILY_PUZZLE_MESSAGE_FIRST;
    }
    if (leaderboard.userScore > 0 &&
        leaderboard.userRank <= DAILY_PUZZLE_LEADERBOARD_COUNT) {
      return DAILY_PUZZLE_MESSAGE_IN_LEADERBOARD;
    } else {
      return DAILY_PUZZLE_MESSAGE_NOT_IN_LEADERBOARD(
          leaderboard.userRank, leaderboard.totalPlayers);
    }
  }

  Widget _dailyLeaderboardEntry(int index, DailyPuzzleResult entryResult) {
    ThemeData theme = Theme.of(context);

    return InkWell(
      onTap: () {
        _userService.getProfileByUsername(
            entryResult.username);
        Navigator.pushNamed(
            context, PROFILE_ROUTE,
            arguments:
            entryResult);
      },
      child: Card(
        child: Row(
          children: [
            Container(
              decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: _themeColorService.themeDetails.value.color.colorValue),
              margin: EdgeInsets.only(left: SPACE_2),
              width: 36,
              height: 36,
              child: Center(
                child: Text('${index + 1}',
                    style: theme.textTheme.titleSmall!.copyWith(
                        color: Colors.white, fontWeight: FontWeight.w600)),
              ),
            ),
            SizedBox(width: SPACE_2,),
            Padding(
              padding: const EdgeInsets.all(SPACE_2),
              child: Avatar(
                avatar: entryResult.avatar,
                size: 42,
              ),
            ),
            SizedBox(width: SPACE_2,),
            Text(entryResult.username, overflow: TextOverflow.ellipsis,),
            Spacer(),
            Container(
                decoration: BoxDecoration(
                    borderRadius: BorderRadius.all(Radius.circular(8.0)),
                    color: theme.colorScheme.tertiary),
                padding: EdgeInsets.all(SPACE_1),
                margin: EdgeInsets.only(right: SPACE_2),
                child: Text(
                  '${entryResult.score} pts',
                  style: Theme.of(context)
                      .textTheme
                      .titleSmall!
                      .copyWith(fontWeight: FontWeight.w600),
                )),
          ],
        ),
      ),
    );
  }
}
