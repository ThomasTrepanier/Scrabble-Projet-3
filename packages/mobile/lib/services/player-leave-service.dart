import 'package:flutter/material.dart';
import 'package:mobile/controllers/game-play.controller.dart';

import '../components/alert-dialog.dart';
import '../components/app_button.dart';
import '../constants/locale/game-constants.dart';
import '../locator.dart';
import '../routes/routes.dart';

class PlayerLeaveService {
  GamePlayController gameplayController = getIt.get<GamePlayController>();

  PlayerLeaveService._privateConstructor();

  static final PlayerLeaveService _instance =
      PlayerLeaveService._privateConstructor();

  factory PlayerLeaveService() {
    return _instance;
  }

  Future<void> abandonGame(BuildContext context) async {
    triggerDialogBox(DIALOG_SURRENDER_TITLE, [Text(DIALOG_SURRENDER_CONTENT, style: TextStyle(fontSize: 16))], [
      DialogBoxButtonParameters(
          content: DIALOG_ABANDON_BUTTON_CONFIRM,
          theme: AppButtonTheme.tomato,
          onPressed: () async {
            await getIt.get<GamePlayController>().leaveGame();

            if (!context.mounted) return;
            Navigator.popUntil(context, ModalRoute.withName(HOME_ROUTE));
          }),
      DialogBoxButtonParameters(
          content: DIALOG_ABANDON_BUTTON_CONTINUE,
          theme: AppButtonTheme.secondary,
          closesDialog: true)
    ]);
  }

  Future<void> leaveGame(BuildContext context) async {
    triggerDialogBox(DIALOG_LEAVE_BUTTON_CONTINUE, [Text(DIALOG_SURRENDER_CONTENT, style: TextStyle(fontSize: 16))], [
      DialogBoxButtonParameters(
          content: DIALOG_LEAVE_BUTTON_CONTINUE,
          theme: AppButtonTheme.tomato,
          onPressed: () async {
            await getIt.get<GamePlayController>().leaveGame();

            if (!context.mounted) return;
            Navigator.popUntil(context, ModalRoute.withName(HOME_ROUTE));
          }),
      DialogBoxButtonParameters(
          content: DIALOG_STAY_BUTTON_CONTINUE,
          theme: AppButtonTheme.secondary,
          closesDialog: true)
    ]);
  }
}
