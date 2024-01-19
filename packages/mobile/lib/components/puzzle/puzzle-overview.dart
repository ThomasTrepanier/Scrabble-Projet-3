import 'package:flutter/material.dart';
import 'package:mobile/classes/analysis/analysis-overview.dart';
import 'package:mobile/classes/puzzle/puzzle-overview.dart';
import 'package:mobile/components/analysis/single-analysis-overview.dart';
import 'package:mobile/constants/analysis.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/constants/locale/analysis-constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/theme-color-service.dart';

class PuzzleOverviewWidget extends StatefulWidget {
  PuzzleOverviewWidget({required this.overview});

  final PuzzleOverview overview;

  @override
  State<PuzzleOverviewWidget> createState() => _PuzzleOverviewWidgetState();
}

class _PuzzleOverviewWidgetState extends State<PuzzleOverviewWidget> {
  final ThemeColorService _themeColorService = getIt.get<ThemeColorService>();

  @override
  Widget build(BuildContext context) {
    ThemeData theme = Theme.of(context);

    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            SingleAnalysisOverview(
              color: _themeColorService.themeDetails.value.color.colorValue,
              value: widget.overview.scoredPoints.toDouble(),
              maximum: widget.overview.maxPoints.toDouble(),
            ),
          ],
        ),
        SizedBox(height: SPACE_4,),
        Text(
          widget.overview.message,
          style: theme.textTheme.headlineMedium!
              .copyWith(fontWeight: FontWeight.w600),
        ),
        SizedBox(height: SPACE_2,),
        Opacity(
            opacity: 0.6,
            child: Text(
              ANALYSIS_RESULT_MOVE_EXPLANATION,
              style: theme.textTheme.titleMedium,
            ))
      ],
    );
  }
}
