// ignore_for_file: non_constant_identifier_names

import 'package:flutter/material.dart';
import 'package:mobile/classes/game-visibility.dart';
import 'package:mobile/components/app-toggle-button.dart';

class GameVisibilityToggle extends AppToggleOption {
  final String id;
  final IconData icon;
  final GameVisibility nameEnum;
  final String description;

  GameVisibilityToggle({
    required this.id,
    required this.nameEnum,
    required this.icon,
    required this.description,
  });

  String get name => GAME_VISIBILITY_TO_NAME[nameEnum] ?? 'Inconnu';

  @override
  String getEnumName() {
    return nameEnum.name;
  }

  @override
  Enum getEnum() {
    return nameEnum;
  }
}

final GameVisibilityToggle publicToggle = GameVisibilityToggle(
  id: '1',
  nameEnum: GameVisibility.public,
  icon: GameVisibility.public.icon,
  description: GameVisibility.public.description,
);

final GameVisibilityToggle protectedToggle = GameVisibilityToggle(
  id: '2',
  nameEnum: GameVisibility.protected,
  icon: GameVisibility.protected.icon,
  description: GameVisibility.protected.description,
);

final GameVisibilityToggle privateToggle = GameVisibilityToggle(
  id: '3',
  nameEnum: GameVisibility.private,
  icon: GameVisibility.private.icon,
  description: GameVisibility.private.description,
);

final Map<GameVisibility, GameVisibilityToggle> VISIBILITY_LEVELS = {
  GameVisibility.public: publicToggle,
  GameVisibility.protected: protectedToggle,
  GameVisibility.private: privateToggle,
};

GameVisibilityToggle getVisibilityFromIndex(int index) {
  if (index < 0 ||
      GAME_VISIBILITY_TO_NAME.isEmpty ||
      index >= GAME_VISIBILITY_TO_NAME.values.length) {
    return publicToggle;
  }

  return VISIBILITY_LEVELS.values.toList()[index];
}

GameVisibilityToggle getVisibilityFromName(GameVisibilityToggle name) {
  return VISIBILITY_LEVELS[name] ?? publicToggle;
}
