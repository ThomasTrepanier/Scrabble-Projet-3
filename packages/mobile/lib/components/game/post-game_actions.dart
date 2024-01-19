import 'package:flutter/material.dart';
import 'package:mobile/classes/analysis/analysis-request.dart';
import 'package:mobile/classes/analysis/analysis.dart';
import 'package:mobile/components/analysis/analysis-request-dialog.dart';
import 'package:mobile/components/analysis/analysis-result-dialog.dart';
import 'package:mobile/components/app_button.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/constants/locale/analysis-constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/analysis-service.dart';
import 'package:mobile/services/game.service.dart';
import 'package:mobile/services/player-leave-service.dart';
import 'package:mobile/services/user.service.dart';

class PostGameActions extends StatelessWidget {
  final UserService _userService = getIt.get<UserService>();
  final GameService _gameService = getIt.get<GameService>();
  AnalysisCompleted? analysis;

  void leave(BuildContext context) {
    getIt.get<PlayerLeaveService>().leaveGame(context);
  }

  void requestAnalysis(BuildContext context) async {
    if (analysis != null) {
      AnalysisResultDialog(criticalMoments: analysis!.criticalMoments)
          .openAnalysisResultDialog(context);
      return;
    }

    int idAnalysis = _gameService.game.idGameHistory ?? -1;
    analysis = await AnalysisRequestDialog(
            title: ANALYSIS_REQUEST_TITLE,
            message: ANALYSIS_REQUEST_COMPUTING,
            idAnalysis: idAnalysis,
            requestType: AnalysisRequestInfoType.idGame)
        .openAnalysisRequestDialog(context);
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Container(
          height: 70,
          padding: EdgeInsets.symmetric(vertical: SPACE_2, horizontal: SPACE_3),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              ..._userService.isObserver
                  ? _observerButtons(context)
                  : _playerButtons(context),
            ],
          )),
    );
  }

  List<Widget> _playerButtons(BuildContext context) {
    return [
      Expanded(
        flex: 5,
        child: AppButton(
          onPressed: () => leave(context),
          icon: Icons.output_outlined,
          text: 'Quitter',
          size: AppButtonSize.large,
          theme: AppButtonTheme.danger,
        ),
      ),
      Spacer(
        flex: 1,
      ),
      Expanded(
        flex: 5,
        child: AppButton(
          onPressed: () => requestAnalysis(context),
          icon: Icons.science,
          text: 'Analyse',
          size: AppButtonSize.large,
          theme: AppButtonTheme.primary,
        ),
      ),
    ];
  }

  List<Widget> _observerButtons(BuildContext context) {
    return [
      Spacer(flex: 3),
      Expanded(
        flex: 5,
        child: AppButton(
          onPressed: () => leave(context),
          icon: Icons.output_outlined,
          text: 'Quitter',
          size: AppButtonSize.large,
          theme: AppButtonTheme.danger,
        ),
      ),
      Spacer(flex: 3),
    ];
  }
}
