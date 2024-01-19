import 'package:flutter/material.dart';
import 'package:mobile/classes/analysis/analysis-overview.dart';
import 'package:mobile/components/analysis/single-analysis-overview.dart';
import 'package:mobile/constants/analysis.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/constants/locale/analysis-constants.dart';

class AnalysisOverviewWidget extends StatefulWidget {
  AnalysisOverviewWidget({required this.overview});

  final AnalysisOverview overview;

  @override
  State<AnalysisOverviewWidget> createState() => _AnalysisOverviewWidgetState();
}

class _AnalysisOverviewWidgetState extends State<AnalysisOverviewWidget> {
  @override
  Widget build(BuildContext context) {
    ThemeData theme = Theme.of(context);

    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Transform.translate(
          offset: Offset(-32, 0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              SingleAnalysisOverview(
                title: CRITICAL_MOMENT_MINOR_MISTAKE_NAME,
                description: CRITICAL_MOMENT_MINOR_MISTAKE_DESCRIPTION,
                color: MINOR_MISTAKES_SPINNER_COLOR,
                value: widget.overview.minorMistakeCount.toDouble(),
                maximum: widget.overview.totalMistakes.toDouble(),
              ),
              SingleAnalysisOverview(
                title: CRITICAL_MOMENT_MEDIUM_MISTAKE_NAME,
                description: CRITICAL_MOMENT_MEDIUM_MISTAKE_DESCRIPTION,
                color: MEDIUM_MISTAKES_SPINNER_COLOR,
                value: widget.overview.mediumMistakeCount.toDouble(),
                maximum: widget.overview.totalMistakes.toDouble(),
              ),
              SingleAnalysisOverview(
                title: CRITICAL_MOMENT_MAJOR_MISTAKE_NAME,
                description: CRITICAL_MOMENT_MAJOR_MISTAKE_DESCRIPTION,
                color: MAJOR_MISTAKES_SPINNER_COLOR,
                value: widget.overview.majorMistakeCount.toDouble(),
                maximum: widget.overview.totalMistakes.toDouble(),
              )
            ],
          ),
        ),
        SizedBox(
          height: SPACE_4,
        ),
        Text(
          _resultMessage(),
          style: theme.textTheme.headlineMedium!
              .copyWith(fontWeight: FontWeight.w600),
        ),
        SizedBox(
          height: SPACE_2,
        ),
        Opacity(
            opacity: 0.6,
            child: Text(
              ANALYSIS_RESULT_MOVE_EXPLANATION,
              style: theme.textTheme.titleMedium,
            ))
      ],
    );
  }

  String _resultMessage() {
    if (widget.overview.majorMistakeCount > 0) {
      if (widget.overview.majorMistakeCount > 1) {
        return 'Multiples erreurs';
      }
      return 'Une erreur';
    } else if (widget.overview.mediumMistakeCount > 0) {
      if (widget.overview.mediumMistakeCount > 1) {
        return 'Multiples imprécisions';
      }
      return 'Une seule imprécision';
    } else if (widget.overview.minorMistakeCount > 0) {
      if (widget.overview.minorMistakeCount > 1) {
        return 'Multiples opportunités manquées';
      }
      return 'Une seule opportunité manquée';
    } else {
      return 'Incroyable! Une partie parfaite!';
    }
  }
}
