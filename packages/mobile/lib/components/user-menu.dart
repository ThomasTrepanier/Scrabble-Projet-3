import 'package:flutter/material.dart';
import 'package:mobile/components/alert-dialog.dart';
import 'package:mobile/components/app-settings.dart';
import 'package:mobile/components/app_button.dart';
import 'package:mobile/controllers/account-authentification-controller.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/routes/routes.dart';
import 'package:mobile/services/user.service.dart';

void openUserMenu(BuildContext context, {bool canAccessMyProfile = true}) {
  List<Widget> widgets = [];

  if (canAccessMyProfile) {
    widgets.add(AppButton(
      onPressed: () {
        Navigator.pop(context);
        Navigator.pushNamed(context, PROFILE_ROUTE,
            arguments: getIt.get<UserService>().user.value);
      },
      text: "Mon profil",
      icon: Icons.person_2_rounded,
      width: 220,
    ));
  }

  widgets.add(AppButton(
    onPressed: () {
      Navigator.pop(context);
      openAppSettings();
    },
    text: "Paramètres",
    icon: Icons.settings,
    width: 220,
  ));

  widgets.add(AppButton(
    onPressed: () {
      Navigator.pop(context);
      getIt.get<AccountAuthenticationController>().signOut();
      Navigator.pushNamed(context, LOGIN_ROUTE);
    },
    text: "Déconnexion",
    icon: Icons.logout_rounded,
    width: 220,
  ));

  triggerDialogBox(
      "Menu",
      widgets,
      [
        DialogBoxButtonParameters(
            content: "Annuler",
            theme: AppButtonTheme.secondary,
            closesDialog: true)
      ],
      dismissOnBackgroundTouch: true);
}
