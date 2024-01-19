import 'package:flutter/material.dart';
import 'package:mobile/classes/analysis/analysis-overview.dart';
import 'package:mobile/classes/analysis/analysis.dart';
import 'package:mobile/components/analysis/analysis-overview-widget.dart';
import 'package:mobile/components/analysis/critical-moment-widget.dart';
import 'package:mobile/components/app_button.dart';
import 'package:mobile/components/carousel/full-screen-carousel-dialog.dart';
import 'package:mobile/constants/locale/analysis-constants.dart';

class AnalysisResultDialog {
  final List<CriticalMoment> criticalMoments;
  final List<CriticalMomentWidget> _criticalMomentWidgets;

  AnalysisResultDialog({required this.criticalMoments})
      : _criticalMomentWidgets = criticalMoments
            .map((CriticalMoment c) => CriticalMomentWidget(criticalMoment: c))
            .toList();

  void openAnalysisResultDialog(BuildContext context) {
    FullScreenCarouselDialog(title: ANALYSIS_RESULT_TITLE, actionButtons: [
      AppButton(
        onPressed: () => _closeDialog(context),
        text: CLOSE_ANALYSIS_RESULT,
        theme: AppButtonTheme.secondary,
        size: AppButtonSize.normal,
      )
    ], slides: [
      AnalysisOverviewWidget(
          overview: AnalysisOverview.fromCriticalMoments(criticalMoments)),
      ..._criticalMomentWidgets
    ]).openDialog(context);
  }

  void _closeDialog(BuildContext context) {
    Navigator.pop(context);
  }
}
