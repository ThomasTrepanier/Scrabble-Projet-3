// ignore_for_file: prefer_const_constructors

import 'package:flutter/material.dart';

import '../components/create-game/create-game-form.dart';
import '../components/scaffold-persistance.dart';

class CreateGamePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    ThemeData theme = Theme.of(context);
    return MyScaffold(
      title: "Création de partie",
      hasBackButton: true,
      body: SingleChildScrollView(
        child: Center(
          child: CreateGameForm(),
        ),
      ),
      backgroundColor: theme.colorScheme.background,
    );
  }
}
