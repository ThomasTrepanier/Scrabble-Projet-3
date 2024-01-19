// ignore_for_file: prefer_const_constructors

import 'package:flutter/material.dart';
import 'package:mobile/classes/account.dart';
import 'package:mobile/classes/text-field-handler.dart';
import 'package:mobile/components/avatar-field.dart';
import 'package:mobile/constants/layout.constants.dart';
import 'package:mobile/locator.dart';
import 'package:mobile/routes/routes.dart';
import 'package:mobile/services/theme-color-service.dart';
import 'package:rxdart/rxdart.dart';

import '../constants/create-account-constants.dart';
import '../controllers/account-authentification-controller.dart';
import 'app_button.dart';

class CreateAccountForm extends StatefulWidget {
  @override
  CreateAccountFormState createState() => CreateAccountFormState();
}

@visibleForTesting
class CreateAccountFormState extends State<CreateAccountForm> {
  bool isPasswordShown = false;
  bool isFirstSubmit = true;
  bool get isButtonEnabled => isFirstSubmit || isFormValid();
  Color themeColor =
      getIt.get<ThemeColorService>().themeDetails.value.color.colorValue;
  AccountAuthenticationController accountController =
      getIt.get<AccountAuthenticationController>();

  final emailHandler = TextFieldHandler();
  final usernameHandler = TextFieldHandler();
  final passwordHandler = TextFieldHandler();
  final passwordMatchHandler = TextFieldHandler();
  final avatarHandler = TextFieldHandler();
  final avatarSrc = BehaviorSubject<String?>();
  final avatarError = BehaviorSubject<String?>();

  @override
  void initState() {
    super.initState();

    emailHandler.addListener(validateEmail);
    usernameHandler.addListener(validateUsername);
    passwordHandler.addListener(validatePassword);
    passwordMatchHandler.addListener(validatePasswordMatch);
  }

  @override
  void dispose() {
    usernameHandler.dispose();
    passwordHandler.dispose();
    passwordMatchHandler.dispose();
    emailHandler.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: EdgeInsets.symmetric(vertical: SPACE_3),
        child: Column(
          children: [
            Container(
              width: 600,
              constraints: BoxConstraints(minHeight: 540),
              child: Card(
                child: Padding(
                  padding: EdgeInsets.all(SPACE_2),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Wrap(
                        runSpacing: SPACE_2,
                        children: [
                          TextField(
                            controller: emailHandler.controller,
                            focusNode: emailHandler.focusNode,
                            obscureText: false,
                            keyboardType: TextInputType.emailAddress,
                            decoration: InputDecoration(
                              border: OutlineInputBorder(),
                              labelText: EMAIL_LABEL_FR,
                              errorText: emailHandler.errorMessage.isEmpty
                                  ? null
                                  : emailHandler.errorMessage,
                            ),
                          ),
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
                          SizedBox(
                            height: SPACE_1,
                            width: double.maxFinite,
                          ),
                          TextField(
                            controller: passwordHandler.controller,
                            focusNode: passwordHandler.focusNode,
                            keyboardType: TextInputType.visiblePassword,
                            autocorrect: false,
                            enableSuggestions: false,
                            obscureText: !isPasswordShown,
                            decoration: InputDecoration(
                              border: OutlineInputBorder(),
                              labelText: PASSWORD_LABEL_FR,
                              errorText: passwordHandler.errorMessage.isEmpty
                                  ? null
                                  : passwordHandler.errorMessage,
                            ),
                          ),
                          TextField(
                            controller: passwordMatchHandler.controller,
                            focusNode: passwordMatchHandler.focusNode,
                            autocorrect: false,
                            keyboardType: TextInputType.visiblePassword,
                            enableSuggestions: false,
                            obscureText: !isPasswordShown,
                            decoration: InputDecoration(
                              border: OutlineInputBorder(),
                              labelText: PASSWORD_MATCH_LABEL_FR,
                              helperText: PASSWORD_HELPER_TEXT_FR,
                              helperMaxLines: 3,
                              errorText:
                                  passwordMatchHandler.errorMessage.isEmpty
                                      ? null
                                      : passwordMatchHandler.errorMessage,
                            ),
                          ),
                          CheckboxListTile(
                            title: Text(CHECKBOX_SHOW_PASSWORD_LABEL_FR),
                            value: isPasswordShown,
                            onChanged: (bool? value) {
                              setState(() {
                                isPasswordShown = value!;
                              });
                            },
                            controlAffinity: ListTileControlAffinity.leading,
                          ),
                          SizedBox(
                            height: SPACE_2,
                            width: double.maxFinite,
                          ),
                          AvatarField(
                              avatar: avatarSrc, avatarError: avatarError),
                          SizedBox(
                            height: SPACE_2,
                            width: double.maxFinite,
                          ),
                        ],
                      ),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          AppButton(
                              onPressed: () {
                                Navigator.pushReplacementNamed(
                                    context, LOGIN_ROUTE);
                              },
                              theme: AppButtonTheme.secondary,
                              text: REDIRECT_LOGIN_LABEL_FR),
                          AppButton(
                              onPressed: isButtonEnabled
                                  ? () => createAccount()
                                  : null,
                              text: CREATE_ACCOUNT_LABEL_FR),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  bool isFormValid() {
    return emailHandler.isValid() &&
        usernameHandler.isValid() &&
        passwordHandler.isValid() &&
        passwordMatchHandler.isValid();
  }

  void validatePassword() {
    if (!validatePasswordStructure(passwordHandler.controller.text)) {
      setState(() {
        passwordHandler.errorMessage = PASSWORD_INVALID_FORMAT_FR;
      });
    } else {
      validatePasswordMatch();
    }
  }

  void validatePasswordMatch() {
    if (passwordHandler.controller.text !=
        passwordMatchHandler.controller.text) {
      setState(() {
        passwordMatchHandler.errorMessage = PASSWORD_NOT_MATCHING_FR;
      });
    } else {
      setState(() {
        passwordMatchHandler.errorMessage = "";
      });
    }
  }

  Future<void> validateEmail() async {
    if (emailHandler.controller.text.isEmpty) {
      setState(() {
        emailHandler.errorMessage = EMAIL_EMPTY_FR;
      });
    } else if (!validateEmailStructure(emailHandler.controller.text)) {
      setState(() {
        emailHandler.errorMessage = EMAIL_INVALID_FORMAT_FR;
      });
    } else if (!await accountController
        .isEmailUnique(emailHandler.controller.text.trim())) {
      setState(() {
        emailHandler.errorMessage = EMAIL_ALREADY_USED_FR;
      });
    } else {
      setState(() {
        emailHandler.errorMessage = "";
      });
    }
  }

  Future<void> validateUsername() async {
    if (usernameHandler.controller.text.isEmpty) {
      setState(() {
        usernameHandler.errorMessage = USERNAME_EMPTY_FR;
      });
    } else if (!validateUsernameStructure(usernameHandler.controller.text)) {
      setState(() {
        usernameHandler.errorMessage = USERNAME_INVALID_FORMAT_FR;
      });
    } else if (!await accountController
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

  Future<void> createAccount() async {
    avatarError.add(null);
    setState(() {
      isFirstSubmit = false;
    });
    if (!isFormValid()) {
      return;
    }
    if (avatarSrc.valueOrNull == null) {
      avatarError.add('Veuillez choisir un avatar');
      return;
    }
    Account newAccount = Account(
        username: usernameHandler.controller.text,
        password: passwordHandler.controller.text,
        email: emailHandler.controller.text,
        avatar: avatarSrc.value!);
    if (await accountController.createAccount(newAccount)) {
      Navigator.pushNamed(context, HOME_ROUTE);
    } else {
      validateUsername();
      validateEmail();
      showDialog<String>(
        context: context,
        builder: (BuildContext context) => AlertDialog(
          title: const Text(ACCOUNT_CREATION_DIALOG_TITLE_FR),
          content: const Text(ACCOUNT_CREATION_DIALOG_ERROR_FR),
          actions: <Widget>[
            TextButton(
              onPressed: () => Navigator.pop(context, 'OK'),
              child: const Text(ACCOUNT_CREATION_DIALOG_RETURN_FR),
            ),
          ],
        ),
      );
    }
  }

  bool validatePasswordStructure(String value) {
    RegExp regExp = RegExp(PASSWORD_REGEX_PATTERN);
    return regExp.hasMatch(value);
  }

  bool validateEmailStructure(String value) {
    RegExp regExp = RegExp(EMAIL_REGEX_PATTERN);
    return regExp.hasMatch(value.trim());
  }

  bool validateUsernameStructure(String value) {
    RegExp regExp = RegExp(USERNAME_REGEX_PATTERN);
    return regExp.hasMatch(value);
  }
}
