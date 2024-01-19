// ignore_for_file: non_constant_identifier_names

import 'package:flutter/material.dart';

import '../constants/erros/game-visibility-errors.dart';

enum GameVisibility {
  public,
  private,
  protected;

  String get visibilityName {
    return GAME_VISIBILITY_TO_NAME[this] != null
        ? GAME_VISIBILITY_TO_NAME[this]!
        : '';
  }

  IconData get icon {
    return GAME_VISIBILITY_TO_ICON[this] != null
        ? GAME_VISIBILITY_TO_ICON[this]!
        : Icons.question_mark;
  }

  String get description {
    return GAME_VISIBILITY_DESCRIPTION[this] != null
        ? GAME_VISIBILITY_DESCRIPTION[this]!
        : '';
  }

  static GameVisibility fromString(String value) {
    return GameVisibility.values.firstWhere((GameVisibility gameVisibility) =>
        gameVisibility.visibilityName.toLowerCase() == value.toLowerCase());
  }

  static GameVisibility fromInteger(int value) {
    return GameVisibility.values[value];
  }

  static GameVisibility fromJson(dynamic value) {
    if (value is String) {
      return GameVisibility.fromString(value);
    } else if (value is int) {
      return GameVisibility.fromInteger(value);
    }
    throw Exception(NO_JSON_VALUE_MATCH);
  }
}

final Map<GameVisibility, String> GAME_VISIBILITY_TO_NAME = {
  GameVisibility.public: 'Publique',
  GameVisibility.protected: 'Protégée',
  GameVisibility.private: 'Privée',
};

final Map<GameVisibility, IconData> GAME_VISIBILITY_TO_ICON = {
  GameVisibility.public: Icons.public,
  GameVisibility.private: Icons.lock,
  GameVisibility.protected: Icons.shield
};

final Map<GameVisibility, String> GAME_VISIBILITY_DESCRIPTION = {
  GameVisibility.public: 'Partie publique',
  GameVisibility.private: 'Partie privée',
  GameVisibility.protected: 'Partie protégée par mot de passe',
};
