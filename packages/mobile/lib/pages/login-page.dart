import 'package:flutter/material.dart';
import 'package:mobile/components/scaffold-persistance.dart';
import 'package:mobile/controllers/account-authentification-controller.dart';
import 'package:mobile/locator.dart';

import '../components/image.dart';
import '../components/login-form.dart';
import '../constants/login-constants.dart';
import '../services/theme-color-service.dart';

class LoginPage extends StatefulWidget {
  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  @override
  void initState() {
    getIt.get<AccountAuthenticationController>().signOut();
    getIt.get<ThemeColorService>().themeDetails.add(setTheme(ThemeColor.green));

    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return MyScaffold(
        title: 'Se connecter',
        showChat: false,
        body: SingleChildScrollView(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              Center(
                child: Column(
                  children: [LoginForm()],
                ),
              ),
            ],
          ),
        ));
  }
}
