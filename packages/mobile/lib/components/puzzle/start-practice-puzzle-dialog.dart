import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:mobile/classes/puzzle/puzzle-level.dart';
import 'package:mobile/components/app_button.dart';
import 'package:mobile/components/create-game/timer-selector.dart';
import 'package:mobile/components/error-pop-up.dart';
import 'package:mobile/components/app-toggle-button.dart';
import 'package:mobile/components/puzzle/puzzle-level-widget.dart';
import 'package:mobile/components/puzzle/start-puzzle-dialog.dart';
import 'package:mobile/constants/home-page.constants.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/constants/locale/puzzle-constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/routes/routes.dart';
import 'package:mobile/services/game-messages.service.dart';
import 'package:mobile/services/puzzle-service.dart';

void showStartPracticePuzzleDialog(BuildContext context) {
  PuzzleService _puzzleService = getIt.get<PuzzleService>();

  showDialog<void>(
      context: context,
      barrierDismissible: true,
      builder: (BuildContext context) {
        ThemeData theme = Theme.of(context);
        final AppToggleButton<PuzzleLevel, PuzzleLevelName>
            puzzleLevelSelector = AppToggleButton<PuzzleLevel, PuzzleLevelName>(
                defaultValue: PuzzleLevelName.advanced,
                optionsToValue: PUZZLE_LEVELS,
                toggleOptionWidget: generatePuzzleLevelWidget);

        return AlertDialog(
          title: Center(
            child: Text(START_PRACTICE_TITLE,
                style: theme.textTheme.displayMedium
                    ?.copyWith(fontWeight: FontWeight.w500)),
          ),
          content:
              SingleChildScrollView(child: Center(child: puzzleLevelSelector)),
          contentPadding:
              EdgeInsets.symmetric(vertical: 48.0, horizontal: 32.0),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.all(Radius.circular(8.0)),
          ),
          surfaceTintColor: Colors.white,
          backgroundColor: Colors.white,
          actions: [
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              mainAxisSize: MainAxisSize.min,
              children: [
                ConstrainedBox(
                  constraints: BoxConstraints.tightFor(width: 216, height: 60),
                  child: AppButton(
                    onPressed: () {
                      Navigator.pop(context);
                      showStartPuzzleDialog(context);
                    },
                    theme: AppButtonTheme.secondary,
                    child: Text(
                      BACK_BUTTON,
                      style: TextStyle(
                          fontSize: 24, overflow: TextOverflow.ellipsis),
                      textAlign: TextAlign.end,
                    ),
                  ),
                ),
                SizedBox(
                  width: SPACE_3 * 4,
                ),
                ConstrainedBox(
                  constraints: BoxConstraints.tightFor(width: 216, height: 60),
                  child: AppButton(
                    onPressed: () {
                      _puzzleService.clearPuzzle();

                      _puzzleService
                          .startPuzzle(puzzleLevelSelector.selectedValue ??
                              advancedPuzzleLevel)
                          .then((bool isSuccess) {
                        Navigator.pop(context);
                        if (isSuccess) {
                          getIt.get<GameMessagesService>().resetMessages();
                          Navigator.pushReplacementNamed(context, PUZZLE_ROUTE);
                        } else {
                          errorSnackBar(context, START_ERROR);
                        }
                      });
                    },
                    theme: AppButtonTheme.primary,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Text(START_BUTTON,
                            style: TextStyle(
                                fontSize: 24,
                                color: Colors.white,
                                overflow: TextOverflow.ellipsis),
                            textAlign: TextAlign.end),
                        Icon(
                          Icons.play_arrow_rounded,
                          color: Colors.white,
                          size: 48,
                        )
                      ],
                    ),
                  ),
                ),
              ],
            )
          ],
          actionsAlignment: MainAxisAlignment.spaceEvenly,
        );
      });
}
