// ignore_for_file: prefer_const_constructors

import 'package:flutter/material.dart';
import 'package:mobile/components/create-account-form.dart';
import 'package:mobile/components/scaffold-persistance.dart';

class CreateAccountPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MyScaffold(
      title: "Création d'un compte",
      showChat: false,
      body: SingleChildScrollView(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Center(
              child: Column(
                children: [CreateAccountForm()],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
