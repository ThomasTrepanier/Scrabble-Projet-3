import 'package:flutter/material.dart';
import 'package:mobile/components/app_button.dart';
import 'package:mobile/components/puzzle/start-daily-puzzle-dialog.dart';
import 'package:mobile/components/puzzle/start-practice-puzzle-dialog.dart';
import 'package:mobile/constants/layout.constants.dart';

class PuzzleTypeSelector extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    ThemeData theme = Theme.of(context);

    const double buttonSize = 196;
    return Column(
      children: [
        Opacity(opacity: 0.64, child: Text('À quel mode voulez-vous jouer?', style: theme.textTheme.titleLarge,)),
        SizedBox(height: SPACE_4,),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            ConstrainedBox(
              constraints: BoxConstraints(minWidth: buttonSize, minHeight: buttonSize, maxWidth: buttonSize, maxHeight: buttonSize),
              child: AppButton(onPressed: () {
                Navigator.pop(context);
                showStartDailyPuzzleDialog(context);
              }, theme: AppButtonTheme.primary, size: AppButtonSize.extraLarge, child: Column(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Icon(Icons.calendar_today, size: 96, color: Colors.white,),
                  Text('Puzzle Quotidien', style: theme.textTheme.titleMedium!.copyWith(color: Colors.white),)
                ],
              ),),
            ),
            ConstrainedBox(
              constraints: BoxConstraints(minWidth: buttonSize, minHeight: buttonSize, maxWidth: buttonSize, maxHeight: buttonSize),
              child: AppButton(onPressed: () {
                Navigator.pop(context);
                showStartPracticePuzzleDialog(context);
              }, theme: AppButtonTheme.primary, size: AppButtonSize.extraLarge, child: Column(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Icon(Icons.sports_esports, size: 96, color: Colors.white),
                  Text('Puzzle de pratique', style: theme.textTheme.titleMedium!.copyWith(color: Colors.white),)
                ],
              ),),
            )
          ],
        ),
      ],
    );
  }

}
