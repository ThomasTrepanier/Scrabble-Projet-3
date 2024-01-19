import 'package:flutter/material.dart';
import 'package:mobile/classes/text-field-handler.dart';
import 'package:mobile/classes/user.dart';
import 'package:mobile/components/app_button.dart';
import 'package:mobile/components/avatar-field.dart';
import 'package:mobile/components/scaffold-persistance.dart';
import 'package:mobile/constants/create-account-constants.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/controllers/account-authentification-controller.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/services/user.service.dart';
import 'package:rxdart/rxdart.dart';

import '../routes/routes.dart';

class ProfileEditPage extends StatefulWidget {
  @override
  State<StatefulWidget> createState() => ProfileEditPageState();
}

class ProfileEditPageState extends State<ProfileEditPage> {
  AccountAuthenticationController _accountController =
      getIt.get<AccountAuthenticationController>();
  UserService _userService = getIt.get<UserService>();

  bool isFirstSubmit = true;

  final usernameHandler = TextFieldHandler();
  final avatarSrc = BehaviorSubject<String?>();
  final avatarError = BehaviorSubject<String?>();

  @override
  void initState() {
    super.initState();
    usernameHandler.addListener(validateUsername);
    usernameHandler.controller.text = _userService.getUser().username;
    avatarSrc.add(_userService.getUser().avatar);
  }

  @override
  void dispose() {
    usernameHandler.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MyScaffold(
      title: 'Modifier mon profile',
      body: SingleChildScrollView(
          child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Center(
            child: Column(children: [
              SafeArea(
                  child: Padding(
                padding: EdgeInsets.all(SPACE_3),
                child: Column(children: [
                  Container(
                    width: 600,
                    child: Card(
                        child: Padding(
                      padding: EdgeInsets.all(SPACE_2),
                      child: Wrap(
                        runSpacing: SPACE_4,
                        children: [
                          TextField(
                            controller: usernameHandler.controller,
                            focusNode: usernameHandler.focusNode,
                            obscureText: false,
                            decoration: InputDecoration(
                              border: OutlineInputBorder(),
                              labelText: USERNAME_LABEL_FR,
                              errorText: usernameHandler.errorMessage.isEmpty
                                  ? null
                                  : usernameHandler.errorMessage,
                            ),
                          ),
                          AvatarField(
                              avatar: avatarSrc, avatarError: avatarError),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.end,
                            children: [
                              Wrap(
                                spacing: SPACE_2,
                                children: [
                                  AppButton(
                                    onPressed: () => Navigator.pop(context),
                                    text: 'Annuler',
                                    theme: AppButtonTheme.secondary,
                                  ),
                                  AppButton(
                                    onPressed: () => updateAccount(context),
                                    text: 'Modifier',
                                  )
                                ],
                              )
                            ],
                          )
                        ],
                      ),
                    )),
                  )
                ]),
              ))
            ]),
          )
        ],
      )),
    );
  }

  Future<void> updateAccount(BuildContext context) async {
    avatarError.add(null);

    setState(() {
      isFirstSubmit = false;
    });

    await validateUsername();

    if (!usernameHandler.isValid()) return;

    if (avatarSrc.valueOrNull == null) {
      avatarError.add('Veuillez choisir un avatar');
    }

    try {
      await _userService.editUser(EditableUserFields(
          username: usernameHandler.controller.text, avatar: avatarSrc.value!));
      if (context.mounted) {
        Navigator.pop(context);
        Navigator.pushReplacementNamed(context, PROFILE_ROUTE,
            arguments: _userService.getUser());
      }
    } catch (e) {
      if (context.mounted) {
        showDialog(
            context: context,
            builder: (context) => AlertDialog(
                  title: Text(PROFILE_EDIT_DIALOG_ERROR_TITLE),
                  content: const Text(PROFILE_EDIT_DIALOG_ERROR_BODY),
                  actions: <Widget>[
                    TextButton(
                      onPressed: () => Navigator.pop(context, 'OK'),
                      child: const Text('Ok'),
                    ),
                  ],
                ));
      }
    }
  }

  Future<void> validateUsername() async {
    if (usernameHandler.controller.text == _userService.getUser().username) {
      setState(() {
        usernameHandler.errorMessage = "";
      });

      return;
    }

    if (usernameHandler.controller.text.isEmpty) {
      setState(() {
        usernameHandler.errorMessage = USERNAME_EMPTY_FR;
      });
    } else if (!validateUsernameStructure(usernameHandler.controller.text)) {
      setState(() {
        usernameHandler.errorMessage = USERNAME_INVALID_FORMAT_FR;
      });
    } else if (!await _accountController
        .isUsernameUnique(usernameHandler.controller.text)) {
      setState(() {
        usernameHandler.errorMessage = USERNAME_ALREADY_USED_FR;
      });
    } else {
      setState(() {
        usernameHandler.errorMessage = "";
      });
    }
  }

  bool validateUsernameStructure(String value) {
    RegExp regExp = RegExp(USERNAME_REGEX_PATTERN);
    return regExp.hasMatch(value);
  }
}
