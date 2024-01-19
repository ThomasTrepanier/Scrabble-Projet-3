import 'dart:async';

import 'package:flutter/material.dart';
import 'package:mobile/classes/game/game-config.dart';
import 'package:mobile/classes/group.dart';
import 'package:mobile/classes/user.dart';
import 'package:rxdart/rxdart.dart';

import '../components/alert-dialog.dart';
import '../components/app_button.dart';
import '../constants/create-lobby-constants.dart';
import '../constants/join-group.constants.dart';
import '../routes/routes.dart';

BehaviorSubject<List<Group>> groups$ = BehaviorSubject.seeded([]);

Stream<List<Group>> get groupStream {
  return groups$.doOnData((List<Group> groups) {
    for (Group group in groups) {
      group.canJoin = group.users.length < MAX_PLAYER_COUNT;
    }
  });
}

Subject<Group> currentGroupUpdate$ = PublishSubject();
Stream<Group> get currentGroupUpdateStream => currentGroupUpdate$.stream;

void handleGroupsUpdate(dynamic newGroupsJson) {
  List<Group> receivedGroups = List<Group>.from(
      newGroupsJson.map((dynamic group) => Group.fromJson(group)).toList());
  groups$.add(receivedGroups);
}

Subject<PublicUser> rejectedJoinRequest$ = PublishSubject();
Stream<PublicUser> get rejectedStream => rejectedJoinRequest$.stream;

Subject<PublicUser> canceledGroup$ = PublishSubject();
Stream<PublicUser> get canceledStream => canceledGroup$.stream;

Stream<InitializeGameData> get startGameEvent => startGame$.stream;
Subject<InitializeGameData> startGame$ = PublishSubject();

Stream<InitializeGameData> get replaceVirtualPlayerEvent$ =>
    replaceVirtualPlayer$.stream;
Subject<InitializeGameData> replaceVirtualPlayer$ = PublishSubject();

Subject<bool> fullGroup$ = PublishSubject();
Stream<bool> get fullGroupStream => fullGroup$.stream;

Subject<int> changeObservedPlayer$ = PublishSubject();
Stream<int> get changeObservedPlayerStream => changeObservedPlayer$.stream;

Subject<bool> isObservingVirtualPlayer$ = PublishSubject();
Stream<bool> get isObservingVirtualPlayerStream =>
    isObservingVirtualPlayer$.stream;

void handleCanceledGame(PublicUser host, BuildContext context) {
  Navigator.popUntil(context, ModalRoute.withName(GROUPS_ROUTE));
  Navigator.pushReplacementNamed(context, GROUPS_ROUTE);

  triggerDialogBox(GAME_CANCELED, [
    Text("${host.username} a annulé la partie")
  ], [
    DialogBoxButtonParameters(
      content: 'OK',
      closesDialog: true,
      theme: AppButtonTheme.primary,
    )
  ]);
}

void handleFullGroup(bool isFull, context) {
  Navigator.popUntil(context, ModalRoute.withName(GROUPS_ROUTE));
  Navigator.pushReplacementNamed(context, GROUPS_ROUTE);

  triggerDialogBox(GAME_STARTED, [
    Text(GAME_STARTED_MESSAGE)
  ], [
    DialogBoxButtonParameters(
      closesDialog: true,
      content: 'OK',
      theme: AppButtonTheme.primary,
    )
  ]);
}

void handleGameStarted(PublicUser host, context) {
  Navigator.popUntil(context, ModalRoute.withName(GROUPS_ROUTE));
  Navigator.pushReplacementNamed(context, GROUPS_ROUTE);

  triggerDialogBox(GAME_STARTED, [
    Text(GAME_STARTED_MESSAGE)
  ], [
    DialogBoxButtonParameters(
      content: 'OK',
      closesDialog: true,
      theme: AppButtonTheme.primary,
    ),
  ]);
}
