import 'package:flutter/material.dart';
import 'package:mobile/components/app_button.dart';
import 'package:mobile/constants/layout.constants.dart';

import '../routes/navigator-key.dart';

class DialogBoxButtonParameters {
  final String content;
  final AppButtonTheme theme;
  final Function()? onPressed;
  final bool? closesDialog;
  final IconData? icon;

  DialogBoxButtonParameters(
      {required this.content,
      required this.theme,
      this.onPressed,
      this.closesDialog,
      this.icon});
}

void triggerDialogBox(
    String title, List<Widget> widgets, List<DialogBoxButtonParameters> buttons,
    {bool dismissOnBackgroundTouch = false}) {
  showDialog<void>(
    context: navigatorKey.currentContext!,
    barrierDismissible: dismissOnBackgroundTouch,
    builder: (BuildContext context) {
      return AlertDialog(
          actionsPadding:
              EdgeInsets.symmetric(horizontal: SPACE_4, vertical: SPACE_2),
          title: Center(child: Text(title)),
          surfaceTintColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          content: SingleChildScrollView(
            child: ListBody(
              children: widgets
                  .map((Widget widget) => Center(child: widget))
                  .toList(),
            ),
          ),
          actions: [
            Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: buttons.asMap().entries.map(
                  (entry) {
                    int index = entry.key;
                    DialogBoxButtonParameters button = entry.value;
                    return Row(
                      children: [
                        AppButton(
                          onPressed: button.onPressed ??
                              (button.closesDialog != null &&
                                      button.closesDialog!
                                  ? () => Navigator.pop(context)
                                  : null),
                          theme: button.theme,
                          text: button.content,
                          icon: button.icon,
                        ),
                        index < buttons.length - 1
                            ? SizedBox(
                                width: 16,
                              )
                            : SizedBox.shrink(),
                      ],
                    );
                  },
                ).toList())
          ]);
    },
  );
}
