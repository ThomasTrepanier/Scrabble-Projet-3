import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:mobile/classes/puzzle/puzzle-level.dart';
import 'package:mobile/components/app_button.dart';
import 'package:mobile/components/create-game/timer-selector.dart';
import 'package:mobile/components/error-pop-up.dart';
import 'package:mobile/components/app-toggle-button.dart';
import 'package:mobile/components/puzzle/puzzle-level-widget.dart';
import 'package:mobile/components/puzzle/puzzle-type-selector.dart';
import 'package:mobile/constants/home-page.constants.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/constants/locale/puzzle-constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/routes/routes.dart';
import 'package:mobile/services/game-messages.service.dart';
import 'package:mobile/services/puzzle-service.dart';

void showStartPuzzleDialog(BuildContext context) {
  showDialog<void>(
      context: context,
      barrierDismissible: true,
      builder: (BuildContext context) {
        ThemeData theme = Theme.of(context);

        return AlertDialog(
          insetPadding: EdgeInsets.symmetric(horizontal: 312, vertical: 64),
          title: Center(
            child: Text(PUZZLE_TITLE,
                style: theme.textTheme.displayMedium
                    ?.copyWith(fontWeight: FontWeight.w500)),
          ),
          content: SizedBox(
              width: MediaQuery.of(context).size.width,
              child: SingleChildScrollView(
                  child: Center(child: PuzzleTypeSelector()))),
          contentPadding:
              EdgeInsets.fromLTRB(32, 16, 32, 32,),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.all(Radius.circular(8.0)),
          ),
          surfaceTintColor: Colors.white,
          backgroundColor: Colors.white,
          actions: [
            ConstrainedBox(
              constraints: BoxConstraints.tightFor(width: 216, height: 60),
              child: AppButton(
                onPressed: () => Navigator.pop(context),
                theme: AppButtonTheme.secondary,
                child: Text(
                  CANCEL_BUTTON,
                  style:
                      TextStyle(fontSize: 24, overflow: TextOverflow.ellipsis),
                  textAlign: TextAlign.end,
                ),
              ),
            )
          ],
          actionsAlignment: MainAxisAlignment.end,
        );
      });
}
