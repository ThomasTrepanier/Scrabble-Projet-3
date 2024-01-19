import 'dart:async';

import 'package:flutter/material.dart';
import 'package:mobile/classes/user.dart';
import 'package:mobile/components/alert-dialog.dart';
import 'package:mobile/components/app_button.dart';
import 'package:mobile/components/group/individual-group.dart';
import 'package:mobile/components/group/parameters.dart';
import 'package:mobile/components/scaffold-persistance.dart';
import 'package:mobile/routes/routes.dart';
import 'package:mobile/services/group-join.service.dart';
import 'package:mobile/view-methods/group.methods.dart';

import '../classes/group.dart';
import '../constants/locale/group-selection-constants.dart';
import '../locator.dart';

class GroupRequestWaitingPage extends StatefulWidget {
  const GroupRequestWaitingPage({super.key, required this.group});

  final Group group;

  @override
  State<GroupRequestWaitingPage> createState() =>
      _GroupRequestWaitingPageState();
}

class _GroupRequestWaitingPageState extends State<GroupRequestWaitingPage> {
  late StreamSubscription acceptedSubscription;
  late StreamSubscription rejectedSubscription;
  late StreamSubscription canceledSubscription;

  @override
  void initState() {
    super.initState();

    acceptedSubscription = currentGroupUpdateStream.listen((Group group) {
      Navigator.pushReplacementNamed(context, JOIN_LOBBY_ROUTE,
          arguments: group);
    });

    rejectedSubscription = rejectedStream.listen((PublicUser host) {
      Navigator.popUntil(context, ModalRoute.withName(GROUPS_ROUTE));
      Navigator.pushReplacementNamed(context, GROUPS_ROUTE);
      triggerDialogBox("Demande rejetée", [
        Text("${host.username} a rejeté votre demande",
            style: TextStyle(fontSize: 16))
      ], [
        DialogBoxButtonParameters(
            content: 'OK', theme: AppButtonTheme.primary, closesDialog: true)
      ]);
    });

    canceledSubscription = canceledStream.listen((PublicUser host) {
      handleCanceledGame(host, context);
    });
  }

  @override
  void dispose() {
    super.dispose();
    acceptedSubscription.cancel();
    rejectedSubscription.cancel();
    canceledSubscription.cancel();
  }

  @override
  Widget build(BuildContext context) {
    var theme = Theme.of(context);

    return WillPopScope(
      child: MyScaffold(
        title: JOIN_GAME,
        body: Center(
          child: Card(
            surfaceTintColor: Colors.white,
            color: Colors.white,
            borderOnForeground: true,
            child: ConstrainedBox(
              constraints: BoxConstraints(
                  minWidth: 400, minHeight: 400, maxWidth: 500, maxHeight: 400),
              child: Padding(
                padding: const EdgeInsets.fromLTRB(0, 32, 0, 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  mainAxisSize: MainAxisSize.max,
                  children: [
                    Text("En attente de la réponse de l'hôte",
                        style: theme.textTheme.titleLarge),
                    Spacer(),
                    PlayerInGroup(user: widget.group.users[0]),
                    Spacer(),
                    Parameters(
                      maxRoundTime: widget.group.maxRoundTime,
                      virtualPlayerLevel: widget.group.virtualPlayerLevel,
                      visibility: widget.group.gameVisibility,
                      backgroundColor: theme.colorScheme.background,
                    ),
                    Spacer(),
                    CircularProgressIndicator(),
                    Spacer(flex: 2),
                    AppButton(
                      onPressed: () {
                        _onBack(context);
                      },
                      icon: Icons.keyboard_arrow_left_sharp,
                      text: CANCEL_REQUEST,
                    )
                  ],
                ),
              ),
            ),
          ),
        ),
        backgroundColor: theme.colorScheme.background,
      ),
      onWillPop: () => _onBack(context),
    );
  }

  Future<bool> _onBack(BuildContext context) {
    getIt
        .get<GroupJoinService>()
        .handleCancelJoinRequest(widget.group.groupId!);
    Navigator.pop(context);
    return Future.value(true);
  }
}
