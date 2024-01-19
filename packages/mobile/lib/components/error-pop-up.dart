import 'package:animated_snack_bar/animated_snack_bar.dart';
import 'package:flutter/material.dart';

void errorSnackBar(BuildContext context, String errorMessage) {
  AnimatedSnackBar.material(errorMessage,
          type: AnimatedSnackBarType.error,
          duration: Duration(seconds: 5),
          mobileSnackBarPosition: MobileSnackBarPosition.top,
          desktopSnackBarPosition: DesktopSnackBarPosition.topCenter)
      .show(context);
}

void successSnackBar(BuildContext context, String message) {
  AnimatedSnackBar.material(message,
          type: AnimatedSnackBarType.success,
          duration: Duration(seconds: 5),
          mobileSnackBarPosition: MobileSnackBarPosition.top,
          desktopSnackBarPosition: DesktopSnackBarPosition.topCenter)
      .show(context);
}
