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

class PuzzleSolution extends StatefulWidget {
  PuzzleSolution({required this.solutionName, required this.placementToShow});

  final String solutionName;
  final PlacementView placementToShow;

  @override
  State<PuzzleSolution> createState() => _PuzzleSolutionState();
}

class _PuzzleSolutionState extends State<PuzzleSolution> {
  final ThemeColorService _themeColorService = getIt.get<ThemeColorService>();

  @override
  Widget build(BuildContext context) {
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
                SizedBox(
                  height: SPACE_2,
                ),
                _getScore(context),
              ],
            ),
          ),
        ),
        Column(children: [
          Opacity(
            opacity: 0.64,
            child: Text(widget.solutionName,
                style: Theme.of(context).textTheme.headlineSmall!.copyWith(fontWeight: FontWeight.w500)),
          ),
          _getPlacementAnalysis(widget.placementToShow)
        ]),
        Spacer(),
      ],
    );
  }

  Widget _getPlacementAnalysis(PlacementView placement) {
    GameBoard gameBoard = placement.generateGameBoard();

    gameBoard.size = BOARD_SIZE;
    return Column(
      children: [
        SizedBox(width: BOARD_SIZE, height: BOARD_SIZE, child: gameBoard),
      ],
    );
  }

  Widget _getScore(BuildContext context) {
    return Container(
        decoration: BoxDecoration(
            borderRadius: BorderRadius.all(Radius.circular(8.0)),
            color: _themeColorService.themeDetails.value.color.colorValue),
        padding: EdgeInsets.all(SPACE_1),
        child: Text(
          '${widget.placementToShow.placement?.score ?? 0} pts',
          style: Theme.of(context)
              .textTheme
              .titleSmall!
              .copyWith(color: Colors.white),
        ));
  }
}
