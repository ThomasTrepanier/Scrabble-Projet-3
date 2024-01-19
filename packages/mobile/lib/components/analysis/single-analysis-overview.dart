import 'package:flutter/material.dart';
import 'package:mobile/components/alert-dialog.dart';
import 'package:mobile/components/app-circular-spinner.dart';
import 'package:mobile/components/app_button.dart';
import 'package:mobile/constants/layout.constants.dart';

class SingleAnalysisOverview extends StatefulWidget {
  SingleAnalysisOverview(
      {this.title,
      this.description,
      required this.value,
      required this.maximum,
      required this.color});

  final String? title;
  final String? description;
  final double value;
  final double maximum;
  final Color color;

  @override
  State<SingleAnalysisOverview> createState() => _SingleAnalysisOverviewState();
}

class _SingleAnalysisOverviewState extends State<SingleAnalysisOverview> {
  @override
  Widget build(BuildContext context) {
    ThemeData theme = Theme.of(context);

    return Column(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        widget.title != null
            ? Row(
                children: [
                  Text(
                    widget.title!,
                    style: theme.textTheme.titleMedium!
                        .copyWith(fontWeight: FontWeight.w600),
                  ),
                  SizedBox(
                    width: SPACE_2,
                  ),
                  InkWell(
                    onTap: () => triggerDialogBox(
                        widget.title ?? "",
                        [Text(widget.description ?? "")],
                        [
                          DialogBoxButtonParameters(
                              content: "Ok",
                              theme: AppButtonTheme.primary,
                              closesDialog: true)
                        ],
                        dismissOnBackgroundTouch: true),
                    child: Icon(
                      Icons.help_outline,
                      color: theme.primaryColor,
                    ),
                  )
                ],
              )
            : SizedBox.shrink(),
        SizedBox(
          height: SPACE_4,
        ),
        Stack(
          children: [
            AppCircularSpinner(
              isLoading: false,
              color: widget.color,
              value: widget.value,
              maximumValue: widget.maximum,
              size: AppCircularSpinnerSize.large,
              strokeWidth: 18.0,
            ),
            Positioned.fill(
              child: Align(
                alignment: Alignment.center,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(widget.value.toInt().toString(),
                        style: theme.textTheme.displayMedium!
                            .copyWith(fontWeight: FontWeight.bold)),
                    Opacity(
                      opacity: 0.6,
                      child: Text('/ ${widget.maximum.toInt().toString()}',
                          style: theme.textTheme.titleLarge!
                              .copyWith(fontWeight: FontWeight.w600)),
                    )
                  ],
                ),
              ),
            ),
          ],
        )
      ],
    );
  }
}
