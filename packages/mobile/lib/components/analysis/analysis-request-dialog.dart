import 'package:flutter/material.dart';
import 'package:mobile/classes/analysis/analysis-request.dart';
import 'package:mobile/classes/analysis/analysis.dart';
import 'package:mobile/components/LoadingDots.dart';
import 'package:mobile/components/app-circular-spinner.dart';
import 'package:mobile/components/app_button.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/constants/locale/analysis-constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/analysis-service.dart';
import 'package:mobile/services/theme-color-service.dart';

class AnalysisRequestDialog {
  final String title;
  String message;
  final bool isLoading;
  final int? idAnalysis;
  final AnalysisRequestInfoType? requestType;

  AnalysisRequestDialog(
      {required this.title,
      required this.message,
      this.isLoading = true,
      this.idAnalysis,
      this.requestType});

  Future<AnalysisCompleted?> openAnalysisRequestDialog(
      BuildContext context) async {
    _openDialog(context);

    if (idAnalysis == null || requestType == null) return null;

    await Future.delayed(Duration(milliseconds: 500));

    return await getIt
        .get<AnalysisService>()
        .requestAnalysis(idAnalysis!, requestType!);
  }

  void _openDialog(BuildContext context) {
    ThemeColorService themeColorService = getIt.get<ThemeColorService>();
    ThemeData theme = Theme.of(context);

    showDialog(
        context: context,
        barrierDismissible: true,
        builder: (BuildContext context) {
          return AlertDialog(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.all(Radius.circular(8.0)),
            ),
            insetPadding: EdgeInsets.symmetric(vertical: 196, horizontal: 344),
            title: Center(
              child: Text(
                title,
                style: theme.textTheme.headlineMedium
                    ?.copyWith(fontWeight: FontWeight.w500),
              ),
            ),
            titlePadding: EdgeInsets.symmetric(
                horizontal: SPACE_4 * 4, vertical: SPACE_4),
            content: SingleChildScrollView(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  isLoading
                      ? AppCircularSpinner(
                          isLoading: true,
                          color: themeColorService
                              .themeDetails.value.color.colorValue,
                          size: AppCircularSpinnerSize.medium,
                        )
                      : Icon(
                          Icons.error,
                          color: theme.colorScheme.error,
                          size: 96,
                        ),
                  SizedBox(
                    height: SPACE_4,
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Text(
                        message,
                        style: theme.textTheme.titleMedium,
                      ),
                      LoadingDots(
                        style: theme.textTheme.titleMedium!,
                        isPlaying: isLoading,
                      ),
                    ],
                  )
                ],
              ),
            ),
            actions: [
              AppButton(
                onPressed: () => _cancelAnalysisRequest(context),
                text: isLoading
                    ? CANCEL_ANALYSIS_REQUEST
                    : CLOSE_ANALYSIS_REQUEST,
                theme: AppButtonTheme.secondary,
                size: AppButtonSize.normal,
              )
            ],
            surfaceTintColor: Colors.white,
            backgroundColor: Colors.white,
          );
        });
  }

  void _cancelAnalysisRequest(BuildContext context) {
    Navigator.pop(context);
  }
}
