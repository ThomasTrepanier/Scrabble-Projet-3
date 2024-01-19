import 'dart:async';

import 'package:flutter/material.dart';
import 'package:mobile/classes/user.dart';
import 'package:mobile/components/app_button.dart';
import 'package:mobile/components/user-avatar.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/controllers/account-authentification-controller.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/routes/routes.dart';
import 'package:mobile/services/notification.service.dart';
import 'package:rxdart/rxdart.dart';

import '../error-pop-up.dart';

const ENABLE_SUCCESS = 'Les notifications de rappel ont été activées!';
const DISABLE_SUCCESS = 'Les notifications de rappel ont été désactivées!';
const NOTIFICATION_ERROR = 'Une erreur est survenue!';

class UserProfileInfo extends StatefulWidget {
  UserProfileInfo({required this.user, this.isLocalUser = false});

  PublicUser user;
  final bool isLocalUser;

  @override
  State<UserProfileInfo> createState() => _UserProfileInfoState();
}

class _UserProfileInfoState extends State<UserProfileInfo> {
  final AccountAuthenticationController _authService =
      getIt.get<AccountAuthenticationController>();
  final NotificationService notificationService =
      getIt.get<NotificationService>();
  late StreamSubscription notificationsToggleSubscription;
  late StreamSubscription notificationsErrorSubscription;

  @override
  void initState() {
    super.initState();
    notificationsErrorSubscription = notificationService.notificationErrorStream
        .whereNotNull()
        .listen((error) {
      errorSnackBar(context, NOTIFICATION_ERROR);
    });
    notificationsToggleSubscription = notificationService
        .isNotificationEnabled.stream
        .skip(1)
        .listen((bool isEnabled) => successSnackBar(
            context, isEnabled ? ENABLE_SUCCESS : DISABLE_SUCCESS));
  }

  @override
  void dispose() {
    super.dispose();
    notificationsErrorSubscription.cancel();
    notificationsToggleSubscription.cancel();
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: EdgeInsets.all(SPACE_3),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Wrap(
              spacing: SPACE_4,
              crossAxisAlignment: WrapCrossAlignment.center,
              children: [
                Avatar(size: 150, avatar: widget.user.avatar),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.user.username,
                      style:
                          TextStyle(fontSize: 48, fontWeight: FontWeight.w600),
                    ),
                    Text(
                      widget.user.email,
                      style: TextStyle(
                          fontSize: 32,
                          fontWeight: FontWeight.w500,
                          color: Colors.grey.shade500),
                    ),
                  ],
                )
              ],
            ),
            widget.isLocalUser
                ? Column(children: [
                    AppButton(
                      onPressed: () =>
                          Navigator.pushNamed(context, PROFILE_EDIT_ROUTE),
                      icon: Icons.manage_accounts_rounded,
                    ),
                    StreamBuilder<bool>(
                        stream: getIt
                            .get<NotificationService>()
                            .isNotificationEnabled,
                        builder: (context, snapshot) {
                          bool isEnabled = snapshot.data ?? true;
                          return AppButton(
                            onPressed: () =>
                                notificationService.toggleNotifications(),
                            icon: isEnabled
                                ? Icons.notifications
                                : Icons.notifications_off_rounded,
                          );
                        }),
                  ])
                : Container(),
          ],
        ),
      ),
    );
  }
}
