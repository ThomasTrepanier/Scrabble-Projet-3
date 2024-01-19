import 'dart:async';

import 'package:flutter/material.dart';
import 'package:mobile/routes/routes.dart';
import 'package:rxdart/rxdart.dart';

import '../../classes/group.dart';
import '../../classes/text-field-handler.dart';
import '../../classes/user.dart';
import '../../constants/create-account-constants.dart';
import '../../constants/join-game.constants.dart';
import '../../constants/join-group.constants.dart';
import '../../locator.dart';
import '../../services/group-join.service.dart';
import '../../view-methods/group.methods.dart';
import '../app_button.dart';

void showGamePasswordPopup(BuildContext context, Group group,
    Function joinGroupFunction, bool isObserver) {
  final BehaviorSubject<TextFieldHandler> passwordHandler =
      BehaviorSubject<TextFieldHandler>.seeded(TextFieldHandler());
  showDialog<String>(
      barrierDismissible: false,
      context: context,
      builder: (BuildContext context) => StreamBuilder(
          stream: passwordHandler.stream,
          builder: (context, _) {
            return PasswordDialog(
              passwordHandler: passwordHandler,
              group: group,
              joinGroupFunction: joinGroupFunction,
              isObserver: isObserver,
            );
          }));
}

class PasswordDialog extends StatefulWidget {
  const PasswordDialog({
    super.key,
    required this.passwordHandler,
    required this.joinGroupFunction,
    required this.group,
    required this.isObserver,
  });

  final BehaviorSubject<TextFieldHandler> passwordHandler;
  final Group group;
  final Function joinGroupFunction;
  final bool isObserver;

  @override
  State<PasswordDialog> createState() => _PasswordDialogState();
}

class _PasswordDialogState extends State<PasswordDialog> {
  late StreamSubscription canceledSubscription;
  late StreamSubscription fullGroupSubscription;
  late StreamSubscription gameStartedSubscription;

  @override
  void initState() {
    super.initState();

    canceledSubscription = canceledStream.listen((PublicUser host) {
      handleCanceledGame(host, context);
    });
    fullGroupSubscription = fullGroupStream.listen((isFull) {
      handleFullGroup(isFull, context);
    });
    gameStartedSubscription = rejectedStream.listen((PublicUser host) {
      handleGameStarted(host, context);
    });
  }

  @override
  void dispose() {
    super.dispose();
    canceledSubscription.cancel();
    fullGroupSubscription.cancel();
    gameStartedSubscription.cancel();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text(GAME_PASSWORD_LABEL_FR),
      content: TextField(
        controller: widget.passwordHandler.value.controller,
        focusNode: widget.passwordHandler.value.focusNode,
        keyboardType: TextInputType.visiblePassword,
        autocorrect: false,
        enableSuggestions: false,
        decoration: InputDecoration(
          prefixIcon: Icon(Icons.lock),
          border: OutlineInputBorder(),
          labelText: PASSWORD_LABEL_FR,
          errorText: widget.passwordHandler.value.errorMessage.isEmpty
              ? null
              : widget.passwordHandler.value.errorMessage,
        ),
      ),
      surfaceTintColor: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
      ),
      actions: <Widget>[
        AppButton(
          onPressed: () {
            Navigator.pop(context);
          },
          size: AppButtonSize.large,
          theme: AppButtonTheme.secondary,
          child: Wrap(children: [
            Icon(Icons.arrow_back),
            const Text(GO_BACK_GROUPS, style: TextStyle(fontSize: 18))
          ]),
        ),
        SizedBox(width: 30),
        AppButton(
          onPressed: () async {
            bool isValid = await widget.joinGroupFunction(
                widget.group.groupId,
                widget.passwordHandler.value.controller.text,
                widget.isObserver);
            if (isValid) {
              if (widget.isObserver) widget.group.numberOfObservers++;
              // ignore: use_build_context_synchronously
              Navigator.popAndPushNamed(context, JOIN_LOBBY_ROUTE,
                  arguments: widget.group);
            } else {
              widget.passwordHandler.value.errorMessage = INVALID_GAME_PASSWORD;
              widget.passwordHandler.add(widget.passwordHandler.value);
            }
          },
          size: AppButtonSize.large,
          child: Wrap(children: [
            const Text(JOIN_GAME_LABEL_FR,
                style: TextStyle(color: Colors.white, fontSize: 18)),
            Icon(
              Icons.play_arrow_outlined,
              color: Colors.white,
            ),
          ]),
        ),
      ],
      backgroundColor: Colors.white,
    );
  }
}

void handleLeave(String groupId) {
  getIt.get<GroupJoinService>().handleLeaveGroup(groupId);
}
