import 'dart:async';

import 'package:flutter/cupertino.dart';
import 'package:mobile/classes/analysis/analysis-request.dart';
import 'package:mobile/classes/analysis/analysis.dart';
import 'package:mobile/components/analysis/analysis-request-dialog.dart';
import 'package:mobile/components/analysis/analysis-result-dialog.dart';
import 'package:mobile/constants/locale/analysis-constants.dart';
import 'package:mobile/controllers/analysis-controller.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/routes/navigator-key.dart';

class AnalysisService {
  final AnalysisController _analysisController =
      getIt.get<AnalysisController>();

  AnalysisService._privateConstructor();

  Future<AnalysisCompleted?> requestAnalysis(
      int idAnalysis, AnalysisRequestInfoType requestType) async {
    return _analysisController
        .requestAnalysis(idAnalysis, requestType)
        .then<AnalysisCompleted?>((AnalysisCompleted analysisCompleted) {
      Navigator.pop(navigatorKey.currentContext!);

      AnalysisResultDialog(criticalMoments: analysisCompleted.criticalMoments)
          .openAnalysisResultDialog(navigatorKey.currentContext!);

      return analysisCompleted;
    }, onError: (_) {
          print(_);
      Navigator.pop(navigatorKey.currentContext!);

      AnalysisRequestDialog(
          title: ANALYSIS_NOT_FOUND_TITLE,
          message: ANALYSIS_NOT_FOUND_MESSAGE,
          isLoading: false)
          .openAnalysisRequestDialog(navigatorKey.currentContext!);

      return null;
    });
  }

  static final AnalysisService _instance =
      AnalysisService._privateConstructor();

  factory AnalysisService() {
    return _instance;
  }
}
