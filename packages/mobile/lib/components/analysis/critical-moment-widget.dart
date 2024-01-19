import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:mobile/classes/actions/action-data.dart';
import 'package:mobile/classes/actions/word-placement.dart';
import 'package:mobile/classes/analysis/action-shown.dart';
import 'package:mobile/classes/analysis/analysis-view.dart';
import 'package:mobile/classes/analysis/analysis.dart';
import 'package:mobile/classes/tile/tile.dart';
import 'package:mobile/components/analysis/analysis-tile-rack.dart';
import 'package:mobile/components/app-toggle-button.dart';
import 'package:mobile/components/game/game_board.dart';
import 'package:mobile/constants/carousel-constants.dart';
import 'package:mobile/constants/game.constants.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/constants/locale/analysis-constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/theme-color-service.dart';
import 'package:rxdart/rxdart.dart';

class CriticalMomentWidget extends StatefulWidget {
  CriticalMomentWidget({required this.criticalMoment});

  final CriticalMoment criticalMoment;

  @override
  State<CriticalMomentWidget> createState() => _CriticalMomentState();
}

class _CriticalMomentState extends State<CriticalMomentWidget> {
  final ThemeColorService _themeColorService = getIt.get<ThemeColorService>();
  late final CriticalMomentView _criticalMomentView;

  @override
  void initState() {
    super.initState();

    _criticalMomentView =
        CriticalMomentView.fromCriticalMoment(widget.criticalMoment);
  }

  @override
  Widget build(BuildContext context) {
    ThemeData theme = Theme.of(context);

    AppToggleButton<ActionShownValue, ActionShown> actionShownToggle =
        AppToggleButton<ActionShownValue, ActionShown>(
      defaultValue: ActionShown.played,
      optionsToValue: ACTION_SHOWN_OPTIONS_TO_VALUES,
      toggleOptionWidget: generateActionShownWidget,
      orientation: Axis.vertical,
    );

    return StreamBuilder<ActionShownValue>(
        stream: actionShownToggle.selectedStream,
        builder: (context, snapshot) {
          if (!snapshot.hasData) return SizedBox.shrink();

          bool shouldShowPlacement =
              snapshot.data!.getEnum() == ActionShown.best ||
                  _criticalMomentView.actionType == ActionType.place;

          return Row(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Expanded(
                child: Transform.translate(
                  offset: Offset(32, 0),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      actionShownToggle,
                      // Points
                      SizedBox(
                        height: SPACE_2,
                      ),
                      _getScore(context, snapshot.data!),
                    ],
                  ),
                ),
              ),
              shouldShowPlacement
                  ? _getPlacementAnalysis(
                      _computePlacementViewFromSelection(snapshot.data!))
                  : _getNonPlacementAnalysis(theme),
              Spacer(),
            ],
          );
        });
  }

  Widget _getPlacementAnalysis(PlacementView placement) {
    GameBoard gameBoard = placement.generateGameBoard();
    AnalysisTileRack tileRack = placement.generateTileRack();

    gameBoard.size = BOARD_SIZE;
    return Column(
      children: [
        SizedBox(width: BOARD_SIZE, height: BOARD_SIZE, child: gameBoard),
        SizedBox(height: 60, child: tileRack),
      ],
    );
  }

  Widget _getNonPlacementAnalysis(ThemeData theme) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(60),
        child: Text(
          _getNonPlacementText(),
          style: theme.textTheme.displaySmall!
              .copyWith(fontWeight: FontWeight.bold),
        ),
      ),
    );
  }

  Widget _getScore(BuildContext context, ActionShownValue selectedValue) {
    bool isGreenBackground = selectedValue.getEnum() == ActionShown.best;

    return Container(
        decoration: BoxDecoration(
            borderRadius: BorderRadius.all(Radius.circular(8.0)),
            color: isGreenBackground
                ? _themeColorService.themeDetails.value.color.colorValue
                : Colors.grey.shade500),
        padding: EdgeInsets.all(SPACE_1),
        child: Text(
          '${_computeScoreToShow(selectedValue)} pts',
          style: Theme.of(context)
              .textTheme
              .titleSmall!
              .copyWith(color: Colors.white),
        ));
  }

  int _computeScoreToShow(ActionShownValue selectedValue) {
    return selectedValue.getEnum() == ActionShown.played
        ? widget.criticalMoment.playedPlacement?.score ?? 0
        : widget.criticalMoment.bestPlacement.score;
  }

  PlacementView _computePlacementViewFromSelection(
      ActionShownValue selectedValue) {
    return selectedValue.getEnum() == ActionShown.played
        ? _criticalMomentView.playedPlacement
        : _criticalMomentView.bestPlacement;
  }

  String _getNonPlacementText() {
    return _criticalMomentView.actionType == ActionType.exchange
        ? CRITICAL_MOMENT_EXCHANGE
        : CRITICAL_MOMENT_PASS;
  }
}

Widget generateActionShownWidget(ActionShownValue actionShown) => Center(
        child: Padding(
      padding: const EdgeInsets.all(SPACE_2),
      child: Text(actionShown.name),
    ));
